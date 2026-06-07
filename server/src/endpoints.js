const { HTTPError } = require("./util");
const Services = require("./services")
const Signature = require("./signature")

const CALTROPS_PSK = process.env.caltrops_psk
const SUPPORT_EMAIL = process.env.support_email
const CALTROPS_URL = process.env.caltrops_url

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const CONTENT_PATH_REGEX = /^([a-zA-Z0-9_]+\/)*[a-zA-Z0-9_]+$/

function isString(item) {
  return typeof item === 'string' && item.length > 0
}

function requireLogin(token) {
  if (!isString(token?.user))
    throw new HTTPError(401, "Unauthorised")
}

function requireAdmin(token) {
  if (token?.role !== "admin")
    throw new HTTPError(401, "Unauthorised")
}

function requireUser(user) {
  if (!(isString(user) && EMAIL_REGEX.test(user)))
    throw new HTTPError(400, "Invalid user")
}

function requireGUID(id) {
  if (!(isString(id) && GUID_REGEX.test(id)))
    throw new HTTPError(400, "Invalid id")
}

function requireType(type) {
  if (!isString(type))
    throw new HTTPError(400, "Invalid type")
}

function requirePath(path) {
  if (path === undefined)
    return
  if (!(isString(path) && CONTENT_PATH_REGEX.test(path)))
    throw new HTTPError(400, "Invalid path")
}

function isPathInScope(scope, path) {
  if (!scope) // scope === undefined || scope === ""
    return true
  return path && (path === scope || path.startsWith(scope + "/"))
}

function acceptShareToken(token, user, id, path) {
  // This allows us to act as another owner
  // We check the share token is valid, and is scoped correctly

  if (!token)
    return user
  
  if (isString(token)) {
    token = Signature.decode(token, CALTROPS_PSK)

    if (   token
        && isString(token.from)
        && (token.to === undefined || token.to === user)
        && (token.document === undefined || token.document === id)
        && isPathInScope(token.path, path)
    )
      return token.from
  }
  throw new HTTPError(401, "Unauthorised")
}


function testHandler(body, token, params) {
  return {
    message: "ok",
    user: token?.user,
    role: token?.role,
  }
}

async function registerHandler(body, token, params) {

  requireUser(body.user)

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
  
  await Services.sendEmail(body.user, "Caltrops registration", text);
}

function signHandler(body, token, params) {
  requireAdmin(token)
  return {
    token: Signature.encode(body, CALTROPS_PSK)
  }
}

async function getDocumentHandler(body, token, params) {
  let content = await Services.readDocument(params.id)
  if (!content)
    throw new HTTPError(404, "Document not found")
  return content
}

async function putDocumentHandler(body, token, params) {
  requireLogin(token)
  requireGUID(params.id)
  requireType(body.type)

  let success = await Services.putDocument(params.id, token.user, body.title, body.type, body.content)
  if (!success)
    throw new HTTPError(401, "Unauthorised")
}

async function patchDocumentHandler(body, token, params) {
  requireLogin(token)
  requirePath(body.path)

  const user = acceptShareToken(body.token, token.user, params.id, body.path)

  let success = await Services.updateDocument(params.id, user, body.content, body.path)
  if (!success)
    throw new HTTPError(401, "Unauthorised")
}

async function deleteDocumentHandler(body, token, params) {
  requireLogin(token)

  let success = await Services.deleteDocument(params.id, token.user)
  if (!success)
    throw new HTTPError(401, "Unauthorised")
}

async function shareDocumentHandler(body, token, params) {
  requireLogin(token)
  requirePath(body.path)
  requireUser(body.user)

  let token_body = {
    to: body.user,
    from: token.user,
    document: params.id,
    path: body.path,
  }

  return {
    token: Signature.encode(token_body, CALTROPS_PSK)
  }
}

async function listDocumentHandler(body, token, params) {
  requireLogin(token)
  return await Services.listDocuments(token.user, params.type)
}

async function usersHandler(body, token, params) {
  requireAdmin(token)
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
    method: "PUT",
    pattern: "documents/{id}",
    handler: putDocumentHandler
  },
  {
    method: "PATCH",
    pattern: "documents/{id}",
    handler: patchDocumentHandler
  },
  {
    method: "DELETE",
    pattern: "documents/{id}",
    handler: deleteDocumentHandler
  },
  {
    method: "POST",
    pattern: "documents/{id}/share",
    handler: shareDocumentHandler
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