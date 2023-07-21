const { isValidObjectId } = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Customer = require("../schemas/Customer");
const ErrorResponse = require("../utils/errorResponse");

exports.getAll = asyncHandler(async (req, res) => {
  const customers = await Customer.find();

  res.status(200).json({
    success: true,
    data: customers,
  });
});

exports.createOne = asyncHandler(async (req, res, next) => {
  await Customer.create({ ...req.body });

  res.status(200).json({ success: true, message: "Mijoz qo'shildi" });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const { customerId } = req.params;

  if (!isValidObjectId(customerId)) {
    return next(new ErrorResponse(`Mijoz ID-${customerId} toplimadi`, 404));
  }

  const customer = await Customer.findOne({ _id: customerId });

  res.status(200).json({
    success: true,
    data: customer,
  });
});

exports.editOne = asyncHandler(async (req, res, next) => {
  const { customerId } = req.params;
  const customer = req.body;

  if (!isValidObjectId(customerId)) {
    return next(new ErrorResponse(`Mijoz ID-${customerId} toplimadi`, 404));
  }

  await Customer.updateOne(
    { _id: customerId },
    { ...customer, _id: customerId },
    { new: true }
  );

  res
    .status(200)
    .json({ success: true, message: "Mijoz ma'lumotlari o'zgartirildi" });
});

exports.removeOne = asyncHandler(async (req, res, next) => {
  const { customerId } = req.params;

  if (!isValidObjectId(customerId)) {
    return next(new ErrorResponse(`Mijoz ID-${customerId} toplimadi`, 404));
  }

  await Customer.deleteOne({ _id: customerId });

  res.status(200).json({ success: true, message: "Mijoz o'chirildi" });
});
