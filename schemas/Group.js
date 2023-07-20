const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  month: {
    type: String,
    required: [true, "Yo'qlama oyi majburiy"],
  },
  year: {
    type: Number,
    required: [true, "Yo'qlama yili majburiy"],
  },
  monthIndex: {
    type: Number,
    required: [true, "Yo'qlama oy indexi majburiy"],
  },
  current: {
    type: Boolean,
    required: true,
  },
  studentList: [
    {
      studentId: {
        type: mongoose.Types.ObjectId,
        ref: "Student",
        required: [true, "Yo'qlama studenti majburiy"],
      },
      lessons: {
        type: Array,
        required: [true, "Yo'qalama darslari majburiy"],
      },
    },
  ],
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Guruh nomi majburiy"],
  },
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
  attendance: [attendanceSchema],
});

module.exports = mongoose.model("Group", groupSchema);
