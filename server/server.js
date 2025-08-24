// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const AudioReport = require('./models/AudioReport');
const { transcribeAudio } = require('./services/transcriptionService');
const { analyzeTranscript } = require('./services/analysisService');

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `interview-audio-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('InterviewInsights server is running!'));

app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).send('No audio file uploaded.');

  const filePath = req.file.path;
  // --- NEW: Get title and thumbnail from the request body ---
  const { videoTitle, videoThumbnailUrl } = req.body;
  // --------------------------------------------------------
  
  try {
    const transcript = await transcribeAudio(filePath);
    const analysis = await analyzeTranscript(transcript);

    // --- NEW: Add title and thumbnail when saving ---
    const report = new AudioReport({ 
        ...analysis, 
        transcript,
        videoTitle: videoTitle,
        videoThumbnailUrl: videoThumbnailUrl
    });
    // ----------------------------------------------
    await report.save();
    res.status(200).json(report);
    
  } catch (error) {
    console.error('❌ Error in processing pipeline:', error);
    res.status(500).json({ error: 'Failed to process audio.' });
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await AudioReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const report = await AudioReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json({ msg: 'Report deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));