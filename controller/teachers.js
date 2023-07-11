const Teacher = require("../schemas/Teacher");

exports.getAll = async (req, res) => {
  try {
    const teachers = await Teacher.aggregate([
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "teacher",
          as: "groups",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          groupsCount: { $size: "$groups.name" },
        },
      },
    ]);

    res.json(teachers);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res) => {
  try {
    const teacher = await Teacher.create({ ...req.body });

    res.json(teacher).status(201);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findOne({ _id: teacherId });

    res.json(teacher);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res) => {
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

exports.removeOne = async (req, res) => {
  const { teacherId } = req.params;
  try {
    await Teacher.deleteOne({ _id: teacherId });

    res.json({ success: true, message: "Teacher is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};
