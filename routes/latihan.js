const express = require('express');
const Latihan = require('../models/Latihan');
const Soal = require('../models/Soal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Start latihan
router.post('/start', auth, async (req, res) => {
  try {
    const latihan = new Latihan({
      user: req.userId,
      status: 'in_progress'
    });

    await latihan.save();
    res.status(201).json({ message: 'Latihan dimulai', latihanId: latihan._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get soal for latihan (tanpa jawaban)
router.get('/soal/:latihanId', auth, async (req, res) => {
  try {
    const latihan = await Latihan.findById(req.params.latihanId);
    
    if (!latihan) {
      return res.status(404).json({ message: 'Latihan tidak ditemukan' });
    }

    if (latihan.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Tidak diizinkan mengakses latihan ini' });
    }

    const soal = await Soal.find().select('-pembahasan -kunciJawaban');
    res.json(soal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit jawaban
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    const latihan = await Latihan.findById(req.params.id);
    
    if (!latihan) {
      return res.status(404).json({ message: 'Latihan tidak ditemukan' });
    }

    if (latihan.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Tidak diizinkan' });
    }

    // Hitung score
    let score = 0;
    for (let answer of answers) {
      const soal = await Soal.findById(answer.soalId);
      if (soal && soal.kunciJawaban === answer.jawaban) {
        score++;
      }
    }

    latihan.answers = answers;
    latihan.score = score;
    latihan.status = 'completed';
    latihan.waktuSelesai = new Date();

    await latihan.save();

    res.json({ 
      message: 'Jawaban berhasil disubmit',
      score,
      totalSoal: latihan.totalSoal,
      percentage: Math.round((score / latihan.totalSoal) * 100)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get latihan history
router.get('/history', auth, async (req, res) => {
  try {
    const latihan = await Latihan.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(latihan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latihan detail
router.get('/:id', auth, async (req, res) => {
  try {
    const latihan = await Latihan.findById(req.params.id);
    
    if (!latihan) {
      return res.status(404).json({ message: 'Latihan tidak ditemukan' });
    }

    if (latihan.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Tidak diizinkan' });
    }

    res.json(latihan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
