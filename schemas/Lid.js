const mongoose = require("mongoose");

const lidSchema = new mongoose.Schema({
  name: String,
  info: String,
  phone: String,
});

module.exports = mongoose.model("Lid", lidSchema);
