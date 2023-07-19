const { default: mongoose } = require("mongoose");
const Student = require("../schemas/Student");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = async (req, res) => {
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

exports.createOne = async (req, res) => {
  try {
    const student = await Student.create({ ...req.body });

    res.json(student);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.aggregate([
      {
        $match: {
          _id: new ObjectId(studentId),
        },
      },
      {
        $lookup: {
          from: "groups",
          let: { student_id: "$_id" },
          as: "group",
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$student_id", "$students"],
                },
              },
            },
            {
              $project: {
                name: 1,
                teacher: 1,
                course: 1,
                days: 1,
                time: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "group.teacher",
          foreignField: "_id",
          as: "teacher",
          pipeline: [
            {
              $project: {
                name: 1,
                phone: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "group.course",
          foreignField: "_id",
          as: "course",
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          balance: 1,
          paymentHistory: 1,
          group: {
            $arrayElemAt: [{ $getField: "group" }, 0],
          },
          teacher: {
            $arrayElemAt: ["$teacher", 0],
          },
          course: {
            $arrayElemAt: ["$course", 0],
          },
        },
      },
    ]);

    res.json({ ...student[0] });
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res) => {
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

exports.removeOne = async (req, res) => {
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
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: "groups",
          as: "group",
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
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $match: {
          "group.name": { $exists: false },
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          balance: 1,
        },
      },
    ]);

    res.json([...students]);
  } catch (e) {
    console.log(e);
  }
};
