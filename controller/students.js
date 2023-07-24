const { default: mongoose, isValidObjectId } = require("mongoose");
const Student = require("../schemas/Student");
const Teacher = require("../schemas/Teacher");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Group = require("../schemas/Group");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = asyncHandler(async (req, res) => {
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
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: students,
  });
});

exports.createOne = asyncHandler(async (req, res) => {
  await Student.create({ ...req.body });

  res.status(201).json({
    success: true,
    message: "O'quvchi qo'shildi",
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  if (!isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

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
        info: 1,
        paymentHistory: {
          $sortArray: {
            input: "$paymentHistory",
            sortBy: {
              date: -1,
            },
          },
        },
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

  res.status(200).json({
    success: true,
    data: student[0],
  });
});

exports.editOne = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const student = req.body;

  if (!isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

  await Student.updateOne(
    { _id: studentId },
    { ...student, _id: studentId },
    { new: true }
  );

  res
    .status(200)
    .json({ success: true, message: "O'quvchi ma'lumotlari o'zgartirildi" });
});

exports.removeOne = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await Student.aggregate([
    {
      $match: {
        _id: studentId,
      },
    },
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
            $project: {
              _id: 1,
            },
          },
        ],
        as: "group",
      },
    },
    {
      $project: {
        group: { $arrayElemAt: ["$group._id", 0] },
        _id: 0,
      },
    },
  ]);

  if (!isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

  if (isValidObjectId(student[0]?.group)) {
    await Group.updateOne(
      { _id: student[0]?.group },
      {
        $pull: {
          students: req.body.student,
          "attendance.$[month].studentList": {
            studentId: req.body.student,
          },
        },
      },
      {
        arrayFilters: [{ "month.current": true }],
      }
    );
  }

  await Student.deleteOne({ _id: studentId });

  res.status(200).json({ success: true, message: "O'quvchi o'chirildi" });
});

exports.makePayment = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  if (!isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

  await Student.updateOne(
    { _id: studentId },
    {
      $push: {
        paymentHistory: {
          date: req.body?.date
            ? new Date(req.body?.date)
            : new Date(Date.now()),
          quantity: +req.body?.quantity || 0,
          method: req.body?.method,
          info: req.body?.info,
        },
      },
    }
  );

  res.status(201).json({ success: true, message: "To'lov qo'shildi" });
});

exports.getSpecStudents = asyncHandler(async (req, res) => {
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
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: students,
  });
});

exports.searchStudents = asyncHandler(async (req, res, next) => {
  const { search } = req.query;

  if (search == "" || !search) {
    return next(new ErrorResponse("Qidiruv ma'lumoti bo'lishi shart"));
  }

  const students = await Student.aggregate([
    {
      $search: {
        index: "student_search",
        text: {
          query: search,
          path: ["name.first", "name.last", "info", "phone"],
        },
      },
    },
    {
      $project: {
        name: 1,
        phone: 1,
        info: 1,
      },
    },
  ]);

  const teachers = await Teacher.aggregate([
    {
      $search: {
        index: "teacher_search",
        text: {
          query: search,
          path: ["name.first", "name.last", "info", "phone"],
        },
      },
    },
    {
      $project: {
        name: 1,
        phone: 1,
        info: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { students: [...students], teachers: [...teachers] },
  });
});
