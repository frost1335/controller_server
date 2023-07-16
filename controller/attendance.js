const Group = require("../schemas/Group");
const { monthList } = require("../utils/constants");
const getMonth = require("../utils/getMonth");

exports.getAll = (req, res) => {
  res.send("all attendances");
};

exports.getOne = async (req, res) => {
  const { groupId } = req.params;

  try {
    const attendance = await Group.findOne({ _id: groupId }, { attendance: 1 });

    res.json(attendance);
  } catch (e) {
    console.log(e);
  }
};

exports.initOne = async (req, res) => {
  const { groupId } = req.params;
  const { students, days } = req.body;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthStr = monthList(month);

  try {
    const month = getMonth(year, month);

    const attendance = {
      month: monthStr,
      monthIndex: month,
      students: students.map()
    };

    // const data = await Group.updateOne(
    //   { _id: groupId },
    //   {
    //     $push: {
    //       attendance: {},
    //     },
    //   }
    // );

    res.json({ test: "sda" });
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
