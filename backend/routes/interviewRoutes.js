const express = require('express');
const router = express.Router();
const { createInterview, getInterviews, updateInterview, deleteInterview } = require('../controllers/interviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', createInterview);
router.get('/application/:application_id', getInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
