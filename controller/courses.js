const { default: mongoose } = require("mongoose");
const Course = require("../schemas/Course");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body });

    res.json(course);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res) => {
  const { courseId } = req.params;
  try {
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

    res.json({ ...course[0] });
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res) => {
  const { courseId } = req.params;
  const course = req.body;
  try {
    const newCourse = await Course.findByIdAndUpdate(
      courseId,
      { ...course, _id: courseId },
      { new: true }
    );

    res.json(newCourse);
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res) => {
  const { courseId } = req.params;
  try {
    await Course.deleteOne({ _id: courseId });

    res.json({ success: true, message: "Course is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};
