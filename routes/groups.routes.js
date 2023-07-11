const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  getOne,
  removeOne,
  detachField,
  getMinGroups,
  addStudents,
  removeStudent,
  replaceStudent,
} = require("../controller/groups");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/min").get(getMinGroups);
router.route("/select/:groupId").delete(removeOne).patch(editOne).get(getOne);
router.route("/:groupId/detach").put(detachField);
router.route("/:groupId/add/students").put(addStudents);
router.route("/:groupId/remove/student").put(removeStudent);
router.route("/:groupId/replace/student").put(replaceStudent);

module.exports = router;
