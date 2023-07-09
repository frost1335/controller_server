const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  getOne,
  removeOne,
} = require("../controller/groups");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/select/:groupId").delete(removeOne).patch(editOne).get(getOne);

module.exports = router;
