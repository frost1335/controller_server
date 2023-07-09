const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  getOne,
  removeOne,
} = require("../controller/courses");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/select/:courseId").delete(removeOne).patch(editOne).get(getOne);

module.exports = router;
