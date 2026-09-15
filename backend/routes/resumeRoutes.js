const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createResume, getResumes, getResumeById, updateResume, deleteResume, uploadResume } = require('../controllers/resumeController');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/', createResume);
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;
