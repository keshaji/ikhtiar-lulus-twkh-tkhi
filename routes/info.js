const express = require('express');
const Info = require('../models/Info');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all info
router.get('/', async (req, res) => {
  try {
    const info = await Info.find().populate('createdBy', 'fullName').sort({ createdAt: -1 });
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get info by ID
router.get('/:id', async (req, res) => {
  try {
    const info = await Info.findById(req.params.id).populate('createdBy', 'fullName');
    
    if (!info) {
      return res.status(404).json({ message: 'Info tidak ditemukan' });
    }

    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create info (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title dan content wajib diisi' });
    }

    const info = new Info({
      title,
      content,
      image,
      createdBy: req.userId
    });

    await info.save();
    res.status(201).json({ message: 'Info berhasil dibuat', info });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update info (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const info = await Info.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        image,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!info) {
      return res.status(404).json({ message: 'Info tidak ditemukan' });
    }

    res.json({ message: 'Info berhasil diupdate', info });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete info (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const info = await Info.findByIdAndDelete(req.params.id);
    
    if (!info) {
      return res.status(404).json({ message: 'Info tidak ditemukan' });
    }

    res.json({ message: 'Info berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
