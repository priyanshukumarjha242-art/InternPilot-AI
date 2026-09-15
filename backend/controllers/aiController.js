const { GoogleGenAI } = require('@google/genai');
const User = require('../models/userModel');
const Application = require('../models/applicationModel');
const Resume = require('../models/resumeModel');

// Helper to initialize Gemini
const getAI = (res) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    res.status(400).json({ message: 'Gemini API Key is missing. Please add it to your .env file.' });
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const generateCoverLetter = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const ai = getAI(res);
    if (!ai) return;

    const user = await User.findById(req.user.id);
    const app = await Application.findByIdAndUserId(applicationId, req.user.id);
    if (!user || !app) return res.status(404).json({ message: 'User or Application not found' });

    const systemInstruction = `
You are an expert career assistant helping a student write a professional, truthful, job-specific cover letter.
Use ONLY the candidate information and job information provided.
Never fabricate qualifications, experience, or projects.
Return ONLY the cover letter text, without markdown or explanations.
    `.trim();

    const inputData = `Candidate Information:
Name: ${user.name}
College: ${user.college}
Branch: ${user.branch}
Graduation Year: ${user.graduation_year}
Skills: ${user.skills}
GitHub: ${user.github}

Job Information:
Company: ${app.company_name}
Role: ${app.role}
Job Description: ${app.job_description || 'Not specified'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: inputData,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ coverLetter: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate cover letter.' });
  }
};

const generateJobMatch = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const ai = getAI(res);
    if (!ai) return;

    const user = await User.findById(req.user.id);
    const app = await Application.findByIdAndUserId(applicationId, req.user.id);
    if (!user || !app) return res.status(404).json({ message: 'User or Application not found' });

    const systemInstruction = `
You are an expert technical recruiter analyzing how well a candidate matches a job role.
Analyze the provided candidate profile against the job description.
NEVER invent skills or experiences for the candidate.
Respond exclusively with a JSON object in this exact format:
{
  "score": <0-100 integer>,
  "strongMatches": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skill1>", "<skill2>"],
  "recommendations": ["<rec1>", "<rec2>"],
  "summary": "<short paragraph summary>"
}
Do not use markdown blocks like \`\`\`json. Just output the raw JSON object.
    `.trim();

    const inputData = `Candidate Information:
Skills: ${user.skills || 'Not specified'}
Education: ${user.college || 'Not specified'}, ${user.branch || 'Not specified'}

Job Information:
Company: ${app.company_name}
Role: ${app.role}
Job Description: ${app.job_description || 'Not specified'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: inputData,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const matchData = JSON.parse(response.text);
    
    // Save to DB
    await Application.saveAIMatch(app.id, req.user.id, matchData.score, matchData);
    
    res.json(matchData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate job match.' });
  }
};

const generateInterviewPrep = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const ai = getAI(res);
    if (!ai) return;

    const user = await User.findById(req.user.id);
    const app = await Application.findByIdAndUserId(applicationId, req.user.id);
    if (!user || !app) return res.status(404).json({ message: 'User or Application not found' });

    const systemInstruction = `
You are an expert interview coach preparing a candidate for an upcoming interview.
Based on the candidate's skills and the job description, generate tailored interview questions.
NEVER invent skills for the candidate.
Respond exclusively with a JSON object in this exact format:
{
  "technical": ["<question1>", "<question2>"],
  "behavioral": ["<question1>", "<question2>"],
  "projectSpecific": ["<question1>", "<question2>"],
  "skillGap": ["<question1>", "<question2>"]
}
Do not use markdown blocks like \`\`\`json. Just output the raw JSON object.
    `.trim();

    const inputData = `Candidate Information:
Skills: ${user.skills || 'Not specified'}

Job Information:
Company: ${app.company_name}
Role: ${app.role}
Job Description: ${app.job_description || 'Not specified'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: inputData,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const prepData = JSON.parse(response.text);
    
    // Save to DB
    await Application.saveAIPrep(app.id, req.user.id, prepData);

    res.json(prepData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate interview prep.' });
  }
};

const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const ai = getAI(res);
    if (!ai) return;

    const resume = await Resume.findByIdAndUserId(resumeId, req.user.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const systemInstruction = `
You are an expert resume reviewer. Analyze the provided resume text.
Provide constructive feedback and identify key skills.
Respond exclusively with a JSON object in this exact format:
{
  "detectedSkills": ["<skill1>", "<skill2>"],
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "overallScore": <0-100 integer>
}
Do not use markdown blocks like \`\`\`json. Just output the raw JSON object.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Resume Content:\n${resume.content || 'No content provided'}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const analysisData = JSON.parse(response.text);
    
    // Update the resume with analysis
    await Resume.update(resumeId, req.user.id, { 
      name: resume.name, 
      description: resume.description, 
      content: resume.content,
      analysis: JSON.stringify(analysisData) 
    });

    res.json(analysisData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to analyze resume.', error: error.message });
  }
};

module.exports = {
  generateCoverLetter,
  generateJobMatch,
  generateInterviewPrep,
  analyzeResume
};
