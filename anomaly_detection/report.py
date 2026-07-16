import datetime

def generate_markdown_report(entry: dict) -> str:
    """
    Generates a professional Markdown Quality Inspection Report/Certificate 
    based on an inspection log entry.
    """
    verdict = "❌ FAIL (Defect Detected)" if entry["is_anomaly"] else "✅ PASS (Quality Approved)"
    verdict_color = "red" if entry["is_anomaly"] else "green"
    
    # Format warnings
    warnings_list = ""
    if entry["quality_report"]["warnings"]:
        for warning in entry["quality_report"]["warnings"]:
            warnings_list += f"- **Warning**: {warning}\n"
    else:
        warnings_list = "*No warnings. Image quality parameters were fully met.*"
        
    # Format severity breakdown
    breakdown = entry["severity_breakdown"]
    
    report_md = f"""# QUALITY INSPECTION CERTIFICATE
**VisionInspect AI - Smart Quality Assurance System**

---

## 📋 General Information
*   **Inspection ID**: `{entry["inspection_id"]}`
*   **Timestamp**: `{entry["timestamp"]}`
*   **Product Category**: `{entry["category"].upper()}`
*   **File Name**: `{entry["filename"]}`

---

## ⚖️ Inspection Verdict
<h3 style="color: {verdict_color};">{verdict}</h3>

*   **Anomaly Score**: `{entry["anomaly_score"]:.6f}`
*   **Decision Threshold**: `{entry["anomaly_score"]} / {entry["threshold"]}`

---

## 🔍 Image Quality Control (Stage 1)
*   **Blur Score (Sharpness)**: `{entry["quality_report"]["blur_score"]:.2f}` (Threshold: `> 100.0`)
*   **Lighting (Brightness)**: `{entry["quality_report"]["brightness"]:.2f}` (Acceptable Range: `40.0 - 230.0`)
*   **Contrast Index**: `{entry["quality_report"]["contrast"]:.2f}` (Threshold: `> 15.0`)
*   **Validation Verdict**: `{"VALID" if entry["quality_report"]["is_valid"] else "INVALID"}`

### Quality Alerts:
{warnings_list}

---

## 🧠 Defect Classification & Severity (Stage 2)
*   **Overall Severity Score**: `{entry["severity_score"]:.2f} / 100.0`
*   **Assigned Severity Level**: **`{entry["severity_level"]}`**
*   **Inferred Defect Type**: `{entry["inferred_defect_type"].replace('_', ' ').title()}`

### Severity Component Breakdown:
*   **Defect Size Index (30%)**: `{breakdown["size_score"]:.2f} / 100`
*   **Defect Location Score (25%)**: `{breakdown["location_score"]:.2f} / 100` (Center-weighted)
*   **Defect Type Score (25%)**: `{breakdown["type_score"]:.2f} / 100`
*   **Model Confidence Score (20%)**: `{breakdown["confidence_score"]:.2f} / 100`

---

## ⚙️ Recommended Action
> **{entry["recommended_action"]}**

---
<p style="font-size: 0.9em; color: gray; text-align: center;">
Generated automatically by VisionInspect AI System. Digital signature validated.
</p>
"""
    return report_md
