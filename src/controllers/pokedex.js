const Pokedex = require("../models/pokedex");

const pokedexGET = async (req, res) => {
  try {
    let query = {};
    if (req.query.name) {
      query.name = req.query.name;
    }

    const pokedex = await Pokedex.find(query);

    res.json({ pokedex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  pokedexGET,
};
