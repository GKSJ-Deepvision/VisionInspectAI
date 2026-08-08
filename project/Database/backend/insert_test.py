from services.inference_log_service import save_inference_result


result = save_inference_result(

    inspection_id=101,

    model_version="patchcore-wrn50-v1",

    anomaly_score=0.942,

    prediction="defective",

    heatmap_path="/uploads/heatmaps/101_heatmap.png",

    mask_path="/uploads/masks/101_mask.png",

    defects_detected=[
        {
            "bounding_box": {
                "x":120,
                "y":84,
                "width":40,
                "height":22
            },
            "defect_type":"scratch",
            "confidence":0.91,
            "severity_contribution":27.3
        }
    ],

    processing_time_ms=340
)


print("Inserted ID:")
print(result)