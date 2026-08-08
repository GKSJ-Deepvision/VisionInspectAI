import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="content">

                    <div className="welcome-card">

                        <h1>Welcome to VisionInspect AI</h1>

                        <p>
                            AI Powered Industrial Defect Detection System
                        </p>

                    </div>

                    <div className="dashboard-cards">

                        <div className="card blue">

                            <h2>🤖 AI Model</h2>

                            <p>Ready for Prediction</p>

                        </div>

                        <div className="card green">

                            <h2>🖥 Backend</h2>

                            <p>Connected Successfully</p>

                        </div>

                        <div className="card orange">

                            <h2>📤 Upload</h2>

                            <p>Ready to Inspect Images</p>

                        </div>

                        <div className="card red">

                            <h2>⚡ Status</h2>

                            <p>System Online</p>

                        </div>

                    </div>

                    <div className="dashboard-grid">

                        <div className="left-panel">

                            <div className="section">

                                <h2>System Status</h2>

                                <ul>

                                    <li>🟢 FastAPI Backend Running</li>

                                    <li>🟢 React Frontend Connected</li>

                                    <li>🟢 CNN Model Loaded</li>

                                    <li>🟢 Ready for Image Prediction</li>

                                </ul>

                            </div>

                            <div className="section">

                                <h2>Project Overview</h2>

                                <p>

                                    VisionInspect AI is an Industrial Defect
                                    Detection System developed using React,
                                    FastAPI and Deep Learning.

                                </p>

                                <br />

                                <p>

                                    Users can upload bottle images and the AI
                                    model predicts whether the product is Good,
                                    Broken Small, Broken Large or
                                    Contamination.

                                </p>

                            </div>

                        </div>

                        <div className="right-panel">

                            <div className="section">

                                <h2>Quick Actions</h2>

                                <button onClick={() => navigate("/upload")}>
                                    📤 Upload Image
                                </button>

                                <button onClick={() => navigate("/history")}>
                                    📊 View History
                                </button>

                                <button onClick={() => navigate("/settings")}>
                                    ⚙ Settings
                                </button>

                            </div>

                            <div className="section">

                                <h2>Technology Stack</h2>

                                <p><b>Frontend :</b> ReactJS</p>

                                <p><b>Backend :</b> FastAPI</p>

                                <p><b>Language :</b> Python</p>

                                <p><b>AI Model :</b> CNN</p>

                                <p><b>Dataset :</b> MVTec Bottle Dataset</p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;