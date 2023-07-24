const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return next(new ErrorResponse("Iltimos ro'yxatdan o'ting", 403));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return next(
        new ErrorResponse("Ruxsat Berilmadi! Ro'yxatdan o'ting", 403)
      );
    req.user = user;
    next();
  });
};
