const Resume = require('../models/resumeModel');

const createResume = async (req, res) => {
  try {
    const { name, description, content, analysis } = req.body;
    const id = await Resume.create({ user_id: req.user.id, name, description, content, analysis });
    res.status(201).json({ message: 'Resume added successfully', id });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.findByUserId(req.user.id);
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByIdAndUserId(id, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, analysis } = req.body;

    const affected = await Resume.update(id, req.user.id, { name, description, content, analysis });
    if (affected === 0) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }
    res.json({ message: 'Resume updated successfully' });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const affected = await Resume.delete(id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const pdfParse = require('pdf-parse');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let content = '';
    
    // Parse PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      content = data.text;
    } else {
      // If text file
      content = req.file.buffer.toString('utf8');
    }

    const name = req.body.name || req.file.originalname;
    const description = req.body.description || '';

    const id = await Resume.create({ 
      user_id: req.user.id, 
      name, 
      description, 
      content, 
      analysis: null 
    });

    res.status(201).json({ message: 'Resume uploaded successfully', id, content });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error parsing resume', error: error.message });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  uploadResume
};
