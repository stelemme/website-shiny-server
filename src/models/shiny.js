const mongoose = require("mongoose");
const { Schema } = mongoose;

shinySchema = new Schema({
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
    required: true
  },
  nature: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  ball: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
  },
  level: {
    type: Number,
    required: true
  },
  types: {
    type: [String],
    required: true
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
  geoLocation : {
    name: {
      type: String,
    },
    displayName: {
      type: String,
    },
    position: [{
      type: Number,
    }],
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
    correctedEncounters: {
      type: Number,
    },
    lure: {
      type: Boolean,
    },
    chainMatters: {
      type: Boolean,
    },
    letsGoChain: {
      type: Number,
    },
    sosChain: {
      type: Number,
    },
    radarChain: {
      type: Number,
    },
    researchLevel: {
      type: String,
    },
    svOutbreak: {
      type: String,
    },
    svSparklingPower: {
      type: String,
    },
    group: {
      type: Boolean,
    },
  },
  group: {
    type: String,
  },
  sprite: {
    game: {
      type: String,
      required: true
    },
    pokemon: {
      type: String,
      required: true
    },
    ball: {
      type: String,
      required: true
    },
    dir: {
      type: String,
      required: true
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
    default: 0,
    required: true
  },
  encounters: {
    type: [Date],
    required: true
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
    required: true
  },
  evolutions: [{
    sprite: {
      type: String,
      required: true
    },
    types: {
      type: [String],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    pokedexNo: {
      type: Number,
      required: true
    },
  }],
  forms: [{
    sprite: {
      type: String,
      required: true
    },
    types: {
      type: [String],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    pokedexNo: {
      type: Number,
      required: true
    }
  }],
  stats: {
    probability: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
    },
    meanEncounterTime: {
      type: Number,
    },
    daysHunting: {
      type: Number,
    },
    totalHuntTime: {
      type: Number,
    }
  },
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
});

module.exports = mongoose.model("Shiny", shinySchema);
