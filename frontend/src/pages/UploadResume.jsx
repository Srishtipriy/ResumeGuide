import { useState } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function UploadResume() {

  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select your resume.");
      return;
    }

    try {

      setLoading(true);

      // Get JWT token
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        setLoading(false);
        return;
      }

      // -----------------------------
      // STEP 1: UPLOAD RESUME
      // -----------------------------

      const formData = new FormData();

      formData.append("resume", file);

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "Upload response:",
        uploadResponse.data
      );

      const resumeId = uploadResponse.data.resumeId;

      if (!resumeId) {
        alert("Resume uploaded but resume ID was not received.");
        setLoading(false);
        return;
      }

      // -----------------------------
      // STEP 2: AI ANALYSIS
      // -----------------------------

      const analysisResponse = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        {
          resumeId: resumeId,
          jobRole: jobRole || null,
          jobDescription: jobDescription || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "AI analysis response:",
        analysisResponse.data
      );

      navigate("/results", {
        state: {
            analysis: analysisResponse.data.analysis,
            analysisId: analysisResponse.data.analysisId
        }
        });

    } catch (error) {

      console.log(
        "Resume analysis error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="app">

      <Navbar />

      <main className="upload-page">

        <div className="upload-container">

          <div className="upload-heading">

            <p className="tagline">
              Resume Analysis
            </p>

            <h1>
              Make Your Resume <span>Job Ready.</span>
            </h1>

            <p className="form-description">
              Upload your resume and optionally tell us what role
              you're targeting.
            </p>

          </div>

          <div className="upload-card">

            <form onSubmit={handleSubmit}>

              <label className="upload-box">

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  {file
                    ? file.name
                    : "Upload your resume"}
                </h3>

                <p>
                  PDF, DOC or DOCX
                </p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  hidden
                />

                <span className="choose-file">
                  Choose File
                </span>

              </label>

              <div className="input-group">

                <label>
                  Target Job Role{" "}
                  <span>(Optional)</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Software Developer"
                  value={jobRole}
                  onChange={(e) =>
                    setJobRole(e.target.value)
                  }
                />

              </div>

              <div className="input-group">

                <label>
                  Job Description{" "}
                  <span>(Optional)</span>
                </label>

                <textarea
                  rows="6"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) =>
                    setJobDescription(e.target.value)
                  }
                />

              </div>

              <button
                type="submit"
                className="form-btn"
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze My Resume →"}
              </button>

            </form>

          </div>

        </div>

      </main>

    </div>
  );
}

export default UploadResume;