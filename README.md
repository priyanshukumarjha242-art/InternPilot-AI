InternPilot – AI‑Powered Resume Builder & Interview Prep
InternPilot Logo

“Turn your resume into a personal AI career coach.”

📖 Table of Contents
Section	Description
Overview	What InternPilot does and why it matters
Features	Core capabilities powered by Gemini
Screenshots	Quick UI glimpse
Tech Stack	Languages, frameworks & services
Getting Started	Run the app locally (backend + frontend)
Configuration	Required environment variables
API Reference	Backend routes you’ll call from the UI
Folder Structure	Where the code lives
Contributing	How to help improve InternPilot
License	Open‑source terms
🪁 Overview
InternPilot is a full‑stack web application that helps students and early‑career professionals craft better resumes, generate cover letters, and practice interview questions – all powered by Google Gemini 3.7 Flash.

Upload a PDF/TXT résumé → the backend parses it and sends the raw text to Gemini.
Gemini returns actionable feedback, a cover‑letter draft, and a list of interview‑prep questions.
The UI displays results instantly, letting users iterate on their documents without ever leaving the browser.
Why it’s cool – No more manually tweaking a resume and hunting for generic interview tips. InternPilot gives you personalised, AI‑driven guidance that evolves as you upload new versions.

✨ Features
Feature	Description
Resume Upload & Parsing	Drag‑&‑drop or browse a file. Uses pdf-parse for PDFs and plain‑text handling for .txt.
AI Feedback	Gemini analyses the resume and highlights strengths, weaknesses, and missing sections (e.g., quantifiable achievements).
Cover‑Letter Generation	One‑click generation of a customised cover letter targeting a chosen job title.
Interview Prep	Generates 5‑10 tailored interview questions (behavioral & technical) based on the resume content.
Real‑time UI	React + Vite frontend with smooth transitions (glass‑morphism cards, subtle micro‑animations).
Secure Auth	JWT‑based authentication (email + password) – all secrets are stored in .env and never pushed to Git.
Docker Ready	Dockerfile for the backend makes it easy to spin up an isolated environment.
Extensible	Adding new AI‑powered endpoints (e.g., skill‑match, resume scoring) requires only a tiny controller change.
📸 Screenshots
Upload & Analyze	AI Feedback Card
Upload UI	Feedback UI
(Images are stored in the repository under assets/. Feel free to replace them with your own screenshots.)

🛠️ Tech Stack
Layer	Technology
Frontend	React 18, Vite, Tailwind CSS (used only for layout utilities), axios for API calls
Backend	Node 20, Express 4, SQLite 3 (lightweight DB for resumes), dotenv, jsonwebtoken
AI	@google/genai (Gemini 3.7 Flash) – models.generateContent API
Testing	Jest + React Testing Library (frontend), Mocha + Chai (backend)
Packaging	Docker for backend, Vite build for frontend
CI	GitHub Actions (runs lint, tests, builds Docker image)
🚀 Getting Started (Local Development)
Note – This README intentionally omits cloud‑deployment steps. Follow the “Local dev” instructions to run everything on your machine.

1️⃣ Prerequisites
Tool	Minimum version
Node	20.x (LTS)
npm	10.x
Git	2.30+
Docker (optional for DB isolation)	24.x
2️⃣ Clone the repo
bash

git clone https://github.com/priyanshukumarjha242-art/InternPilot-AI.git
cd InternPilot-AI
3️⃣ Backend – Install & Run
bash

# move to backend folder
cd backend
# install dependencies (node_modules are ignored in git)
npm ci
# copy the sample env file & add your Gemini key
cp .env.example .env
# Edit .env → set GEMINI_API_KEY=YOUR_KEY and JWT_SECRET=anySecret
# Start the server (nodemon watches for changes)
npm run dev   # → http://localhost:5001
The server will automatically create database.sqlite in the root of backend/ if it doesn’t exist.

4️⃣ Frontend – Install & Run
bash

# open a new terminal window
cd ../frontend
npm ci
npm run dev   # → http://localhost:5173
The Vite dev server proxies API requests to http://localhost:5001/api (configured in vite.config.js).

5️⃣ Try it out
Open http://localhost:5173 in your browser.
Register a new account (email + password).
Upload a dummy_resume.txt (provided in the repo).
Click ✨ AI Analyze – you should see AI feedback, cover‑letter, and interview questions appear instantly.
🔧 Configuration
All secrets reside in backend/.env (never committed).

Variable	Description	Example
GEMINI_API_KEY	Gemini API key (project‑level)	AIzaSy...
JWT_SECRET	Secret for signing JWT tokens	super_secret_key_2026
PORT	Backend port (default 5001)	5001
DATABASE_PATH	Path to SQLite DB file	./database.sqlite
Tip: Keep the .env file out of version control (gitignore).

📡 API Reference
All routes are prefixed with /api and expect a valid Bearer JWT token (except /auth/*).

Method	Endpoint	Description	Request Body (JSON)
POST	/auth/register	Create a new user	{ "email": "you@domain.com", "password": "myPass123" }
POST	/auth/login	Get JWT	{ "email": "...", "password": "..." }
POST	/uploads/resume	Upload a resume file (multipart/form‑data)	resume (file) + name (string)
POST	/ai/analyze-resume	Run Gemini analysis on the most recent resume	{ "resumeId": 3 }
POST	/ai/generate-cover-letter	Generate a cover letter	{ "resumeId": 3, "jobTitle": "Software Engineer" }
POST	/ai/interview-prep	Produce interview questions	{ "resumeId": 3 }
GET	/resumes	List all resumes for the logged‑in user	—
GET	/resumes/:id	Download a specific resume (PDF/TXT)	—
Responses are JSON objects with a data field (or error on failure).

📁 Folder Structure

InternPilot-AI/
├─ backend/                # Express API
│   ├─ controllers/        # AI & auth handlers
│   ├─ models/             # SQLite DB helper
│   ├─ routes/             # Express routers
│   ├─ .env.example        # Template env file
│   ├─ Dockerfile
│   └─ database.sqlite     # (created on first run)
├─ frontend/               # React + Vite UI
│   ├─ src/
│   │   ├─ components/     # UI widgets (UploadCard, FeedbackCard…)
│   │   ├─ pages/          # Resumes.jsx, Login.jsx, Dashboard.jsx
│   │   └─ api/            # Axios wrapper
│   └─ vite.config.js
├─ assets/                 # Screenshots, logo, demo data
├─ .github/workflows/      # CI pipelines
└─ README.md               # <‑‑ you’re reading this!
🤝 Contributing
Fork the repository and create a feature branch.

Follow the conventional commits format (feat:, fix:, docs: …).

Run lint and tests locally:

bash

# Backend tests
cd backend && npm test
# Frontend tests
cd ../frontend && npm test
Submit a Pull Request – CI will automatically lint, run tests, and build the Docker image.

Good first issues – look for the good first issue label in the GitHub Issues tab.

📜 License
This project is licensed under the MIT License – feel free to use, modify, and redistribute it (as long as you keep the attribution).

🎉 Quick Recap
AI‑driven resume analysis using Gemini’s newest model.
Zero‑cost local development – just Node 20, SQLite, and your Gemini key.
Modular architecture that makes adding new AI endpoints a breeze.
Enjoy building with InternPilot, and may your next interview be a breeze!
