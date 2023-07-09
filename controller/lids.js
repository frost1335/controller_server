const Lid = require("../schemas/Lid");

exports.getAll = async (req, res, next) => {
  try {
    const lids = await Lid.find();

    res.json(lids);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    await Lid.create({ ...req.body });

    res.json({ success: true, message: "Lid is created" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res, next) => {
  const { lidId } = req.params;
  try {
    const lid = await Lid.findOne({ _id: lidId });

    res.json(lid);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res, next) => {
  const { lidId } = req.params;
  const lid = req.body;

  try {
    const newLid = await Lid.findByIdAndUpdate(
      lidId,
      { ...lid, _id: lidId },
      { new: true }
    );
 
    res.json({ success: true, message: "Lid is edited" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res, next) => {
  const { lidId } = req.params;

  try {
    await Lid.deleteOne({ _id: lidId });

    res.json({ success: true, message: "Lid is deleted" });
  } catch (e) {
    console.log(e.message);
  }
};
