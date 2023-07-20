const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "To'lov sanasi majburiy"],
  },
  quantity: {
    type: Number,
    required: [true, "To'lov miqdori majburiy"],
  },
  method: {
    type: String,
    required: [true, "To'lov usuli majburiy"],
  },
  info: String,
});

const studentSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: [true, "O'quvchi ismi majburiy"],
    },
    last: {
      type: String,
      required: [true, "O'quvchi familyasi majburiy"],
    },
  },
  phone: {
    type: String,
    required: [true, "O'quvchi tel. raqami majburiy"],
  },
  info: String,
  paymentHistory: [paymentSchema],
});

module.exports = mongoose.model("Student", studentSchema);
