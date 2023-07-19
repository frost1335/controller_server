const { default: mongoose } = require("mongoose");
const Group = require("../schemas/Group");
const { monthList, weekdays2 } = require("../utils/constants");
const getStudentList = require("../utils/getStudentList");
const { CalendarDate } = require("calendar-date");
const ObjectId = mongoose.Types.ObjectId;

exports.getOne = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.aggregate([
      {
        $match: { _id: new ObjectId(groupId) },
      },
      {
        $project: {
          attendance: 1,
          _id: 0,
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
        },
      },
    ]);

    res.json(group?.[0]?.attendance);
  } catch (e) {
    console.log(e);
  }
};

exports.initOne = async (req, res) => {
  const { groupId } = req.params;
  const month = new Date().getMonth();
  const monthStr = monthList[month];

  try {
    const group = await Group.findOne(
      { _id: groupId },
      { students: 1, days: 1, attendance: 1, _id: 0 }
    );

    const isAttendance = group?.attendance.find(
      (table) => table.monthIndex === month
    );

    if (isAttendance) {
      res.json({
        success: false,
        message: "there is already a table for this month",
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

      res.json({ success: true, message: "Attendance is added to the group" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.editStudentStatus = async (req, res) => {
  const { groupId } = req.params;
  const { studentId, month, date, status } = req.body;

  try {
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

    res.json({ success: true, message: "Student status is changed" });
  } catch (e) {
    console.log(e);
  }
};

exports.addLesson = async (req, res) => {
  const { groupId } = req.params;
  const { month, date } = req.body;
  const weekDay = weekdays2[new CalendarDate(date).weekday - 1].short;

  try {
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

    res.json({ success: true, message: "Lesson is added to the list" });
  } catch (e) {
    console.log(e);
  }
};

exports.removeLesson = async (req, res) => {
  const { groupId } = req.params;
  const { month, date } = req.body;

  try {
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

    res.json({ success: true, message: "Lesson is deleted from the list" });
  } catch (e) {
    console.log(e);
  }
};

exports.refreshAttendance = async (req, res) => {
  const { groupId } = req.params;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthStr = monthList[month];

  try {
    const group = await Group.findOne(
      { _id: groupId },
      { students: 1, days: 1, attendance: 1, _id: 0 }
    );

    const isCurrent = group.attendance.find(
      (table) => table.monthIndex === month
    )?.current;

    if (isCurrent) {
      res.json({
        success: false,
        message: "This month is already current",
        data: group,
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

        res.json({
          success: true,
          message: "Current attendance is changed",
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

        res.json({
          success: true,
          message: "Attendance is added to the group",
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};
