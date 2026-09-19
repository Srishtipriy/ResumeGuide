import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <h2>ResumeGuide</h2>

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        {token ? (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/history">
              History
            </Link>

            <Link to="/upload">
              Analyze Another
            </Link>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;