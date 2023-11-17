from fastapi import FastAPI

api = FastAPI()

@api.get("/")
def ping():
    return {"status": "ok"}
