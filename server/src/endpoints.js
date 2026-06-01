const { HTTPError } = require("./util");
const Services = require("./services")
const Signature = require("./signature")

const CALTROPS_PSK = process.env.caltrops_psk
const SUPPORT_EMAIL = process.env.support_email
const CALTROPS_URL = process.env.caltrops_url

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isAdmin(token) {
  return token && token.role == "admin"
}

function isUser(token) {
  return token && token.user
}

function testHandler(body, token, params) {
  return {
    message: "ok",
    user: token?.user,
    role: token?.role,
  }
}

async function registerHandler(body, token, params) {
  if (!body || !body.user || !EMAIL_REGEX.test(body.user))
    throw new HTTPError(400, "Invalid user")

  const new_token = Signature.encode({user: body.user}, CALTROPS_PSK)

  let text = "";
  text += `Thanks for signing up to Caltrops.\n`;
  text += `\n`;
  text += `You can sign on using the following URL:\n`;
  text += `${CALTROPS_URL}?token=${encodeURIComponent(new_token)}\n`;
  text += `\n`;
  text += `Or you can paste the following token:\n`;
  text += `${new_token}\n`;
  text += `\n`;
  text += `If you believe there is something wrong with this email, you can contact me at ${SUPPORT_EMAIL}\n`;
  
  try {
    await Services.sendEmail(body.user, "Caltrops registration", text);
  } catch (error) {
    throw new HTTPError(500, "Email send failure", error)
  }
}

function signHandler(body, token, params) {
  if (!body)
    throw new HTTPError(400, "No body")

  if (!isAdmin(token))
    throw new HTTPError(401, "Unauthorised")

  const new_token = Signature.encode(body, CALTROPS_PSK)
  return {
    token: new_token
  }
}

async function getDocumentHandler(body, token, params) {
  let content;
  try {
    content = await Services.readDocument(params.id)
  } catch (error) {
    throw new HTTPError(500, "DB Read error")
  }
  if (!content)
    throw new HTTPError(404, "Document not found")
  return content
}

async function listDocumentHandler(body, token, params) {
  if (!isUser(token))
    throw new HTTPError(401, "Unauthorised")

  try {
    return await Services.listDocuments(token.user)
  } catch (error) {
    throw new HTTPError(500, "DB Read error", error)
  }
}

async function usersHandler(body, token, params) {
  if (!isAdmin(token))
    throw new HTTPError(401, "Unauthorised")
  return await Services.listUsers()
}

const endpoints = [
  {
    method: "GET",
    pattern: "test",
    handler: testHandler,
  },
  {
    method: "POST",
    pattern: "register",
    handler: registerHandler
  },
  {
    method: "POST",
    pattern: "sign",
    handler: signHandler
  },
  {
    method: "GET",
    pattern: "documents/{id}",
    handler: getDocumentHandler
  },
  {
    method: "GET",
    pattern: "documents",
    handler: listDocumentHandler
  },
  {
    method: "GET",
    pattern: "users",
    handler: usersHandler
  },
]

exports.endpoints = endpoints