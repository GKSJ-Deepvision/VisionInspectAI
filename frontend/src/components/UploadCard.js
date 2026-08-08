import { useState } from "react";
import axios from "axios";
import "../styles/UploadCard.css";

function UploadCard() {

    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const predictImage = async () => {

        if (!file) {
            alert("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);

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

        setLoading(false);
    };

    return (

        <div className="upload-card">

            <h2>Upload Bottle Image</h2>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />

            <br /><br />

            <button onClick={predictImage}>
                Predict
            </button>

            <br /><br />

            {loading && <h3>Predicting...</h3>}

            {result && (

                <div className="result-box">

                    <h2>Prediction Result</h2>

                    <p><b>Prediction:</b> {result.prediction}</p>

                    <p><b>Confidence:</b> {result.confidence}%</p>

                    <p><b>Severity:</b> {result.severity}</p>

                </div>

            )}

        </div>

    );
}

export default UploadCard;