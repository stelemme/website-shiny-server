const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();

app.use(express.json());
mongoose.set("strictQuery", false);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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
