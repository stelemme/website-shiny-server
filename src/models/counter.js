const mongoose = require("mongoose");
const { Schema } = mongoose;

counterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("Counter", counterSchema);
