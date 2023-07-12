const mongoose = require("mongoose");
const { Schema } = mongoose;

gameSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  gen: {
    type: String,
    required: true
  },
  sprite: {
    type: String,
    required: true
  },
  dir: {
    type: String,
    required: true
  },
  balls: {
    type: [String],
    required: true
  },
  locations: {
    type: [String],
    required: true
  },
  shinyCharm: {
    type: Boolean,
    required: true
  },
  methods: [{
    name: {
      type: String,
    },
    function: {
      type: String,
    },
    subCategories: {
      type: [String],
    },
    odds: {
      type: Number,
    },
  }],
  pokemons: {
    type: [String],
    required: true
  },
  forms: {
    type: [String],
    required: true
  },
});

module.exports = mongoose.model("Game", gameSchema);
