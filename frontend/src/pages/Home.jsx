import "../App.css";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="app">

      <Navbar />

      <main className="hero">

        <div className="hero-content">

          <p className="tagline">
            AI-Powered Resume Analysis
          </p>

          <h1>
            Make Your Resume
            <br />
            <span>Job Ready.</span>
          </h1>

          <p className="description">
            Upload your resume and get AI-powered feedback,
            skill analysis, job matching and personalized
            improvement suggestions.
          </p>

          <button
            className="analyze-btn"
            onClick={() => {
              const token = localStorage.getItem("token");

              if (token) {
                window.location.href = "/upload";
              } else {
                window.location.href = "/login?redirect=/upload";
              }
            }}
          >
            Analyze My Resume
            <span>→</span>
          </button>

          {/* Small glass information card */}
          <div className="resume-card">

            <div className="card-top">

              <div>
                <p className="card-label">
                  Resume Analysis
                </p>

                <h3>
                  Ready to improve?
                </h3>
              </div>

              <div className="check-icon">
                ✓
              </div>

            </div>

            <div className="card-stats">

              <div>
                <strong>Skills</strong>
                <span>Analysis</span>
              </div>

              <div>
                <strong>ATS</strong>
                <span>Compatibility</span>
              </div>

              <div>
                <strong>Jobs</strong>
                <span>Matching</span>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Home;