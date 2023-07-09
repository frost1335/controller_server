const { Router } = require("express");
const { getAll, editOne, getOne } = require("../controller/attendance");
const router = Router();

router.route("/").get(getAll);
router.route("/select/:attendanceId").patch(editOne).get(getOne);

module.exports = router();
