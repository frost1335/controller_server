const bcrypt = require("bcryptjs");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getUser = asyncHandler(async (req, res) => {
  const user = {
    name: req?.user?.name,
    phone: req?.user?.phone,
    owner: req?.user?.owner,
  };

  res.json({
    success: true,
    data: user,
  });
});

exports.authLogin = asyncHandler(async (req, res, next) => {
  const { password, phone } = req.body;

  if (!phone || !password) {
    return next(
      new ErrorResponse("Iltimos barcha ma'lumotlarni kiriting", 400)
    );
  }

  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 403));
  }

  if (await bcrypt.compare(password, user.password)) {
    const accessToken = generateAccessToken({
      name: user?.name,
      phone: user?.phone,
      owner: user?.owner,
      _id: user?._id,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      message: "Siz ro'yxatdan o'tdingiz!",
    });
  } else {
    return next(new ErrorResponse(`Foydalanuvchi ma'lumotlari noto'g'ri`, 401));
  }
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  if (!req?.user?.owner) {
    return next(new ErrorResponse("Foydalanuvchiga ruxsat berilmadi!"));
  }

  const users = await User.aggregate([
    {
      $match: {
        owner: { $not: { $exists: true } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  if (!req?.user?.owner) {
    return next(new ErrorResponse("Foydalanuvchiga ruxsat berilmadi!"));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await User.create({ ...req.body, password: hashedPassword });

  res.status(201).json({
    success: true,
    message: "Foydalanuvchi yaratildi",
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!req?.user?.owner) {
    return next(new ErrorResponse("Foydalanuvchiga ruxsat berilmadi!"));
  }

  await User.deleteOne({ _id: userId });

  res.status(200).json({
    success: true,
    message: "Foydalanuvchi o'chirildi",
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}
