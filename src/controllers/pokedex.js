const Pokedex = require("../models/pokedex");
const axios = require('axios');

const pokedexGET = async (req, res) => {
  try {
    let query = {};
    const sort = { pokedexNo: 1 }
    if (req.query.name) {
      query.name = req.query.name;
    }
    if (req.query.game) {
      try {
        const response = await axios.get(`https://website-shiny-server.vercel.app/api/game/${req.query.game}?action=pokemons`);
        const gamePokemons = response.data.game.pokemons;

        query.name = { $in: gamePokemons };
      } catch (error) {
        console.log(error);
      }
    }

    const pokedex = await Pokedex.find(query).sort(sort);

    if (req.query.action === "forms") {
      forms = [].concat(
        ...pokedex
          .map(pokemon => pokemon.forms)
          .filter(formsArray => formsArray.length > 0)
      );

      pokedex.push(...forms.filter((item, index, array) =>
        array.findIndex((other) => other.name === item.name) === index
      ))
    }

    res.json({ pokedex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  pokedexGET,
};
