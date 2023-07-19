const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema([
  {
    month: String,
    monthIndex: Number,
    current: Boolean,
    students: [
      {
        studentId: {
          type: mongoose.Types.ObjectId,
          ref: "Student",
        },
        lessons: Array,
      },
    ],
  },
]);

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
      unique: false,
    },
  ],
  days: Array,
  time: Array,
  attendance: [
    {
      month: String,
      monthIndex: Number,
      current: Boolean,
      studentList: [
        {
          studentId: {
            type: mongoose.Types.ObjectId,
            ref: "Student",
          },
          lessons: Array,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Group", groupSchema);
