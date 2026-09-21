import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Could not fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const scores = analyses
    .map((item) => Number(item.overall_score))
    .filter((score) => score > 0);

  const latestScore =
    scores.length > 0 ? scores[0] : 0;

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
      : 0;

  const bestScore =
    scores.length > 0 ? Math.max(...scores) : 0;

  return (
    <div className="app">

      <Navbar />

      <main className="dashboard-page">

        <div className="dashboard-container">

          {/* Header */}
          <div className="dashboard-header">

            <div>
              <p className="tagline">
                Your Resume Progress
              </p>

              <h1>
                Welcome to Your <span>Dashboard.</span>
              </h1>

              <p className="dashboard-description">
                Track your resume performance and see how
                your profile improves over time.
              </p>
            </div>

            <Link
              to="/upload"
              className="dashboard-analyze-btn"
            >
              Analyze Resume →
            </Link>

          </div>

          {loading ? (

            <div className="dashboard-status-card">
              <div className="history-spinner"></div>

              <h3>
                Loading your dashboard...
              </h3>

              <p>
                Fetching your latest resume insights.
              </p>
            </div>

          ) : (

            <>

              {/* Stats */}
              <div className="dashboard-stats-grid">

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">
                    📄
                  </div>

                  <span>Total Analyses</span>

                  <strong>
                    {analyses.length}
                  </strong>

                  <small>
                    Resume analyses completed
                  </small>
                </div>


                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">
                    📊
                  </div>

                  <span>Latest ATS Score</span>

                  <strong>
                    {latestScore}
                    <small className="score-small">
                      /100
                    </small>
                  </strong>

                  <small>
                    Your latest resume score
                  </small>
                </div>


                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">
                    📈
                  </div>

                  <span>Average ATS Score</span>

                  <strong>
                    {averageScore}
                    <small className="score-small">
                      /100
                    </small>
                  </strong>

                  <small>
                    Across your analyses
                  </small>
                </div>


                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">
                    🏆
                  </div>

                  <span>Best ATS Score</span>

                  <strong>
                    {bestScore}
                    <small className="score-small">
                      /100
                    </small>
                  </strong>

                  <small>
                    Your highest score
                  </small>
                </div>

              </div>


              {/* Recent Analyses */}
              <section className="dashboard-section">

                <div className="dashboard-section-header">

                  <div>
                    <p className="tagline">
                      Your Recent Activity
                    </p>

                    <h2>
                      Recent <span>Analyses</span>
                    </h2>
                  </div>

                  <Link
                    to="/history"
                    className="dashboard-history-link"
                  >
                    View All →
                  </Link>

                </div>


                {analyses.length === 0 ? (

                  <div className="dashboard-empty-card">

                    <div className="dashboard-empty-icon">
                      📄
                    </div>

                    <h3>
                      No analyses yet
                    </h3>

                    <p>
                      Upload your resume to get your
                      first AI-powered analysis.
                    </p>

                    <Link
                      to="/upload"
                      className="form-btn"
                    >
                      Analyze Resume →
                    </Link>

                  </div>

                ) : (

                  <div className="dashboard-recent-grid">

                    {analyses.slice(0, 4).map((item) => {

                      const score =
                        Number(item.overall_score) || 0;

                      return (

                        <div
                          className="dashboard-recent-card"
                          key={item.id}
                        >

                          <div className="dashboard-recent-top">

                            <div className="dashboard-file-icon">
                              PDF
                            </div>

                            <div className="dashboard-recent-info">

                              <h3>
                                Resume.pdf
                              </h3>

                              <span>
                                {item.job_role ||
                                  "General Resume"}
                              </span>

                            </div>

                          </div>


                          <div className="dashboard-recent-bottom">

                            <div>
                              <span>
                                ATS Score
                              </span>

                              <strong>
                                {score}
                                <small>/100</small>
                              </strong>
                            </div>

                            <div className="dashboard-date">

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

                            </div>

                          </div>


                          <Link
                            to={`/results/${item.id}`}
                            className="dashboard-view-btn"
                          >
                            View Analysis →
                          </Link>

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>


              {/* Bottom CTA */}
              <div className="dashboard-cta">

                <div>
                  <p className="tagline">
                    Keep Improving
                  </p>

                  <h2>
                    Ready to make your resume
                    <span> stronger?</span>
                  </h2>

                  <p>
                    Run another analysis and discover
                    new ways to improve your profile.
                  </p>
                </div>

                <Link
                  to="/upload"
                  className="dashboard-cta-btn"
                >
                  Analyze New Resume →
                </Link>

              </div>

            </>

          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;