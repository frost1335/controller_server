const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: String,
  price: Number,
  info: String,
});

module.exports = mongoose.model("Course", courseSchema);
