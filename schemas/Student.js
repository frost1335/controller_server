const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  date: Date,
  quantity: Number,
  method: String,
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
  paymentHistory: [paymentSchema],
});

module.exports = mongoose.model("Student", studentSchema);
