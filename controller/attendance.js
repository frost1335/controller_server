const { default: mongoose } = require("mongoose");
const Group = require("../schemas/Group");
const { monthList } = require("../utils/constants");
const getStudentList = require("../utils/getStudentList");
const ObjectId = mongoose.Types.ObjectId;

exports.getAll = (req, res) => {
  res.send("all attendances");
};

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
  const { days } = req.body;
  const month = new Date().getMonth();
  const monthStr = monthList[month];

  try {
    const group = await Group.findOne(
      { _id: groupId },
      { students: 1, attendance: 1, _id: 0 }
    );

    const isAttendance = group?.attendance.find(
      (table) => table.month === monthStr
    );

    if (isAttendance) {
      res.json({
        success: false,
        message: "there is already a table for this month",
      });
    } else {
      const studentList = getStudentList(group?.students, days);

      const attendance = {
        month: monthStr,
        monthIndex: month,
        current: true,
        studentList,
      };

      const data = await Group.updateOne(
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

exports.editOne = (req, res) => {
  res.send("edit an attendance " + req.params.attendanceId);
};

exports.editDetail = (req, res) => {
  res.send("edit an attendance " + req.params.attendanceId);
};
