const Pokedex = require("../models/pokedex");

const pokedexGET = async (req, res) => {
  try {
    const pokedex = await Pokedex.find();

    res.json({ pokedex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  pokedexGET,
};
