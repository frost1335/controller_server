const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: [true, "O'qituvchi ismi majburiy"],
    },
    last: {
      type: String,
      required: [true, "O'qituvchi familyasi majburiy"],
    },
  },
  phone: {
    type: String,
    required: [true, "O'qituvchi tel. raqami majburiy"],
  },
  info: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);
