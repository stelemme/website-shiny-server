const mongoose = require("mongoose");
const { Schema } = mongoose;

gameSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  sort: {
    type: Number,
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
  balls: [{
    name: {
      type: String,
      required: true
    },
    sprite: {
      type: String,
      required: true
    },
  }],
  marks: [{
    name: {
      type: String,
      required: true
    },
    sprite: {
      type: String,
      required: true
    },
  }],
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
      required: true
    },
    function: {
      type: String,
    },
    categories: {
      type: [String],
    },
    odds: {
      type: Number,
    },
    rolls: {
      type: Number,
    },
    charmRolls: {
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
