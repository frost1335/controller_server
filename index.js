const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
require("./db/connect")(process.env.ATLAS_URI);
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hi there");
});

require("./app/routes")(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT || 3000, () => {
  console.log(`Server is alive on ${PORT}`);
});
