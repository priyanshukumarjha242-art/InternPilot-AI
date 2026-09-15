const Application = require('../models/applicationModel');
const Interview = require('../models/interviewModel');

const createApplication = async (req, res) => {
  try {
    const appId = await Application.create({ ...req.body, user_id: req.user.id });
    const newApp = await Application.findByIdAndUserId(appId, req.user.id);
    res.status(201).json(newApp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getApplications = async (req, res) => {
  try {
    const apps = await Application.findByUserId(req.user.id);
    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findByIdAndUserId(id, req.user.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interviews = await Interview.findByApplicationId(id);
    res.json({ ...app, interviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.getStats(req.user.id);
    // Initialize default stats
    const formattedStats = {
      total: 0,
      'Applied': 0,
      'Interview': 0,
      'Selected': 0,
      'Rejected': 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat.status] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRows = await Application.update(id, req.user.id, req.body);
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const updatedApp = await Application.findByIdAndUserId(id, req.user.id);
    res.json(updatedApp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Application.delete(id, req.user.id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    res.json({ message: 'Application removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { follow_up_date, follow_up_completed } = req.body;
    
    // We fetch current to preserve other fields
    const current = await Application.findByIdAndUserId(id, req.user.id);
    if (!current) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedRows = await Application.update(id, req.user.id, {
      ...current,
      follow_up_date: follow_up_date !== undefined ? follow_up_date : current.follow_up_date,
      follow_up_completed: follow_up_completed !== undefined ? follow_up_completed : current.follow_up_completed
    });

    res.json({ message: 'Follow-up updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const saveCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter } = req.body;
    
    const updatedRows = await Application.saveCoverLetter(id, req.user.id, cover_letter);
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    res.json({ message: 'Cover letter saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationStats,
  updateApplication,
  deleteApplication,
  updateFollowUp,
  saveCoverLetter
};
