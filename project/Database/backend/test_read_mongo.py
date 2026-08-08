from services.inference_log_service import get_inference_result


inspection_id = 101

result = get_inference_result(inspection_id)


print(result)