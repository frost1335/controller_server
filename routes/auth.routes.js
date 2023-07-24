const { Router } = require("express");
const {
  authLogin,
  createUser,
  getUser,
  deleteUser,
  getUsers,
} = require("../controller/auth");
const authenticateUser = require("../middleware/authenticateUser");
const router = Router();

router.route("/users").get(authenticateUser, getUsers);
router
  .route("/user")
  .get(authenticateUser, getUser)
  .post(authenticateUser, createUser);
router.route("/login").post(authLogin);
router.route("/user/:userId").delete(authenticateUser, deleteUser);

module.exports = router;
