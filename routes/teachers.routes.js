const { Router } = require("express");
const {
  getAll,
  getOne,
  createOne,
  editOne,
  removeOne,
} = require("../controller/teachers");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/select/:teacherId").delete(removeOne).patch(editOne).get(getOne);

module.exports = router;
