

class HTTPError extends Error {
    constructor(code, message, detail = undefined) {
        super(message);
        this.code = code;
        this.name = "HTTPError";
        this.detail = detail
    }
}

module.exports = {
  HTTPError,
}