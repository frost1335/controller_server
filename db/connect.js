const mongoose = require("mongoose");

module.exports = (uri) => {
  mongoose.connect(uri);
  console.log("Mongodb is connected");
};
