import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  const role =
    localStorage.getItem("role");

  if (!isLoggedIn || !role) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;