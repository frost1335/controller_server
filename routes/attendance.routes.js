const { Router } = require("express");
const {
  addLesson,
  getOne,
  initOne,
  editStudentStatus,
  removeLesson,
} = require("../controller/attendance");
const router = Router();

router
  .route("/select/:groupId")
  .post(initOne)
  .put(addLesson)
  .get(getOne)
  .patch(editStudentStatus);

router.route("/select/:groupId/add").patch(addLesson).put(removeLesson);

module.exports = router;
