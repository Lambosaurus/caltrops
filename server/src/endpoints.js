const { HTTPError } = require("./util");
const Services = require("./services")
const Signature = require("./signature")

const CALTROPS_PSK = process.env.caltrops_psk
const SUPPORT_EMAIL = process.env.support_email
const CALTROPS_URL = process.env.caltrops_url

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function testHandler(body, token, params) {
  return {
    message: "ok",
    user: token?.user
  }
}

async function registerHandler(body, token, params) {
  if (!body || !body.user || !EMAIL_REGEX.test(body.user)) {
    throw new HTTPError(400, "Invalid user")
  }

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
    throw new HTTPError(500, "Email send failure", error.toString())
  }
  
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
  }
]

exports.endpoints = endpoints