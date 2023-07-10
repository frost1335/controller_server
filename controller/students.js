const Group = require("../schemas/Group");
const Student = require("../schemas/Student");

exports.getAll = async (req, res, next) => {
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: "groups",
          let: { student_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$student_id", "$students"],
                },
              },
            },
            {
              $lookup: {
                from: "teachers",
                localField: "teacher",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      _id: 0,
                    },
                  },
                ],
                as: "teacher",
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
                teacher: 1,
              },
            },
          ],
          as: "group",
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          group: { $arrayElemAt: ["$group.name", 0] },
          teacher: {
            $arrayElemAt: [
              {
                $arrayElemAt: ["$group.teacher.name", 0],
              },
              0,
            ],
          },
          balance: 1,
        },
      },
    ]);

    res.json(students);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const student = await Student.create({ ...req.body });

    res.json(student);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res, next) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findOne({ _id: studentId });

    res.json(student);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res, next) => {
  const { studentId } = req.params;
  const student = req.body;

  try {
    const newStudent = await Student.findByIdAndUpdate(
      studentId,
      { ...student, _id: studentId },
      { new: true }
    );

    res.json(newStudent);
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res, next) => {
  const { studentId } = req.params;

  try {
    await Student.deleteOne({ _id: studentId });

    res.json({ success: true, message: "Student is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.makePayment = async (req, res) => {
  const { studentId } = req.params;
  try {
    await Student.updateOne(
      { _id: studentId },
      {
        $push: {
          paymentHistory: {
            date: req.body?.date || Date.now(),
            quantity: +req.body?.quantity || 0,
            info: req.body?.info,
          },
        },
      }
    );

    res.send("success");
  } catch (e) {
    console.log(e);
  }
};

exports.getSpecStudents = async (req, res) => {
  const { groupId } = req.query;
  try {
    const group = await Group.findOne(
      { _id: groupId },
      { students: 1, _id: 0 }
    );
    const students = (
      await Student.find({}, { name: 1, phone: 1, balance: 1 })
    ).filter((s) => !group?.students.includes(s._id.toString()));

    res.json([...students]);
  } catch (e) {
    console.log(e);
  }
};
