const mongoose = require("mongoose");
const { Schema } = mongoose;

pokedexSchema = new Schema({
  pokedexNo: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  types: {
    type: [String],
    required: true
  },
  evolutions: {
    type: [String],
    required: true
  },
  abilities: {
    type: [[String]],
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  sprite: {
    type: String,
    required: true
  },
  forms: [{
    sprite: {
      type: String,
    },
    types: {
      type: [String],
    },
    name: {
      type: String,
    },
  }],
});

module.exports = mongoose.model("Pokedex", pokedexSchema);
