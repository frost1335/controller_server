const mongoose = require("mongoose");
const Teacher = require("../schemas/Teacher");
const ObjectId = mongoose.Types.ObjectId;

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
          groupsCount: { $size: "$groups" },
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
    const teacher = await Teacher.aggregate([
      {
        $match: {
          _id: new ObjectId(teacherId),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "teacher",
          as: "groups",
          pipeline: [
            {
              $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "course",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "students",
                let: { students_list: "$students" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$_id", "$$students_list"],
                      },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      phone: 1,
                      balance: 1,
                    },
                  },
                ],
                as: "students",
              },
            },
            {
              $project: {
                name: 1,
                students: 1,
                days: 1,
                time: 1,
                course: { $arrayElemAt: ["$course", 0] },
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          groups: 1,
          groupsCount: {
            $size: "$groups",
          },
          studentsCount: {
            $reduce: {
              input: {
                $map: {
                  input: "$groups",
                  as: "group",
                  in: {
                    $size: "$$group.students",
                  },
                },
              },
              initialValue: 0,
              in: { $add: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);

    res.json({ ...teacher[0] });
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
