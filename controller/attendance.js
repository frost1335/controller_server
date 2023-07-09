exports.getAll = (req, res, next) => {
  res.send("all attendances");
};

exports.getOne = (req, res, next) => {
  res.send("one attendance " + req.params.attendanceId);
};

exports.editOne = (req, res, next) => {
  res.send("edit an attendance " + req.params.attendanceId);
};
