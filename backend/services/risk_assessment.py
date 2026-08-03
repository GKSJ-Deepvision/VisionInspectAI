def assess_risk(cvrt_score):

    if cvrt_score <= 30:
        return {
            "risk_level": "Low",
            "action": "Accept Product"
        }

    elif cvrt_score <= 60:
        return {
            "risk_level": "Moderate",
            "action": "Manual Inspection Required"
        }

    elif cvrt_score <= 80:
        return {
            "risk_level": "High",
            "action": "Rework Product"
        }

    else:
        return {
            "risk_level": "Critical",
            "action": "Reject Product"
        }