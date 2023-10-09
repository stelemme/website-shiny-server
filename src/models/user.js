const mongoose = require("mongoose");
const { Schema } = mongoose;

userSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  colorMode: {
    type: String,
    required: true
  },
  ongoingCounterSort: {
    type: String,
    required: true
  },
  completedCounterSort: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("User", userSchema);