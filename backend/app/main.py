from fastapi import FastAPI, File, UploadFile
from ml_model.predict import predict_defect
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home API
@app.get("/")
def home():
    return {"message": "VisionInspect AI Backend Running"}

# Upload API
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "status": "uploaded successfully"
    }
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_defect(file_location)

    return result