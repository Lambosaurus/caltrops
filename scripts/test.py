import requests


CALTROPS_URI = "https://caltrops.tlembedded.com/api/v1/"


class CaltropsApi():
    def __init__(self, token: str = None):
        self.token = token

    def read(self, id: str) -> dict:
        return self._post("read", [id])[0]
    
    def list(self, filter: str = "*") -> list:
        return self._post("list", filter, auth=True)
    
    def write(self, item: dict):
        self._post("write", [item], auth=True)

    def delete(self, id: str):
        self._post("delete", [id], auth=True)

    def sign(self, user: str, admin: bool = False):
        body = { "user": user }
        if admin:
            body["admin"] = True
        return self._post("sign", [body], auth=True)[0]
    
    def register(self, user: str):
        self._post("register", user)

    def _post(self, key: str, values: list, auth: bool = False) -> dict:
        request = {}
        if auth:
            if self.token == None:
                raise Exception(f"token required for {key} api")
            request["token"] = self.token
        request[key] = values
        response = requests.post(CALTROPS_URI, json=request)
        if response.status_code != 200:
            raise Exception(f"request failed with HTTP{response.status_code}")
        result = response.json()
        if key in result:
            return result[key]
        return None
    

if __name__ == "__main__":
    with open("./scripts/token.txt", 'r') as f:
        token = f.read()
    api = CaltropsApi(token)
    print(api.list("sheet"))