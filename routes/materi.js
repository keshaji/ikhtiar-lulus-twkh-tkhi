const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Materi = require('../models/Materi');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Setup multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/materi';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File harus PDF atau Word document'));
    }
  }
});

// Get all materi
router.get('/', async (req, res) => {
  try {
    const materi = await Materi.find().populate('uploadedBy', 'fullName');
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get materi by category
router.get('/category/:category', async (req, res) => {
  try {
    const materi = await Materi.find({ category: req.params.category }).populate('uploadedBy', 'fullName');
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload materi (admin only)
router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !category || !req.file) {
      return res.status(400).json({ message: 'Title, category, dan file wajib diisi' });
    }

    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
    
    const materi = new Materi({
      title,
      description,
      fileUrl: `/uploads/materi/${req.file.filename}`,
      fileType,
      category,
      uploadedBy: req.userId
    });

    await materi.save();
    res.status(201).json({ message: 'Materi berhasil diupload', materi });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete materi (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const materi = await Materi.findByIdAndDelete(req.params.id);
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', 'public', materi.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
