const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationStats,
  updateApplication,
  deleteApplication,
  updateFollowUp,
  saveCoverLetter
} = require('../controllers/applicationController');

// All routes here are protected
router.use(authMiddleware);

router.post('/', createApplication);
router.get('/', getApplications);
router.get('/stats', getApplicationStats);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.put('/:id/followup', updateFollowUp);
router.put('/:id/cover-letter', saveCoverLetter);

module.exports = router;
