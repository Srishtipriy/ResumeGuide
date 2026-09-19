const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenAI } = require("@google/genai");



const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();


// ===============================
// GEMINI AI SETUP
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ===============================
// RESUME UPLOAD CONFIGURATION
// ===============================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});


const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            ".pdf",
            ".doc",
            ".docx"
        ];

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (allowedTypes.includes(extension)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, DOC and DOCX files are allowed"
                )
            );
        }
    }
});


// ===============================
// EXTRACT TEXT FROM RESUME
// ===============================

const extractTextFromResume = async (
    filePath,
    fileExtension
) => {

    // PDF
    if (fileExtension === ".pdf") {

        const dataBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({
            data: dataBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        return result.text;
    }


    // DOCX
    if (fileExtension === ".docx") {

        const result = await mammoth.extractRawText({
            path: filePath
        });

        return result.value;
    }


    // DOC is currently not extracted
    return "";
};


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// MYSQL CONNECTION
// ===============================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// ===============================
// CONNECT TO MYSQL
// ===============================

db.connect((err) => {

    if (err) {

        console.log(
            "MySQL connection failed:",
            err.message
        );

        return;
    }

    console.log(
        "MySQL connected successfully!"
    );
});


// ===============================
// HOME TEST ROUTE
// ===============================

app.get("/", (req, res) => {

    res.send(
        "ResumeGuide Backend is running!"
    );
});


// ===============================
// TEST MYSQL ROUTE
// ===============================

app.get("/api/test-db", (req, res) => {

    const sql = "SELECT * FROM users";

    db.query(sql, (err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Database query failed",
                error: err.message
            });
        }

        res.json({
            message: "Database is working!",
            users: result
        });
    });
});


// ===============================
// REGISTER API
// ===============================

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (!name || !email || !password) {

                return res.status(400).json({
                    message: "All fields are required"
                });
            }


            const checkSql =
                "SELECT * FROM users WHERE email = ?";


            db.query(
                checkSql,
                [email],
                async (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            message: "Database error",
                            error: err.message
                        });
                    }


                    if (result.length > 0) {

                        return res.status(400).json({
                            message: "Email already registered"
                        });
                    }


                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );


                    const insertSql = `
                        INSERT INTO users
                        (name, email, password_hash)
                        VALUES (?, ?, ?)
                    `;


                    db.query(
                        insertSql,
                        [
                            name,
                            email,
                            hashedPassword
                        ],
                        (err, result) => {

                            if (err) {

                                return res.status(500).json({
                                    message:
                                        "Could not create account",
                                    error:
                                        err.message
                                });
                            }


                            res.status(201).json({

                                message:
                                    "Account created successfully!",

                                userId:
                                    result.insertId
                            });
                        }
                    );
                }
            );

        } catch (error) {

            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);


// ===============================
// LOGIN API
// ===============================

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (!email || !password) {

                return res.status(400).json({
                    message:
                        "Email and password are required"
                });
            }


            const sql =
                "SELECT * FROM users WHERE email = ?";


            db.query(
                sql,
                [email],
                async (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            message: "Database error",
                            error: err.message
                        });
                    }


                    if (result.length === 0) {

                        return res.status(401).json({
                            message:
                                "Invalid email or password"
                        });
                    }


                    const user = result[0];


                    const passwordMatch =
                        await bcrypt.compare(
                            password,
                            user.password_hash
                        );


                    if (!passwordMatch) {

                        return res.status(401).json({
                            message:
                                "Invalid email or password"
                        });
                    }


                    const token = jwt.sign(
                        {
                            id: user.id,
                            email: user.email
                        },

                        process.env.JWT_SECRET,

                        {
                            expiresIn: "1d"
                        }
                    );


                    res.json({

                        message:
                            "Login successful!",

                        token: token,

                        user: {

                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });
                }
            );

        } catch (error) {

            res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
);


// ===============================
// RESUME UPLOAD + TEXT EXTRACTION
// ===============================

