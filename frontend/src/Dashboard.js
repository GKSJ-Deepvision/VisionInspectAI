import { useState } from "react";
import "./Dashboard.css";

function Dashboard({ setIsLoggedIn,role }) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [inspectionResult, setInspectionResult] = useState(null);

    const handleFileChange = (e) => {

        const file = e.target.files[0];

        setSelectedFile(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {

        if (!selectedFile) {
            alert("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {

            const response = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            alert(data.message);

            console.log(data);

        } catch (error) {

            alert("Upload Failed");

            console.log(error);

        }
    };

    const startInspection = async () => {

        try {

            const response = await fetch("http://127.0.0.1:8000/inspect", {
                method: "POST"
            });

            const data = await response.json();

            setInspectionResult(data);

        } catch (error) {

            alert("Inspection Failed");

            console.log(error);

        }
    };

    return (

        <div className="dashboard">

            <div className="navbar">

               <div>
                    <h2>VisionInspect AI Dashboard</h2>
                    <p>Welcome, {role}</p>
                </div>

                <button
                    className="logout-btn"
                    onClick={() => setIsLoggedIn(false)}
                >
                    Logout
                </button>

            </div>

            <div className="content">

                {/* Upload Card */}

                <div className="card">

                    <h3>Upload Image</h3>

                    <p>Upload a product image for inspection.</p>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <br /><br />

                    {preview && (

                        <img
                            src={preview}
                            alt="Preview"
                            className="preview-image"
                        />

                    )}

                    <br />

                    <button onClick={uploadImage}>
                        Upload
                    </button>

                </div>

                {/* AI Inspection Card */}

                <div className="card">

                    <h3>AI Inspection</h3>

                    <p>Run defect detection on uploaded image.</p>

                    <button onClick={startInspection}>
                        Start Inspection
                    </button>

                </div>

                {/* Results Card */}

                <div className="card">

                    <h3>Inspection Results</h3>

                    {inspectionResult ? (

                        <div>

                            <p>
                                <b>Status:</b> {inspectionResult.status}
                            </p>

                            <p>
                                <b>Result:</b> {inspectionResult.result}
                            </p>

                            <p>
                                <b>Confidence:</b> {inspectionResult.confidence}
                            </p>

                        </div>

                    ) : (

                        <p>
                            No inspection performed yet.
                        </p>

                    )}

                </div>

            </div>

        </div>

    );

}

export default Dashboard;