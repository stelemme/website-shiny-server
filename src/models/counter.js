const mongoose = require("mongoose");
const { Schema } = mongoose;

counterSchema = new Schema({
  trainer: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  pokemonCheck: {
    type: Boolean,
    required: true
  },
  game: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  method: {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    prob: {
      type: Number,
      required: true
    },
  },
  sprite: {
    game: {
      type: String,
      required: true
    },
    pokemon: {
      type: String,
    },
    dir: {
      type: String,
    },
  },
  increment: {
    type: Number,
    required: true
  },
  totalEncounters: {
    type: Number,
    default:0,
    required: true
  },
  encounters: {
    type: [Date],
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  },
});

module.exports = mongoose.model("Counter", counterSchema);
