const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")

const app = express();

app.use(bodyParser.json({ limit: '2mb' }));

mongoose.set("strictQuery", false);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(cors())

const PORT = process.env.PORT || 5050;

const apiRouter = require("./routes/api");
app.use("/api", apiRouter);

const start = async () => {
  try {
    await mongoose.connect(
      process.env.ATLAS_URI
    );

    // start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (err) {
    console.log(err.message);
  }
};

start();

module.exports = app;
