const { default: mongoose, isValidObjectId } = require("mongoose");
const Course = require("../schemas/Course");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = asyncHandler(async (req, res) => {
  const courses = await Course.find();

  res.status(200).json({
    success: true,
    data: courses,
  });
});

exports.createOne = asyncHandler(async (req, res) => {
  await Course.create({ ...req.body });

  res.status(201).json({
    success: true,
    message: "Kurs qo'shildi",
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) {
    return next(new ErrorResponse(`Kurs ID-${courseId} toplimadi`, 404));
  }

  const course = await Course.aggregate([
    {
      $match: {
        _id: new ObjectId(courseId),
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "course",
        as: "groups",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: course[0],
  });
});

exports.editOne = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const course = req.body;

  if (!isValidObjectId(courseId)) {
    return next(new ErrorResponse(`Kurs ID-${courseId} toplimadi`, 404));
  }

  await Course.updateOne(
    {
      _id: courseId,
    },
    { ...course, _id: courseId },
    { new: true }
  );

  res.json({
    success: true,
    message: "Kurs ma'lumotlari o'zgartirildi",
  });
});

exports.removeOne = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) {
    return next(new ErrorResponse(`Kurs ID-${courseId} toplimadi`, 404));
  }

  await Course.deleteOne({ _id: courseId });

  res.status(200).json({ success: true, message: "Kurs o'chirildi" });
});
