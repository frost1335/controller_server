const { Router } = require("express");
const {
  getAll,
  createOne,
  removeOne,
  editOne,
  getOne,
  makePayment,
  getSpecStudents,
  searchStudents,
  getPaymentHistory,
} = require("../controller/students");
const router = Router();

router.route("/").get(getAll).post(createOne);
router.route("/search").get(searchStudents);
router
  .route("/select/:studentId")
  .delete(removeOne)
  .patch(editOne)
  .get(getOne)
  .post(makePayment);
router.route("/specs").get(getSpecStudents);
router.route("/payment/history").get(getPaymentHistory);

module.exports = router;
