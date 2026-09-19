import { useState } from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      // Check if user was redirected to login
      // from a protected page
      const redirectTo = searchParams.get("redirect");

      setTimeout(() => {
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate("/dashboard");
        }
      }, 800);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="app">

      {/* Common Navbar */}
      <Navbar />

      <main className="form-page">

        <div className="glass-form">

          <p className="tagline">Welcome Back</p>

          <h1>
            Login to <span>ResumeGuide.</span>
          </h1>

          <p className="form-description">
            Access your resume analysis and personalized career insights.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="form-btn"
            >
              Login
            </button>

          </form>

          {message && (
            <p className="form-footer">
              {message}
            </p>
          )}

          <p className="form-footer">
            Don't have an account?{" "}
            <Link to="/register">
              Create one
            </Link>
          </p>

        </div>

      </main>

    </div>
  );
}

export default Login;