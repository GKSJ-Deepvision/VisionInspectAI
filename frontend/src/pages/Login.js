import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const login = () => {

        if (username === "admin" && password === "admin123") {

            navigate("/dashboard");

        } else {

            alert("Invalid Username or Password");

        }

    };

    return (

        <div className="login-container">

            <div className="login-box">

                <h1>VisionInspect AI</h1>

                <h3>Industrial Defect Detection System</h3>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button onClick={login}>
                    Login
                </button>

            </div>

        </div>

    );

}

export default Login;