const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('InternPilot API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
