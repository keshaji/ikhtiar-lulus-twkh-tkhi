const express = require('express');
const Soal = require('../models/Soal');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all soal
router.get('/', async (req, res) => {
  try {
    const soal = await Soal.find().select('-pembahasan -kunciJawaban').populate('uploadedBy', 'fullName');
    res.json(soal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get soal by ID (dengan jawaban dan pembahasan untuk admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const soal = await Soal.findById(req.params.id).populate('uploadedBy', 'fullName');
    
    if (!soal) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    // Jika bukan admin, jangan tampilkan jawaban dan pembahasan
    if (req.userRole !== 'admin') {
      soal.kunciJawaban = undefined;
      soal.pembahasan = undefined;
    }

    res.json(soal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create soal (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { nomorSoal, pertanyaan, opsiA, opsiB, opsiC, opsiD, opsiE, kunciJawaban, pembahasan } = req.body;

    if (!nomorSoal || !pertanyaan || !opsiA || !opsiB || !opsiC || !opsiD || !opsiE || !kunciJawaban || !pembahasan) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const soal = new Soal({
      nomorSoal,
      pertanyaan,
      opsiA,
      opsiB,
      opsiC,
      opsiD,
      opsiE,
      kunciJawaban,
      pembahasan,
      uploadedBy: req.userId
    });

    await soal.save();
    res.status(201).json({ message: 'Soal berhasil ditambahkan', soal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update soal (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { nomorSoal, pertanyaan, opsiA, opsiB, opsiC, opsiD, opsiE, kunciJawaban, pembahasan } = req.body;

    const soal = await Soal.findByIdAndUpdate(
      req.params.id,
      {
        nomorSoal,
        pertanyaan,
        opsiA,
        opsiB,
        opsiC,
        opsiD,
        opsiE,
        kunciJawaban,
        pembahasan
      },
      { new: true }
    );

    if (!soal) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    res.json({ message: 'Soal berhasil diupdate', soal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete soal (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const soal = await Soal.findByIdAndDelete(req.params.id);
    
    if (!soal) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    res.json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
