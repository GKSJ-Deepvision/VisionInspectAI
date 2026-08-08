import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/History.css";

function History() {

    const history = [
        {
            image: "bottle1.jpg",
            prediction: "Good",
            confidence: "98%",
            severity: "Low"
        },
        {
            image: "bottle2.jpg",
            prediction: "Broken Small",
            confidence: "92%",
            severity: "Medium"
        },
        {
            image: "bottle3.jpg",
            prediction: "Contamination",
            confidence: "96%",
            severity: "High"
        },
        {
            image: "bottle4.jpg",
            prediction: "Broken Large",
            confidence: "99%",
            severity: "Critical"
        }
    ];

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="history-page">

                    <div className="history-header">

                        <h1>Prediction History</h1>

                        <input
                            type="text"
                            placeholder="Search Image..."
                        />

                    </div>

                    <div className="history-card">

                        <table>

                            <thead>

                                <tr>

                                    <th>Image</th>
                                    <th>Prediction</th>
                                    <th>Confidence</th>
                                    <th>Severity</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    history.map((item,index)=>(

                                        <tr key={index}>

                                            <td>{item.image}</td>

                                            <td>{item.prediction}</td>

                                            <td>{item.confidence}</td>

                                            <td>

                                                <span className={item.severity.toLowerCase()}>

                                                    {item.severity}

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default History;