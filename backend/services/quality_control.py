def evaluate_quality(
    status: str,
    severity_score: float,
    severity_level: str,
) -> dict:

 
    if status == "Normal":
        quality_decision = "Accept"
        recommended_action = "Ready for Dispatch"
        inspection_result = "PASS"


    elif severity_score >= 80:
        quality_decision = "Reject"
        recommended_action = "Scrap Product Immediately"
        inspection_result = "FAIL"

  
    elif severity_score >= 60:
        quality_decision = "Reject"
        recommended_action = "Reject Product"
        inspection_result = "FAIL"

 
    elif severity_score >= 40:
        quality_decision = "Manual Inspection"
        recommended_action = "Send for Manual QC"
        inspection_result = "PENDING REVIEW"

 
    else:
        quality_decision = "Rework"
        recommended_action = "Send for Rework"
        inspection_result = "FAIL"

    return {
        "quality_decision": quality_decision,
        "recommended_action": recommended_action,
        "inspection_status": "Completed",
        "inspection_result": inspection_result,
        "inspection_passed": inspection_result == "PASS",
    }