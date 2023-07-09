const Teacher = require("../schemas/Teacher");

exports.getAll = async (req, res, next) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const teacher = await Teacher.create({ ...req.body });

    res.json(teacher).status(201);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res, next) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findOne({ _id: teacherId });

    res.json(teacher);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res, next) => {
  const { teacherId } = req.params;
  const teacher = req.body;
  try {
    const newTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { ...teacher, _id: teacherId },
      { new: true }
    );

    res.json(newTeacher);
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res, next) => {
  const { teacherId } = req.params;
  try {
    await Teacher.deleteOne({ _id: teacherId });

    res.json({ success: true, message: "Teacher is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};
