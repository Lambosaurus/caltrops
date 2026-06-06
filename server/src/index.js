
const Signature = require("./signature")
const Endpoints = require("./endpoints")
const { HTTPError } = require("./util");


const CALTROPS_PSK = process.env.caltrops_psk;
const URI_MOUNTPOINT = process.env.uri_mountpoint;


function matchPattern(pattern, components) {
  const parts = pattern.split("/")
  if (parts.length != components.length)
    return null;

  let params = {}
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const component = components[i]
    if (part.length && part[0] == '{') {
      params[part.slice(1,-1)] = component
    }
    else if (part != component) {
      return null
    }
  }
  return params;
}

async function dispatch(method, path, token, body, params) {
  const components = path.split("/")
  for (let endpoint of Endpoints.endpoints) {
    if (method != endpoint.method)
      continue;
    const path_params = matchPattern(endpoint.pattern, components)
    if (path_params != null) {
      Object.assign(params, path_params)
      return await endpoint.handler(body, token, params)
    }
  }
  throw new HTTPError(404, "Not found", `Endpoint invalid ${method} '${path}'`)
}

function parseToken(token) {
  if (!token)
    return {}
  if (token.startsWith("Bearer ")) {
    let result = Signature.decode(token.slice(7), CALTROPS_PSK)
    if (result?.user)
      return result
  }
  throw new HTTPError(401, "Unauthorised", "Token validation failed")
}

function parseBody(text) {
  if (!text)
    return null;
  try {
    return JSON.parse(text)
  }
  catch (error) {
    throw new HTTPError(400, "JSON Parse failure", error)
  }
}

export const handler = async (event) => {
  const method = event.requestContext.http.method;

  if (method == "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Methods": "POST,OPTIONS", 
          "Access-Control-Allow-Headers": "*", 
      }
    }
  }

  try {
    const body = parseBody(event.body)
    const path = event.rawPath.slice(URI_MOUNTPOINT.length)
    const params = event.queryStringParameters ?? {}
    const token = parseToken(event.headers?.authorization)
    
    const result = await dispatch(method, path, token, body, params)

    if (result) {
      return {
        statusCode: 200,
        body: result,
        headers: { 'Content-Type': 'application/json' },
      }
    }
    return {
      statusCode: 200
    }
  }
  catch (error) {
    if (error instanceof HTTPError) {
      return {
        statusCode: error.code,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: error.message,
          detail: error.detail
        }
      }
    }
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: "Internal server error",
        detail: error.toString()
      }
    }
  }
};

