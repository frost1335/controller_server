const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Group = require("../schemas/Group");

exports.getAll = async (req, res, next) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (e) {
    console.log(e.message);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const group = await Group.create({ ...req.body });

    res.json(group);
  } catch (e) {
    console.log(e.message);
  }
};

exports.getOne = async (req, res, next) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findOne({ _id: groupId }).populate(
      "course teacher",
      { name: 1, price: 1, phone: 1, attendance: -1 }
    );

    res.json(group);
  } catch (e) {
    console.log(e.message);
  }
};

exports.editOne = async (req, res, next) => {
  const { groupId } = req.params;
  const group = req.body;
  try {
    const newGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        ...group,
        _id: groupId,
      },
      { new: true }
    );

    res.json(newGroup);
  } catch (e) {
    console.log(e.message);
  }
};

exports.removeOne = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    await Group.deleteOne({ _id: groupId });

    res.json({ success: true, message: "Group id deleted" });
  } catch (e) {
    console.log(e.message);
  }
};

exports.detachField = async (req, res) => {
  const { groupId } = req.params;
  console.log(req.body);

  try {
    const group = await Group.updateOne(
      { _id: groupId },
      {
        $unset: req.body,
      }
    );

    console.log(group);
  } catch (e) {}
};
