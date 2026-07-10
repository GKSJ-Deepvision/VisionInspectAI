# VisionInspect AI - Production Quality Analytics Summary Report
Generated automated audit logging output from system runs.

## 📊 1. Macro Production Summary KPIs
* **Total Manufacturing Volume Processed**: 250 items
* **Automated Product Acceptance Rate**: 50.0% (Low + Medium Severity items)
* **Average Computer Vision Model Inference Confidence**: 79.96%
* **Critical Component Halt Count (Immediate Rejections)**: 19

---

## 📈 2. Volumetric Breakdown of Component Status
| Severity Level | Threshold Limits | Captured Count | Operational Directive Required |
| :--- | :--- | :---: | :--- |
| 🔴 **Critical** | Score 80 - 100 | 19 | Reject Product & Trigger Quality Inspection Workflow |
| 🟠 **High** | Score 60 - 79 | 106 | Repair / Rework Recommended |
| 🟡 **Medium** | Score 40 - 59 | 115 | Inspection Review Required |
| 🟢 **Low** | Score 0 - 39 | 10 | Product Acceptable |

---

## 🔬 3. Granular Quality Failures by Defect Classification
| Defect_Type       |   Size_Score |   Location_Score |   Confidence_Score |   Severity_Score |
|:------------------|-------------:|-----------------:|-------------------:|-----------------:|
| Blister           |        61.29 |            53.1  |              81.29 |            60.61 |
| Contamination     |        48.03 |            52.05 |              80.42 |            59.55 |
| Missing Component |        58.15 |            53.11 |              79.26 |            70.04 |
| Surface Crack     |        52.11 |            51.8  |              79.8  |            65.54 |
| Surface Scratch   |        52.25 |            53.37 |              79.92 |            52.26 |
