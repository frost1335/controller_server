const mongoose = require("mongoose");
const Group = require("../schemas/Group");
const getLessons = require("../utils/getLessons");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = asyncHandler(async (req, res) => {
  const groups = await Group.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
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
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
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
              _id: 1,
            },
          },
        ],
        as: "students",
      },
    },
    {
      $project: {
        name: 1,
        time: 1,
        days: 1,
        studentsCount: { $size: "$students" },
        course: { $arrayElemAt: ["$course.name", 0] },
        teacher: { $arrayElemAt: ["$teacher.name", 0] },
      },
    },
    {
      $project: {
        students: 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: groups,
  });
});

exports.createOne = asyncHandler(async (req, res) => {
  await Group.create({ ...req.body });

  res.status(201).json({
    status: true,
    message: "Guruh qo'shildi",
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  const group = await Group.aggregate([
    {
      $match: {
        _id: new ObjectId(groupId),
      },
    },
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
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
        localField: "course",
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
          {
            $sort: {
              name: -1,
            },
          },
        ],
        as: "students",
      },
    },
    {
      $project: {
        name: 1,
        info: 1,
        students: 1,
        days: 1,
        time: 1,
        teacher: { $arrayElemAt: ["$teacher", 0] },
        course: { $arrayElemAt: ["$course", 0] },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: group[0],
  });
});

exports.editOne = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const group = req.body;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.updateOne(
    { _id: groupId },
    {
      ...group,
      _id: groupId,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Guruh ma'lumotlari o'zgartirildi",
  });
});

exports.removeOne = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.deleteOne({ _id: groupId });

  res.status(200).json({ success: true, message: "Guruh o'chirildi" });
});

exports.detachField = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.updateOne(
    { _id: groupId },
    {
      $unset: req.body,
    }
  );

  res.status(200).json({ success: true, message: "Guruh o'zgartirildi" });
});

exports.getMinGroups = asyncHandler(async (req, res, next) => {
  const { groupId } = req.query;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  const groups = await Group.aggregate([
    {
      $match: {
        _id: { $not: { $eq: new ObjectId(groupId) } },
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
              _id: 1,
            },
          },
        ],
        as: "students",
      },
    },
    {
      $project: {
        name: 1,
        time: 1,
        days: 1,
        studentsCount: { $size: "$students" },
      },
    },
    {
      $project: {
        students: 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: groups,
  });
});

exports.addStudents = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  if (!req.body.length) {
    return next(new ErrorResponse(`O'quvchi topilmadi`, 400));
  }

  const group = await Group.findOne(
    { _id: groupId },
    { attendance: 1, days: 1 }
  );

  const students = getLessons(group, [...req.body]);

  await Group.updateOne(
    { _id: groupId },
    {
      $push: {
        students: {
          $each: [...req.body],
        },
        "attendance.$[month].studentList": {
          $each: [...students],
        },
      },
    },
    {
      arrayFilters: [{ "month.current": true }],
    }
  );

  res
    .status(200)
    .json({ success: true, message: "O'quvchi guruhga qo'shildi" });
});

exports.removeStudent = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.updateOne(
    { _id: groupId },
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

  res
    .status(200)
    .json({ success: true, message: "O'quvchi guruhdan chiqarildi" });
});

exports.replaceStudent = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { studentId, newGroupId } = req.body;

  if (
    !mongoose.isValidObjectId(groupId) &&
    !mongoose.isValidObjectId(newGroupId)
  ) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  if (!mongoose.isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

  await Group.updateOne(
    { _id: new ObjectId(groupId) },
    {
      $pull: {
        students: new ObjectId(studentId),
      },
    }
  );

  await Group.updateOne(
    {
      _id: newGroupId,
    },
    {
      $push: {
        students: new ObjectId(studentId),
      },
    }
  );

  res
    .status(200)
    .json({ success: true, message: "O'quvchi guruhi almashtirildi" });
});
