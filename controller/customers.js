const Customer = require("../schemas/Customer");

exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.find();

    res.json(customers);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res) => {
  try {
    await Customer.create({ ...req.body });

    res.json({ success: true, message: "Customer is created" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res) => {
  const { customerId } = req.params;
  try {
    const customer = await Customer.findOne({ _id: customerId });

    res.json(customer);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res) => {
  const { customerId } = req.params;
  const customer = req.body;

  try {
    const newCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...customer, _id: customerId },
      { new: true }
    );

    res.json({ success: true, message: "Customer is edited" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res) => {
  const { customerId } = req.params;

  try {
    await Customer.deleteOne({ _id: customerId });

    res.json({ success: true, message: "Customer is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};
