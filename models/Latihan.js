const mongoose = require('mongoose');

const latihanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [
      {
        nomorSoal: Number,
        jawaban: String
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    totalSoal: {
      type: Number,
      default: 100
    },
    durasi: {
      type: Number,
      default: 5400 // 90 menit dalam detik
    },
    waktuMulai: {
      type: Date,
      default: Date.now
    },
    waktuSelesai: {
      type: Date
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Latihan', latihanSchema);
