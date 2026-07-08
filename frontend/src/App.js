import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  return (
    <>
      {isLoggedIn ? (
        <Dashboard
          setIsLoggedIn={setIsLoggedIn}
          role={role}
        />
      ) : (
        <Login
          setIsLoggedIn={setIsLoggedIn}
          setRole={setRole}
        />
      )}
    </>
  );
}

export default App;