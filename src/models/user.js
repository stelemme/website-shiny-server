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
  ongoingCounterSortAll: {
    type: String,
    required: true
  },
  completedCounterSortAll: {
    type: String,
    required: true
  },
  shiniesSort: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("User", userSchema);