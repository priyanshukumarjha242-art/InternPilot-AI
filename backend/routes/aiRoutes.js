const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { generateCoverLetter, generateJobMatch, generateInterviewPrep, analyzeResume } = require('../controllers/aiController');

// Protect all AI routes
router.use(authMiddleware);

router.post('/generate-cover-letter', generateCoverLetter);
router.post('/job-match', generateJobMatch);
router.post('/interview-prep', generateInterviewPrep);
router.post('/resume-analyze', analyzeResume);

module.exports = router;
