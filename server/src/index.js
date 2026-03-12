const AWS = require('aws-sdk');
const Signature = require('./signature');

const db = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
const TABLE_NAME = 'caltrops-sheets';
const CALTROPS_PSK = process.env.caltrops_psk;
const SUPPORT_EMAIL = process.env.support_email;
const CALTROPS_URL = process.env.caltrops_url;

const HEADERS = {
    'Content-Type': 'application/json',
};

const OPTIONS_HEADERS = {
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
};

async function writeContent(uid, title, user, content) {
    const item = {
        "id": uid,
        "owner": user,
        "title": title,
        "content": content,
        "time": (new Date()).toISOString()
    };
    await db.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();
}

async function deleteContent(uid) {
    await db.delete({
        TableName: TABLE_NAME,
        Key: {
            id: uid,
        }
    }).promise();
}

async function canDelete(token, uid) {
    if (!token) { return false; }
    let item = await readContent(uid);
    return (item !== null) && (item.owner === token.user);
}

async function canWrite(token, uid) {
    if (!token) { return false; }
    let item = await readContent(uid);
    return (item === null) || (item.owner === token.user);
}

function canSign(token) {
    if (!token) { return false; }
    return !!token.signer;
}

function validateToken(token) {
    try {
        let payload = Signature.decode(token, CALTROPS_PSK);
        if (!payload.user) {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

async function listContent(user) {
    return (await db.query({
        TableName: TABLE_NAME,
        IndexName: "owner-index",
        KeyConditionExpression: "#o = :o",
        ExpressionAttributeValues: {
            ":o": user
        },
        ExpressionAttributeNames: {
            "#o": "owner"
        },
        Select: "ALL_PROJECTED_ATTRIBUTES"
    }).promise()).Items;
}

async function readContent(uid) {
    const response = await db.get({
        TableName: TABLE_NAME,
        Key: {
            id: uid,
        }
    }).promise();
    return response.Item ?? null;
}

function errorResponse(status, source, error = undefined) {
    return {
        statusCode: status,
        headers: HEADERS,
        body: {
            "error": error === undefined ? source : `${source}: ${error.toString()}`
        },
    };
}

async function sendEmail(recipient, subject, body) {
  const params = {
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: "noreply@tlembedded.com"
  };
  return ses.sendEmail(params).promise();
}

async function registrationRequest(recipient) {
    const payload = { user: recipient };
    const token = Signature.encode(payload, CALTROPS_PSK);

    let body = "";
    body += `Thanks for signing up to Caltrops.\n`;
    body += `\n`;
    body += `You can sign on using the following URL:\n`;
    body += `${CALTROPS_URL}?token=${encodeURIComponent(token)}\n`;
    body += `\n`;
    body += `Or you can paste the following token:\n`;
    body += `${token}\n`;
    body += `\n`;
    body += `If you believe there is something wrong with this email, you can contact me at ${SUPPORT_EMAIL}\n`;

    await sendEmail(recipient, "Caltrops registration", body);
}

exports.handler = async (event) => {

    let method = event.requestContext.http.method;
    if (method === "OPTIONS") {
        return {
            statusCode: 200,
            headers: OPTIONS_HEADERS
        };
    }
    else if (method !== "POST" ) {
        return errorResponse(405, `${method} not permitted`);
    }

    let body = null;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return errorResponse(400, "Error parsing body", error);
    }

    let token = null;
    if (body.token) {
        token = validateToken(body.token);
        if (!token) {
            return errorResponse(400, "Invalid token");
        }
    }

    let reply = {};

    if (body.write) {
        try {
            for (const info of body.write) {
                if (await canWrite(token, info.id)) {
                    await writeContent(info.id, info.title, token.user, info.content);
                } else {
                    return errorResponse(401, "Unauthorised");
                }
            }
        } catch (error) {
            return errorResponse(500, "Error writing content", error);
        }
    }

    if (body.read) {
        try {
            let read = [];
            for (const uid of body.read) {
                read.push(await readContent(uid));
            }
            reply.read = read;
        } catch (error) {
            return errorResponse(500, "Error reading content", error);
        }
    }

    if (body.delete) {
        try {
            for (const uid of body.delete) {
                if (await canDelete(token, uid)) {
                    await deleteContent(uid);
                } else {
                    return errorResponse(401, "Unauthorised"); 
                }
            }
        } catch (error) {
            return errorResponse(500, "Error deleting content", error);
        }
    }

    if (body.list) {
        if (!token) {
            return errorResponse(401, "Unauthorised");
        }
        try {
            let items = await listContent(token.user);
            reply.list = items.sort( (a,b) => b.time.localeCompare(a.time) );
        } catch (error) {
            return errorResponse(500, "Error listing content", error);
        }
    }

    if (body.sign) {
        if (!canSign(token)) {
            return errorResponse(401, "Unauthorised");
        }
        let signed = [];
        for (const item of body.sign) {
            signed.push( Signature.encode(item, CALTROPS_PSK) );
        }
        reply.sign = signed;
    }

    if (body.register) {
        try {
            await registrationRequest(body.register);
        } catch (error) {
            return errorResponse(500, "Error sending registration", error);
        }
    }

    const response = {
        statusCode: 200,
        headers: HEADERS,
        body: reply,
    };
    return response;
};
