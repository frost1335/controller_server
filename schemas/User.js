const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    first: {
      type: String,
      required: [true, "Foydalanuvchi ismi majburiy!"],
    },
    last: {
      type: String,
      required: [true, "Foydalanuvchi familyasi majburiy!"],
    },
  },
  phone: {
    type: String,
    required: [true, "Foydalanuvchi tel. raqami majburiy!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Foydalanuvchi paroli majburiy!"],
    minlength: 6,
    select: false,
  },
  owner: {
    type: Boolean,
  },
});

module.exports = mongoose.model("User", userSchema);
