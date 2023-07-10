const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({});

const groupSchema = new mongoose.Schema({
  name: String,
  info: String,
  course: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Course",
  },
  teacher: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Teacher",
  },
  students: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Student",
      unique: true,
    },
  ],
  days: Array,
  time: Array,
  attendance: attendanceSchema,
});

module.exports = mongoose.model("Group", groupSchema);
