// MongoDB Database

// Use database
use("visioninspect_ai");

// Create inspection results collection
db.createCollection("inspection_results");

// Insert inspection data
db.inspection_results.insertMany([
  {
    inspection_id: 1,
    defect_type: "Scratch",
    anomaly_score: 0.95,
    recommended_action: "Reject"
  },
  {
    inspection_id: 2,
    defect_type: "Dent",
    anomaly_score: 0.82,
    recommended_action: "Rework"
  },
  {
    inspection_id: 3,
    defect_type: "No Defect",
    anomaly_score: 0.04,
    recommended_action: "Accept"
  }
]);

// Display all data
db.inspection_results.find();