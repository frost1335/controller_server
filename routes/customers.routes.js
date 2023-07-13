const { Router } = require("express");
const {
  getAll,
  createOne,
  editOne,
  removeOne,
  getOne,
} = require("../controller/customers");
const router = Router();

router.route("/").get(getAll).post(createOne);
router
  .route("/select/:customerId")
  .patch(editOne)
  .delete(removeOne)
  .get(getOne);

module.exports = router;
