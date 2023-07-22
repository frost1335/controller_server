const mongoose = require("mongoose");
const Teacher = require("../schemas/Teacher");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = asyncHandler(async (req, res) => {
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

  res.status(200).json({
    success: true,
    data: teachers,
  });
});

exports.createOne = asyncHandler(async (req, res) => {
  await Teacher.create({ ...req.body });

  res.status(201).json({
    success: true,
    message: "O'qituvchi qo'shildi",
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { teacherId } = req.params;

  if (!mongoose.isValidObjectId(teacherId)) {
    return next(new ErrorResponse(`O'qituvchi ID-${teacherId} toplimadi`, 404));
  }

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
        info: 1,
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

  res.status(200).json({
    success: true,
    data: teacher[0],
  });
});

exports.editOne = asyncHandler(async (req, res, next) => {
  const { teacherId } = req.params;
  const teacher = req.body;

  if (!mongoose.isValidObjectId(teacherId)) {
    return next(new ErrorResponse(`O'qituvchi ID-${teacherId} toplimadi`, 404));
  }

  await Teacher.updateOne(
    { _id: teacherId },
    { ...teacher, _id: teacherId },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "O'qituvchi ma'lumotlari o'zgartirildi",
  });
});

exports.removeOne = asyncHandler(async (req, res, next) => {
  const { teacherId } = req.params;

  if (!mongoose.isValidObjectId(teacherId)) {
    return next(new ErrorResponse(`O'qituvchi ID-${teacherId} toplimadi`, 404));
  }

  await Teacher.deleteOne({ _id: teacherId });

  res.status(200).json({ success: true, message: "O'qituvchi o'chirildi" });
});