app.post(
    "/api/resume/upload",
    authMiddleware,
    upload.single("resume"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Please upload a resume"
                });
            }


            const userId =
                req.user.id;


            const fileName =
                req.file.filename;


            const filePath =
                req.file.path;


            const fileExtension =
                path
                    .extname(
                        req.file.originalname
                    )
                    .toLowerCase();


            const extractedText =
                await extractTextFromResume(
                    filePath,
                    fileExtension
                );


            if (!extractedText) {

                return res.status(400).json({
                    message:
                        "Could not extract text from this file. Please use PDF or DOCX."
                });
            }


            const sql = `
                INSERT INTO resumes
                (user_id, file_name, extracted_text)
                VALUES (?, ?, ?)
            `;


            db.query(

                sql,

                [
                    userId,
                    fileName,
                    extractedText
                ],

                (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            message:
                                "Could not save resume",

                            error:
                                err.message
                        });
                    }


                    res.status(201).json({

                        message:
                            "Resume uploaded and text extracted successfully!",

                        resumeId:
                            result.insertId,

                        fileName:
                            fileName,

                        textLength:
                            extractedText.length
                    });
                }
            );

        } catch (error) {

            console.log(
                "Resume extraction error:",
                error
            );


            res.status(500).json({

                message:
                    "Could not process resume",

                error:
                    error.message
            });
        }
    }
);


// ===============================
// GEMINI TEST API
// ===============================
//
// Ye route sirf Gemini connection
// check karne ke liye hai.
// Isse abhi actual resume analyze nahi hoga.
//

app.get(
    "/api/test-gemini",
    async (req, res) => {

        try {

            console.log(
                "GEMINI KEY EXISTS:",
                !!process.env.GEMINI_API_KEY
            );


            let response = null;


            for (
                let attempt = 1;
                attempt <= 3;
                attempt++
            ) {

                try {

                    console.log(
                        `Gemini test attempt ${attempt}`
                    );


                    response =
                        await ai.models.generateContent({

                            model:
                                "gemini-3.5-flash-lite",

                            contents:
                                "Say hello in one short sentence."
                        });


                    break;

                } catch (error) {

                    console.log(
                        `Gemini test attempt ${attempt} failed:`,
                        error.message
                    );


                    if (
                        error.status !== 503 ||
                        attempt === 3
                    ) {

                        throw error;
                    }


                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                attempt * 5000
                            )
                    );
                }
            }


            res.json({

                message:
                    "Gemini is working!",

                response:
                    response.text
            });

        } catch (error) {

            console.log(
                "Gemini test error:",
                error
            );


            res.status(500).json({

                message:
                    "Gemini test failed",

                error:
                    error.message
            });
        }
    }
);


// ===============================
// AI RESUME ANALYSIS API
// ===============================

