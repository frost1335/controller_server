const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);
