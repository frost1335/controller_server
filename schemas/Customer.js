const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: [true, "Mijoz ismi majburiy!"],
    },
    last: {
      type: String,
      required: [true, "Mijoz familyasi majburiy!"],
    },
  },
  phone: {
    type: String,
    required: [true, "Mijoz tel. raqami majburiy!"],
  },
  info: String,
});

module.exports = mongoose.model("Customer", customerSchema);
