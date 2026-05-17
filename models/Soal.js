const mongoose = require('mongoose');

const soalSchema = new mongoose.Schema(
  {
    nomorSoal: {
      type: Number,
      required: true
    },
    pertanyaan: {
      type: String,
      required: true
    },
    opsiA: {
      type: String,
      required: true
    },
    opsiB: {
      type: String,
      required: true
    },
    opsiC: {
      type: String,
      required: true
    },
    opsiD: {
      type: String,
      required: true
    },
    opsiE: {
      type: String,
      required: true
    },
    kunciJawaban: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
      required: true
    },
    pembahasan: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Soal', soalSchema);
