import React, { useState } from "react";
import "./Login.css";

function Login({ setIsLoggedIn,setRole }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const response = await fetch("http://127.0.0.1:8000/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })

    });

    const data = await response.json();

    if (data.success) {

    alert("Login Successful");

    setRole(data.role);
    setIsLoggedIn(true);

    }
    else{

      alert("Invalid Username or Password");

    }

  };

  return (

    <div className="login-container">

      <div className="login-box">

        <h2>VisionInspect AI</h2>

        <p>Login to continue</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

      </div>

    </div>

  );

}

export default Login;