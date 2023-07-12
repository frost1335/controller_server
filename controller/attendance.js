exports.getAll = (req, res) => {
  res.send("all attendances");
};

exports.getOne = (req, res) => {
  res.send("one attendance " + req.params.attendanceId);
};

exports.editOne = (req, res) => {
  res.send("edit an attendance " + req.params.attendanceId);
};
