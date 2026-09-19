import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function ScoreRing({ title, score }) {

  const value = Number(score) || 0;

  return (
    <div className="score-card">

      <p>{title}</p>

      <div
        className="score-ring"
        style={{
          "--score": `${value * 3.6}deg`
        }}
      >
        <div className="score-ring-inner">
          <strong>{value}</strong>
          <span>/100</span>
        </div>
      </div>

    </div>
  );
}


function Results() {
  const location = useLocation();
  const { id } = useParams();

  const [oldAnalysis, setOldAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analysis = id
    ? oldAnalysis
    : location.state?.analysis;

  const analysisId = id
    ? id
    : location.state?.analysisId;

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchOldAnalysis = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/analysis/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOldAnalysis(response.data.analysis);

      } catch (error) {
        console.error(
          "Could not fetch old analysis:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOldAnalysis();
  }, [id]);

  const isStructured =
    analysis && typeof analysis === "object";

if (loading) {
  return (
    <div className="app">
      <Navbar />

      <main className="results-page">
        <div className="results-container">

          <div className="results-heading">
            <p className="tagline">ResumeGuide AI</p>

            <h1>
              Loading Your <span>Analysis.</span>
            </h1>

            <p className="form-description">
              We're preparing your previous resume insights...
            </p>
          </div>

          <div className="results-card loading-card">
            <div className="loading-spinner"></div>

            <h2>Fetching Analysis</h2>

            <p>
              Your resume insights are almost ready.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
    
  if (!analysis) {

    return (
      <div className="app">

        <Navbar />

        <main className="results-page">

          <div className="results-container">

            <div className="results-card no-analysis">

              <h3>No analysis found</h3>

              <p>
                Please upload and analyze your resume again.
              </p>

              <Link
                to="/upload"
                className="form-btn"
              >
                Analyze Resume →
              </Link>

            </div>

          </div>

        </main>

      </div>
    );
  }


  // Old string response fallback
  if (!isStructured) {

    return (
      <div className="app">

        <Navbar />

        <main className="results-page">

          <div className="results-container">

            <div className="results-heading">

              <p className="tagline">
                Resume Analysis Complete
              </p>

              <h1>
                Your Resume <span>Analysis.</span>
              </h1>

            </div>

            <div className="results-card">

              <div className="results-card-header">

                <h2>AI Resume Feedback</h2>

                {analysisId && (
                  <span>
                    Analysis #{analysisId}
                  </span>
                )}

              </div>

              <div className="analysis-text">
                {analysis}
              </div>

            </div>

          </div>

        </main>

      </div>
    );
  }


  const scores = analysis.scores || {};
  const jobMatch = analysis.jobMatch;


  return (
    <div className="app">

      <Navbar />
      <main className="results-page">

        <div className="results-container">


          {/* HEADER */}
          <div className="results-heading">

            <p className="tagline">
              Resume Analysis Complete
            </p>

            <h1>
              Your Resume <span>Analysis.</span>
            </h1>

            <p className="form-description">
              {analysis.summary ||
                "Good foundation — a few improvements can make it stronger."}
            </p>

          </div>


          {/* TARGET ROLE */}
          {analysis.targetRole && (

            <div className="target-role-card">

              <div className="target-role-icon">
                💼
              </div>

              <div>
                <span>Target Role</span>
                <h2>{analysis.targetRole}</h2>
              </div>

            </div>

          )}


          {/* SCORE CARDS */}
          <div className="score-grid">

            <ScoreRing
              title="ATS Score"
              score={scores.ats}
            />

            <ScoreRing
              title="Content Score"
              score={scores.content}
            />

            <ScoreRing
              title="Skills Score"
              score={scores.skills}
            />

          </div>


          {/* JOB MATCH */}
          {jobMatch && (

            <section className="result-section job-match-section">

              <div className="section-title">

                <span>★</span>

                <h2>
                  Job Match Analysis
                </h2>

              </div>


              <div className="job-match-layout">

                {/* MATCH RING */}
                <div
                  className="job-match-ring"
                  style={{
                    "--match":
                      `${(Number(jobMatch.score) || 0) * 3.6}deg`
                  }}
                >

                  <div className="job-match-ring-inner">

                    <strong>
                      {jobMatch.score || 0}%
                    </strong>

                    <span>
                      Match Score
                    </span>

                  </div>

                </div>


                {/* MATCH DETAILS */}
                <div className="job-match-details">

                  <h3>
                    Strong Matches
                  </h3>

                  <div className="skills-list">

                    {jobMatch.matchedSkills?.length > 0 ? (

                      jobMatch.matchedSkills.map(
                        (skill, index) => (

                          <span
                            className="skill-pill"
                            key={index}
                          >
                            ✓ {skill}
                          </span>

                        )
                      )

                    ) : (

                      <p className="empty-text">
                        No matched skills returned.
                      </p>

                    )}

                  </div>


                  <h3>
                    Skills You Can Learn
                  </h3>

                  <div className="skills-list">

                    {jobMatch.skillsYouCanLearn?.length > 0 ? (

                      jobMatch.skillsYouCanLearn.map(
                        (skill, index) => (

                          <span
                            className="learn-pill"
                            key={index}
                          >
                            + {skill}
                          </span>

                        )
                      )

                    ) : (

                      <p className="empty-text">
                        No additional skills recommended.
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* JOB SUGGESTIONS */}
              {jobMatch.suggestions?.length > 0 && (

                <div className="job-suggestions">

                  <h3>
                    Job-Specific Suggestions
                  </h3>

                  <div className="result-list">

                    {jobMatch.suggestions.map(
                      (item, index) => (

                        <div
                          className="result-list-item"
                          key={index}
                        >

                          <span>→</span>

                          <p>{item}</p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </section>

          )}


          {/* DETECTED SKILLS */}
          <section className="result-section">

            <div className="section-title">

              <span>01</span>

              <h2>
                Detected Skills
              </h2>

            </div>


            <div className="skills-list">

              {analysis.detectedSkills?.length > 0 ? (

                analysis.detectedSkills.map(
                  (skill, index) => (

                    <span
                      className="skill-pill"
                      key={index}
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <p className="empty-text">
                  No specific skills were detected.
                </p>

              )}

            </div>

          </section>


          {/* SKILLS TO LEARN */}
          <section className="result-section">

            <div className="section-title">

              <span>02</span>

              <h2>
                Skills You Can Learn
              </h2>

            </div>

            <p className="section-description">
              These are recommended skills that could strengthen
              your resume. They are recommendations, not claims
              about what you currently know.
            </p>


            <div className="skills-list">

              {analysis.skillsYouCanLearn?.length > 0 ? (

                analysis.skillsYouCanLearn.map(
                  (skill, index) => (

                    <span
                      className="learn-pill"
                      key={index}
                    >
                      + {skill}
                    </span>

                  )
                )

              ) : (

                <p className="empty-text">
                  No additional skills were recommended.
                </p>

              )}

            </div>

          </section>


          {/* STRENGTHS */}
          <section className="result-section">

            <div className="section-title">

              <span>03</span>

              <h2>
                Strengths
              </h2>

            </div>


            <div className="result-list">

              {analysis.strengths?.length > 0 ? (

                analysis.strengths.map(
                  (item, index) => (

                    <div
                      className="result-list-item"
                      key={index}
                    >

                      <span>✓</span>

                      <p>{item}</p>

                    </div>

                  )
                )

              ) : (

                <p className="empty-text">
                  No strengths were returned.
                </p>

              )}

            </div>

          </section>


          {/* FORMATTING */}
          <section className="result-section">

            <div className="section-title">

              <span>04</span>

              <h2>
                Formatting & Layout Improvements
              </h2>

            </div>


            <div className="result-list">

              {analysis.formattingImprovements?.length > 0 ? (

                analysis.formattingImprovements.map(
                  (item, index) => (

                    <div
                      className="result-list-item"
                      key={index}
                    >

                      <span>→</span>

                      <p>{item}</p>

                    </div>

                  )
                )

              ) : (

                <p className="empty-text">
                  No formatting improvements were returned.
                </p>

              )}

            </div>

          </section>

            {/* CONTENT */}
            <section className="result-section">

            <div className="section-title">

                <span>05</span>

                <h2>
                Content Improvements
                </h2>

            </div>

            <div className="content-improvements">

                {analysis.contentImprovements?.length > 0 ? (

                analysis.contentImprovements.map(
                    (item, index) => (

                    <div
                        className="content-improvement-card"
                        key={index}
                    >

                        <div className="content-improvement-header">

                        <span className="content-section-label">
                            {item.section}
                        </span>

                        </div>


                        <div className="content-improvement-block">

                        <span>
                            Current
                        </span>

                        <p>
                            {item.current}
                        </p>

                        </div>


                        <div className="content-improvement-block suggested">

                        <span>
                            Suggested
                        </span>

                        <p>
                            {item.suggested}
                        </p>

                        </div>


                        <div className="content-improvement-reason">

                        <span>
                            Why
                        </span>

                        <p>
                            {item.reason}
                        </p>

                        </div>

                    </div>

                    )
                )

                ) : (

                <p className="empty-text">
                    No content improvements were returned.
                </p>

                )}

            </div>

            </section>


          {/* SUGGESTIONS */}
          <section className="result-section">

            <div className="section-title">

              <span>06</span>

              <h2>
                Additional Suggestions
              </h2>

            </div>


            <div className="result-list">

              {analysis.suggestions?.length > 0 ? (

                analysis.suggestions.map(
                  (item, index) => (

                    <div
                      className="result-list-item"
                      key={index}
                    >

                      <span>✦</span>

                      <p>{item}</p>

                    </div>

                  )
                )

              ) : (

                <p className="empty-text">
                  No additional suggestions were returned.
                </p>

              )}

            </div>

          </section>


          {/* FOOTER */}
          <div className="results-footer">

            Better Resume&nbsp; → &nbsp;More Opportunities
            &nbsp; → &nbsp;Your Next Career Step

          </div>


        </div>

      </main>

    </div>
  );
}

export default Results;