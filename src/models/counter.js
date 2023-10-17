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
  pokedexNo: {
    type: Number,
  },
  types: {
    type: [String],
  },
  game: {
    type: String,
    required: true
  },
  gameSort: {
    type: Number,
    required: true
  },
  gen: {
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
    },
    function: {
      type: String,
    },
    shinyCharm: {
      type: Boolean,
      required: true
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
  lowerTimeThreshold: {
    type: Number,
    required: true
  },
  upperTimeThreshold: {
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
});

module.exports = mongoose.model("Counter", counterSchema);
