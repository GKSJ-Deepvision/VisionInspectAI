import requests


url = "http://127.0.0.1:5000/api/inspection"


data = {
    "filename": "test_image.jpg",
    "status": "defective",
    "score": 0.92,
    "user_id": 1
}


response = requests.post(
    url,
    json=data
)


print("Status Code:", response.status_code)
print("Response:")
print(response.text)