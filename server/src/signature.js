const crypto = require('crypto');

function trimB64(text) {
    return text.replace(/=*$/, '');
}

function sign(text, secret) {
    return trimB64(crypto.createHmac('sha256', secret).update(text).digest('base64'));
}

function encode(payload, secret) {
    const text = trimB64(btoa(JSON.stringify(payload)));
    const signature = sign(text, secret);
    return `${text}.${signature}`;
}

function decode(token, secret) {
    const components = token.split('.');
    if (components.length != 2)
        return null
    const [text, signature] = components
    const expected = sign(text, secret);
    if (trimB64(signature) === expected) {
        return JSON.parse(atob(text));
    }
    return null;
}

exports.encode = encode;
exports.decode = decode;