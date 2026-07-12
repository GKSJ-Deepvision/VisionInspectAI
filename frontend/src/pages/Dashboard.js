import React, { useState } from "react";
import axios from "axios";

function Dashboard() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const predictImage = async () => {

    if (!file) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(response.data);

    } catch (error) {

      console.log(error);
      alert("Prediction Failed");

    }

  };

  return (

    <div style={{padding:"40px", textAlign:"center"}}>

      <h1>VisionInspect AI Dashboard</h1>

      <h3>Manufacturing Defect Detection System</h3>

      <br/>

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <br/><br/>

      <button
        onClick={predictImage}
        style={{
          padding:"10px 20px",
          backgroundColor:"#1E3C72",
          color:"white",
          border:"none",
          borderRadius:"5px",
          cursor:"pointer"
        }}
      >
        Detect Defect
      </button>

      <br/><br/>

      {result && (

        <div
          style={{
            border:"1px solid #ccc",
            borderRadius:"10px",
            padding:"20px",
            width:"350px",
            margin:"20px auto",
            boxShadow:"0px 3px 10px rgba(0,0,0,0.2)"
          }}
        >

          <h2>Prediction Result</h2>

          <p><strong>Defect:</strong> {result.prediction}</p>

          <p><strong>Confidence:</strong> {result.confidence}%</p>

          <p><strong>Severity:</strong> {result.severity}</p>

        </div>

      )}

    </div>

  );
}

export default Dashboard;