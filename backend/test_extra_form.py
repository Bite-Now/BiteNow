from fastapi import FastAPI, Form, UploadFile, File
import uvicorn
from fastapi.testclient import TestClient

app = FastAPI()

@app.post("/test")
async def test_endpoint(
    name: str = Form(...),
    price: float = Form(...),
    file: UploadFile = File(None)
):
    return {"name": name, "price": price}

client = TestClient(app)

response = client.post("/test", data={"name": "Test", "price": 50, "is_available": "true"})
print("Status Code:", response.status_code)
print("Response:", response.json())
