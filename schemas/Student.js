const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  date: Date,
  quantity: Number,
  info: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  group: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Group",
  },
  teacher: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Teacher",
  },
  balance: Number,
  paymentHistory: [paymentSchema],
});

module.exports = mongoose.model("Student", studentSchema);
