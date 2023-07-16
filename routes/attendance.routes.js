const { Router } = require("express");
const {
  getAll,
  editOne,
  getOne,
  editDetail,
  initOne,
} = require("../controller/attendance");
const router = Router();

router.route("/").get(getAll);
router
  .route("/select/:groupId")
  .post(initOne)
  .put(editOne)
  .get(getOne)
  .patch(editDetail);

module.exports = router
