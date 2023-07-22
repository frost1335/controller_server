const { default: mongoose, isValidObjectId } = require("mongoose");
const Group = require("../schemas/Group");
const { monthList, weekdays2 } = require("../utils/constants");
const getStudentList = require("../utils/getStudentList");
const { CalendarDate } = require("calendar-date");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllAttendance = asyncHandler(async (req, res) => {
  const attendances = await Group.aggregate([
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
    data: attendances,
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  const group = await Group.aggregate([
    {
      $match: { _id: new ObjectId(groupId) },
    },
    {
      $project: {
        attendance: 1,
        name: 1,
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "attendance.studentList.studentId",
        foreignField: "_id",
        as: "studentList",
        pipeline: [
          {
            $match: {
              name: { $exists: true },
            },
          },
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
      $project: {
        attendance: {
          $map: {
            input: "$attendance",
            as: "table",
            in: {
              month: "$$table.month",
              monthIndex: "$$table.monthIndex",
              current: "$$table.current",
              studentList: {
                $sortArray: {
                  input: {
                    $map: {
                      input: "$$table.studentList",
                      as: "student",
                      in: {
                        student: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$studentList",
                                as: "stud",
                                cond: {
                                  $eq: ["$$stud._id", "$$student.studentId"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        lessons: "$$student.lessons",
                      },
                    },
                  },
                  sortBy: { "student.name": -1 },
                },
              },
            },
          },
        },
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: group?.[0],
  });
});

exports.initOne = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthStr = monthList[month];

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  const group = await Group.findOne(
    { _id: groupId },
    { students: 1, days: 1, attendance: 1, _id: 0 }
  );

  const isAttendance = group?.attendance.find(
    (table) => table.monthIndex === month
  );

  if (isAttendance) {
    return next(new ErrorResponse(`Guruhda avval yo'qlama yaratilgan`, 400));
  } else {
    const studentList = getStudentList(group?.students, group?.days);

    const attendance = {
      month: monthStr,
      year,
      monthIndex: month,
      current: true,
      studentList,
    };

    await Group.updateOne(
      { _id: groupId },
      {
        $push: {
          attendance: {
            ...attendance,
          },
        },
      }
    );

    res
      .status(201)
      .json({ success: true, message: "Guruhga yo'qalama qo'shildi" });
  }
});

exports.editStudentStatus = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { studentId, month, date, status } = req.body;

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  if (!isValidObjectId(studentId)) {
    return next(new ErrorResponse(`O'quvchi ID-${studentId} toplimadi`, 404));
  }

  await Group.updateOne(
    {
      _id: groupId,
      "attendance.month": month,
      "attendance.studentList.studentId": new ObjectId(studentId),
    },
    {
      $set: {
        "attendance.$[month].studentList.$[student].lessons.$[lesson].status":
          status,
      },
    },
    {
      arrayFilters: [
        { "month.month": month },
        { "student.studentId": new ObjectId(studentId) },
        { "lesson.date": date },
      ],
    }
  );

  res.status(200).json({
    success: true,
    message: "O'quvchining yo'qlama holati o'zgartirildi",
  });
});

exports.addLesson = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { month, date } = req.body;
  const weekDay = weekdays2[new CalendarDate(date).weekday - 1].short;

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.updateOne(
    {
      _id: groupId,
      "attendance.month": month,
    },
    {
      $push: {
        "attendance.$[month].studentList.$[].lessons": {
          $each: [
            {
              date,
              weekDay,
              status: null,
            },
          ],
          $sort: {
            date: 1,
          },
        },
      },
    },
    {
      arrayFilters: [
        {
          "month.month": month,
        },
      ],
    }
  );

  res
    .status(201)
    .json({ success: true, message: "Guruhga dars kuni qo'shildi" });
});

exports.removeLesson = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { month, date } = req.body;

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  await Group.updateOne(
    {
      _id: groupId,
      "attendance.month": month,
    },
    {
      $pull: {
        "attendance.$[month].studentList.$[].lessons": { date },
      },
    },
    {
      arrayFilters: [
        {
          "month.month": month,
        },
      ],
    }
  );

  res
    .status(200)
    .json({ success: true, message: "Dars kuni yo'qlamadan chiqarildi" });
});

exports.refreshAttendance = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthStr = monthList[month];

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse(`Guruh ID-${groupId} toplimadi`, 404));
  }

  const group = await Group.findOne(
    { _id: groupId },
    { students: 1, days: 1, attendance: 1, _id: 0 }
  );

  if (!group.days || !group.students.length) {
    return next(
      new ErrorResponse(
        `O'quvchilar va dars kunlari kiritilishi majburiy! `,
        400
      )
    );
  }

  const isCurrent = group.attendance.find(
    (table) => table.monthIndex === month
  )?.current;

  if (isCurrent) {
    return res.status(200).json({
      success: false,
      message: "Bu oy holati aktiv",
    });
  } else {
    const isMonth = group?.attendance?.find(
      (table) => table.monthIndex === month
    );

    if (isMonth) {
      await Group.updateOne(
        { _id: groupId },
        {
          $set: {
            "attendance.$[].current": false,
          },
        }
      );

      await Group.updateOne(
        { _id: groupId },
        {
          $set: {
            "attendance.$[current].current": true,
          },
        },
        {
          arrayFilters: [
            {
              "current.monthIndex": month,
            },
          ],
        }
      );

      return res.status(200).json({
        success: true,
        message: "Yo'qlama holati yangi oyga ko'chirildi",
      });
    } else {
      const studentList = getStudentList(group?.students, group?.days);

      const attendance = {
        month: monthStr,
        year,
        monthIndex: month,
        current: true,
        studentList,
      };
      await Group.updateOne(
        { _id: groupId },
        {
          $push: {
            attendance: {
              ...attendance,
            },
          },
        }
      );

      await Group.updateOne(
        {
          _id: groupId,
        },
        {
          $set: {
            "attendance.$[month].current": false,
          },
        },
        {
          arrayFilters: [
            {
              "month.monthIndex": { $ne: month },
            },
          ],
        }
      );

      return res.status(200).json({
        success: true,
        message: "Yo'qlamaga yangi oy qo'shildi",
      });
    }
  }
});
