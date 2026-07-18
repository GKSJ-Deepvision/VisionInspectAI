from fastapi import FastAPI
from severity import router, calculate_severity
from prediction import predict_defect
from report import generate_report
from statistics import generate_statistics, update_statistics

app = FastAPI()

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI - Severity Score & Statistics Module"
    }


@app.get("/inspect")
def inspect(image_name: str):

    # Step 1: Predict defect
    prediction = predict_defect(image_name)

    # Step 2: Update statistics
    update_statistics(prediction["prediction"])

    # Step 3: Calculate severity
    severity = calculate_severity(prediction["anomaly_score"])

    # Step 4: Generate report
    report = generate_report(image_name)

    # Step 5: Get updated statistics
    statistics = generate_statistics()

    # Step 6: Return response
    return {
        "Prediction": prediction,
        "Severity": severity,
        "Inspection Report": report,
        "Statistics": statistics
    }