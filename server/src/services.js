
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, ScanCommand, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = "caltrops-sheets"

function timestamp() {
    return (new Date()).toISOString()
}

async function sendEmail(recipient, subject, body) {
    await ses.send(new SendEmailCommand({
        Destination: {
            ToAddresses: [recipient],
        },
        Message: {
            Body: {
                Text: {
                    Data: body,
                },
            },
            Subject: {
                Data: subject,
            },
        },
        Source: "noreply@tlembedded.com",
    }))
}

async function readDocument(id) {
    const response = await db.send( new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            id: id,
        },
    }))
    return response.Item ?? null
}

async function putDocument(id, owner, title, type, content) {
    const item = {
        id: id,
        owner: owner,
        title: title,
        type: type,
        content: content,
        time: timestamp()
    }
    try {
        await db.send( new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
            ConditionExpression: "attribute_not_exists(id) OR #o = :o",
            ExpressionAttributeNames: {
                "#o": "owner"
            },
            ExpressionAttributeValues: {
                ":o": owner
            }
        }))
        return true;
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException')
            return false;
        throw error;
    }
}

async function deleteDocument(id, owner) {
    try {
        await db.send( new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { 
                id: id, 
            },
            ConditionExpression: "#o = :o",
            ExpressionAttributeNames: {
                "#o": "owner"
            },
            ExpressionAttributeValues: {
                ":o": owner
            }
        }))
        return true;
    } catch (error) {
        if (error.name == "ConditionalCheckFailedException")
            return false;
        throw error
    }
}

async function listDocuments(owner, type = undefined)
{
    const params = {
        TableName: TABLE_NAME,
        IndexName: "owner-index",
        ScanIndexForward: false,
        KeyConditionExpression: "#o = :o",
        ExpressionAttributeValues: {
            ":o": owner,
        },
        ExpressionAttributeNames: {
            "#o": "owner",
        },
        Select: "ALL_PROJECTED_ATTRIBUTES",
    };

    if (type) {
        params.FilterExpression = "#t = :t";
        params.ExpressionAttributeNames["#t"] = "type";
        params.ExpressionAttributeValues[":t"] = type;
    }

    const response = await db.send(
        new QueryCommand(params)
    );
    return response.Items;
}

async function listUsers() {
    const response = await db.send( new ScanCommand({
        TableName: TABLE_NAME,
        IndexName: "owner-index",
        ProjectionExpression: "#o", 
        ExpressionAttributeNames: { 
            "#o": "owner" 
        }
    }))
    return [...new Set(response.Items.map(i => i.owner))]
}

exports.sendEmail = sendEmail
exports.readDocument = readDocument
exports.listUsers = listUsers
exports.listDocuments = listDocuments
exports.putDocument = putDocument
exports.deleteDocument = deleteDocument