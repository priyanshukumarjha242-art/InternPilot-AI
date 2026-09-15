const Interview = require('../models/interviewModel');
const Application = require('../models/applicationModel');

const createInterview = async (req, res) => {
  try {
    const { application_id, type, date, status, notes } = req.body;
    
    // Verify the user owns this application
    const app = await Application.findByIdAndUserId(application_id, req.user.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const id = await Interview.create({ application_id, type, date, status, notes });
    res.status(201).json({ message: 'Interview added successfully', id });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInterviews = async (req, res) => {
  try {
    const { application_id } = req.params;
    
    // Verify ownership
    const app = await Application.findByIdAndUserId(application_id, req.user.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const interviews = await Interview.findByApplicationId(application_id);
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, status, notes } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Verify ownership of the parent application
    const app = await Application.findByIdAndUserId(interview.application_id, req.user.id);
    if (!app) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Interview.update(id, { type, date, status, notes });
    res.json({ message: 'Interview updated successfully' });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const app = await Application.findByIdAndUserId(interview.application_id, req.user.id);
    if (!app) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Interview.delete(id);
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview
};
