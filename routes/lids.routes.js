const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  removeOne,
  getOne,
} = require("../controller/lids");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/select/:lidId").patch(editOne).delete(removeOne).get(getOne);

module.exports = router;