app.post(
    "/api/resume/analyze",
    authMiddleware,

    async (req, res) => {

        const {
            resumeId,
            jobRole,
            jobDescription
        } = req.body;


        if (!resumeId) {

            return res.status(400).json({
                message:
                    "resumeId is required"
            });

        }


        const sql = `
            SELECT *
            FROM resumes
            WHERE id = ? AND user_id = ?
        `;


        db.query(

            sql,

            [
                resumeId,
                req.user.id
            ],

            async (err, result) => {

                if (err) {

                    return res.status(500).json({
                        message:
                            "Database error",

                        error:
                            err.message
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        message:
                            "Resume not found"
                    });

                }


                try {

                    const resumeText =
                        result[0].extracted_text;


                    if (!resumeText) {

                        return res.status(400).json({
                            message:
                                "No text could be extracted from this resume"
                        });

                    }


                    // ===============================
                    // GEMINI PROMPT
                    // ===============================

const prompt = `
You are an expert professional resume analyzer and ATS specialist.

Analyze the resume carefully and return ONLY valid JSON.

RESUME:
${resumeText}

${jobRole ? `
TARGET JOB ROLE:
${jobRole}
` : ""}

${jobDescription ? `
JOB DESCRIPTION:
${jobDescription}
` : ""}

Return JSON using EXACTLY this structure:

{
  "summary": "One short professional summary of the resume. Example: Good foundation — a few improvements can make it stronger.",

  "scores": {
    "ats": 0,
    "content": 0,
    "skills": 0
  },

  "detectedSkills": [
    "skills clearly detected from the resume"
  ],

  "skillsYouCanLearn": [
    "recommended skills that could strengthen the candidate's profile"
  ],

  "strengths": [
    "specific strengths supported by the resume"
  ],

  "formattingImprovements": [
    "specific improvements related to margins",
    "spacing",
    "alignment",
    "font consistency",
    "heading consistency",
    "bullet points",
    "section organization",
    "readability",
    "ATS-friendly formatting"
  ],

    "contentImprovements": [
    {
        "section": "Projects",
        "current": "existing resume bullet or content that can be improved",
        "suggested": "improved version of the same content without inventing facts",
        "reason": "why this improvement makes the resume stronger"
    }
    ],

  "suggestions": [
    "practical suggestions to improve the resume"
  ],

  "jobMatch": {
    "score": 0,
    "matchedSkills": [
      "skills from the target role/job description that are clearly found in the resume"
    ],
    "skillsYouCanLearn": [
      "skills from the target role/job description that could be useful for the candidate to learn"
    ],
    "suggestions": [
      "specific suggestions for improving the resume for the target role"
    ]
  }
}

IMPORTANT RULES:

1. All scores must be integers from 0 to 100.

2. ATS score should consider:
   - ATS readability
   - structure
   - keywords
   - formatting
   - section organization.

3. Content score should consider:
   - clarity
   - relevance
   - project descriptions
   - achievements
   - action verbs
   - measurable impact.

4. Skills score should consider:
   - technical skills
   - tools
   - technologies
   - relevance and clarity of listed skills.

5. detectedSkills must ONLY contain skills that are clearly present or strongly evidenced in the resume.

6. Do NOT claim that the candidate lacks a skill.

7. skillsYouCanLearn means recommended skills that could strengthen the candidate's profile. These are recommendations, NOT claims that the candidate does not know them.

8. Formatting improvements must specifically check:
   - margins
   - spacing
   - alignment
   - font consistency
   - heading consistency
   - bullet point consistency
   - section organization
   - readability
   - ATS compatibility.

9. Do NOT invent:
   - work experience
   - projects
   - certifications
   - achievements
   - technologies
   - education
   - job history.
   
9.1 For contentImprovements:
    - Only suggest improvements based on content actually present in the resume.
    - When possible, provide the original/current resume statement.
    - Provide a rewritten suggested version.
    - Preserve the original meaning and facts.
    - Do NOT invent numbers, percentages, users, revenue, performance improvements, responsibilities, technologies or achievements.
    - If measurable impact is not present in the resume, do NOT create one.
    - Use stronger action verbs where appropriate.
    - Keep suggested bullet points concise and professional.
    - Prioritize Projects, Experience, Education, Skills and other important resume sections.

10. If a target job role or job description is provided:
    - Calculate a job match score from 0 to 100.
    - matchedSkills must contain only skills clearly found in both the resume and the target requirements.
    - skillsYouCanLearn should contain useful skills from the target requirements that are recommended for strengthening the profile.
    - suggestions must be specific to the target role.

11. If NO target job role and NO job description is provided:
    - Set jobMatch to null.

12. Keep the response practical and useful for a student/job seeker.

13. Return ONLY JSON.
14. Do NOT use markdown.
15. Do NOT add explanations before or after the JSON.
`;
                    // ===============================
                    // GEMINI REQUEST WITH RETRIES
                    // ===============================

                    let response = null;


                    for (
                        let attempt = 1;
                        attempt <= 3;
                        attempt++
                    ) {

                        try {

                            console.log(
                                `Gemini analysis attempt ${attempt}`
                            );


                            response =
                                await ai.models.generateContent({

                                    model:
                                        "gemini-3.5-flash-lite",

                                    contents:
                                        prompt
                                });


                            break;


                        } catch (error) {

                            console.log(
                                `Gemini analysis attempt ${attempt} failed:`,
                                error.message
                            );


                            if (
                                error.status !== 503 ||
                                attempt === 3
                            ) {

                                throw error;

                            }


                            await new Promise(
                                resolve =>
                                    setTimeout(
                                        resolve,
                                        attempt * 5000
                                    )
                            );

                        }

                    }


                    // ===============================
                    // CONVERT GEMINI RESPONSE TO JSON
                    // ===============================

                    const analysisText =
                        response.text.trim();


                    let analysisData;


                    try {

                        analysisData =
                            JSON.parse(analysisText);
                        analysisData.targetRole = jobRole || null;

                    } catch (jsonError) {

                        console.log(
                            "Gemini returned invalid JSON:",
                            analysisText
                        );

                        return res.status(500).json({
                            message:
                                "AI returned an invalid analysis format"
                        });

                    }


                    // ===============================
                    // SAVE ANALYSIS IN MYSQL
                    // ===============================

                    const insertAnalysisSql = `
                        INSERT INTO analyses
                        (
                            resume_id,
                            job_role,
                            job_description,
                            overall_score,
                            analysis_text
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;


                    const overallScore =
                        analysisData.scores?.ats || null;


                    const analysisJson =
                        JSON.stringify(analysisData);


                    db.query(

                        insertAnalysisSql,

                        [
                            resumeId,
                            jobRole || null,
                            jobDescription || null,
                            overallScore,
                            analysisJson
                        ],

                        (dbErr, dbResult) => {

                            if (dbErr) {

                                return res.status(500).json({

                                    message:
                                        "Analysis generated but could not be saved",

                                    error:
                                        dbErr.message

                                });

                            }


                            res.json({

                                message:
                                    "Resume analyzed successfully!",

                                analysisId:
                                    dbResult.insertId,

                                analysis:
                                    analysisData

                            });

                        }

                    );


                } catch (error) {

                    console.log(
                        "Gemini AI error:",
                        error
                    );


                    res.status(500).json({

                        message:
                            "AI analysis failed",

                        error:
                            error.message

                    });

                }

            }

        );

    }

);

// Get analysis history for logged-in user
app.get(
    "/api/analysis/history",
    authMiddleware,
    (req, res) => {

        const userId = req.user.id;

        const sql = `
            SELECT
                analyses.id,
                analyses.resume_id,
                analyses.job_role,
                analyses.overall_score,
                analyses.analysis_text,
                analyses.created_at,
                resumes.file_name
            FROM analyses
            JOIN resumes
                ON analyses.resume_id = resumes.id
            WHERE resumes.user_id = ?
            ORDER BY analyses.created_at DESC
        `;

        db.query(
            sql,
            [userId],
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        message: "Could not fetch analysis history",
                        error: err.message
                    });
                }

                res.json({
                    analyses: results
                });
            }
        );
    }
);
// Delete one analysis
app.delete(
    "/api/analysis/:id",
    authMiddleware,
    (req, res) => {

        const analysisId = req.params.id;
        const userId = req.user.id;

        const sql = `
            DELETE analyses
            FROM analyses
            JOIN resumes
                ON analyses.resume_id = resumes.id
            WHERE analyses.id = ?
            AND resumes.user_id = ?
        `;

        db.query(
            sql,
            [analysisId, userId],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Could not delete analysis",
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Analysis not found"
                    });
                }

                res.json({
                    message: "Analysis deleted successfully"
                });
            }
        );
    }
);
// Get one analysis by ID
app.get(
    "/api/analysis/:id",
    authMiddleware,
    (req, res) => {

        const analysisId = req.params.id;
        const userId = req.user.id;

        const sql = `
            SELECT
                analyses.id,
                analyses.resume_id,
                analyses.job_role,
                analyses.job_description,
                analyses.overall_score,
                analyses.analysis_text,
                analyses.created_at,
                resumes.file_name
            FROM analyses
            JOIN resumes
                ON analyses.resume_id = resumes.id
            WHERE analyses.id = ?
            AND resumes.user_id = ?
        `;

        db.query(
            sql,
            [analysisId, userId],
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        message: "Could not fetch analysis",
                        error: err.message
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Analysis not found"
                    });
                }

                let analysisData;

                try {
                    analysisData = JSON.parse(
                        results[0].analysis_text
                    );
                } catch (error) {
                    return res.status(500).json({
                        message: "Stored analysis has invalid JSON"
                    });
                }

                analysisData.targetRole =
                    results[0].job_role || null;

                res.json({
                    analysisId: results[0].id,
                    fileName: results[0].file_name,
                    createdAt: results[0].created_at,
                    analysis: analysisData
                });
            }
        );
    }
);

// ===============================
// PROTECTED ROUTE
// ===============================

app.get(
    "/api/protected",
    authMiddleware,

    (req, res) => {

        res.json({

            message:
                "You accessed a protected route!",

            user:
                req.user
        });
    }
);


// ===============================
// START SERVER
// ===============================

const PORT = 5000;


app.listen(
    PORT,

    () => {

        console.log(
            `Server running on port ${PORT}`
        );
    }
);