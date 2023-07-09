const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  getOne,
  removeOne,
  detachField,
} = require("../controller/groups");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/select/:groupId").delete(removeOne).patch(editOne).get(getOne);
router.route("/:groupId/detach").put(detachField);

module.exports = router;
