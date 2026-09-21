import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function History() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

const handleDelete = async (analysisId) => {

  const confirmed = window.confirm(
    "Are you sure you want to remove this analysis?"
  );

  if (!confirmed) {
    return;
  }

  try {

    const token = localStorage.getItem("token");

    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/analysis/${analysisId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAnalyses((previousAnalyses) =>
      previousAnalyses.filter(
        (item) => item.id !== analysisId
      )
    );

    setOpenMenu(null);

  } catch (error) {

    console.error(
      "Could not delete analysis:",
      error
    );

    alert("Could not remove this analysis.");
  }
};

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/analysis/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAnalyses(response.data.analyses || []);
      } catch (error) {
        console.error("Could not fetch analysis history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="app">
      <Navbar />

      <main className="history-page">

        <div className="history-container">

          {/* Heading */}
          <div className="history-header">

            <div>
              <p className="tagline">
                Your Resume Journey
              </p>

              <h1>
                Analysis <span>History.</span>
              </h1>

              <p className="history-description">
                View your previous resume analyses and track your progress.
              </p>
            </div>

            <div className="history-count-card">
              <div className="history-count-icon">
                📄
              </div>

              <div>
                <span>Total Analyses</span>
                <strong>{analyses.length}</strong>
              </div>
            </div>

          </div>

          {/* Loading */}
          {loading && (
            <div className="history-status-card">
              <div className="history-spinner"></div>
              <h3>Loading your analyses...</h3>
              <p>Fetching your ResumeGuide history.</p>
            </div>
          )}

          {/* Empty */}
          {!loading && analyses.length === 0 && (
            <div className="history-status-card">

              <div className="history-empty-icon">
                📄
              </div>

              <h3>No analyses yet</h3>

              <p>
                Upload your resume and get your first AI-powered analysis.
              </p>

              <Link to="/upload" className="form-btn">
                Analyze Resume →
              </Link>

            </div>
          )}

          {/* Analysis Cards */}
          {!loading && analyses.length > 0 && (
            <div className="history-grid">

              {analyses.map((item) => {

                const score = Number(item.overall_score) || 0;

                return (
                  <div
                    className="history-analysis-card"
                    key={item.id}
                  >

                    {/* Card top */}
                    <div className="history-card-top">

                      <div className="history-file">

                        <div className="pdf-icon">
                          PDF
                        </div>

                        <div className="history-file-info">

                          <h3>
                            Resume.pdf
                          </h3>

                          <span>
                            PDF Resume
                          </span>

                        </div>

                      </div>

                      <div className="history-menu-wrapper">

                            <button
                                className="history-menu"
                                onClick={() => {
                                setOpenMenu(
                                    openMenu === item.id ? null : item.id
                                );
                                }}
                            >
                                •••
                            </button>

                            {openMenu === item.id && (
                                <div className="history-dropdown">

                                <button
                                    onClick={() => handleDelete(item.id)}
                                >
                                    🗑 Remove Analysis
                                </button>

                                </div>
                            )}

                            </div>

                    </div>

                    <div className="history-divider"></div>

                    {/* Score + Role */}
                    <div className="history-middle">

                      <div className="history-score-box">

                        <div
                          className="history-score-ring"
                          style={{
                            "--history-score":
                              `${score * 3.6}deg`
                          }}
                        >
                          <div className="history-score-inner">
                            <strong>{score}</strong>
                          </div>
                        </div>

                        <div className="history-score-text">
                          <strong>ATS Score</strong>
                          <span>/100</span>
                        </div>

                      </div>

                      <div className="history-role">

                        <span className="history-role-icon">
                          💼
                        </span>

                        <div>
                          <span>Job Role</span>

                          <strong>
                            {item.job_role || "General Resume"}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* Date */}
                    <div className="history-date">

                      <span>📅</span>

                      <div>
                        <strong>
                          {new Date(
                            item.created_at
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </strong>

                        <small>
                          Analysis Date
                        </small>
                      </div>

                    </div>

                    {/* Button */}
                    <button
                      className="history-view-btn"
                      onClick={() =>
                        navigate(`/results/${item.id}`)
                      }
                    >
                      View Analysis
                      <span>→</span>
                    </button>

                  </div>
                );
              })}

            </div>
          )}

          <div className="history-footer">
            <span>✦</span>
            Better Resumes
            <span>✦</span>
            Brighter Opportunities
          </div>

        </div>

      </main>

    </div>
  );
}

export default History;