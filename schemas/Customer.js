const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  info: String,
  phone: String,
});

module.exports = mongoose.model("Customer", customerSchema);
