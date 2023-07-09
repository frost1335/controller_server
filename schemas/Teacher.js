const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  course: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Course",
  },
  groups: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Group",
    },
  ],
  phone: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);
