import asyncio
import httpx

async def test_endpoint():
    async with httpx.AsyncClient() as client:
        data = {
            "name": "Test Special",
            "price": "50",
            "description": "A delicious special",
            "category": "special",
            "is_available": "true"
        }
        # simulate the multipart/form-data
        response = await client.post(
            "http://localhost:8000/owner/canteens/48b098ba-cc29-4989-b1ad-b0be0b41287a/specials",
            data=data
        )
        print("Status:", response.status_code)
        print("Response:", response.json())

if __name__ == "__main__":
    asyncio.run(test_endpoint())
