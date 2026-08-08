import "../styles/ResultCard.css";

function ResultCard({ result }) {

    if (!result) return null;

    return (

        <div className="result-card">

            <h2>Prediction Result</h2>

            <div className="result-row">

                <span>Prediction</span>

                <strong>{result.prediction}</strong>

            </div>

            <div className="result-row">

                <span>Confidence</span>

                <strong>{result.confidence}%</strong>

            </div>

            <div className="result-row">

                <span>Severity</span>

                <strong>{result.severity}</strong>

            </div>

            <div className="status">

                {result.prediction === "good"
                    ? "✅ Product is Good"
                    : "❌ Defective Product"}

            </div>

        </div>

    );

}

export default ResultCard;