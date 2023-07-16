const Group = require("../schemas/Group");

exports.getAll = (req, res) => {
  res.send("all attendances");
};

exports.getOne = (req, res) => {
  res.send("one attendance " + req.params.attendanceId);
};

exports.initOne = async (req, res) => {
  const { groupId } = req.params;

  try {
    const attendance = await Group.findOne({ _id: groupId }, { attendance: 1 });

    console.log(new Date().getMonth());

    res.json(attendance);
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
