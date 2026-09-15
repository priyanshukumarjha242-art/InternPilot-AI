const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { updateProfile } = require('../controllers/userController');

// All routes here are protected
router.use(authMiddleware);

router.put('/profile', updateProfile);

module.exports = router;
