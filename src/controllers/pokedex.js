const Pokedex = require("../models/pokedex");
const Game = require("../models/game");
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
        const response = await Game.findById(req.query.game, "pokemons");

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


    if (req.query.pokemonList) {
      const pokemonList = await Pokedex.find({}, 'name')
      const names = pokemonList.map(pokemon => pokemon.name);

      res.json({ pokemonList: names });
    } else if (req.query.formsList) {
      const formsList = await Pokedex.find({}, 'forms.name')
      const names = formsList.reduce((accumulator, pokemon) => {
        const formNames = pokemon.forms.map(form => form.name);
        return accumulator.concat(formNames);
      }, []);

      res.json({ formsList: names });
    } else if (req.query.evolutions) {
      const pokemon = await Pokedex.find(query, 'name pokedexNo evolutions types forms sprite')

      const game = await Game.findOne({ name: req.query.game });
      const pokemonList = game ? game.pokemons : [];
      const formList = game ? game.forms : [];

      const evolutions = []
      const forms = []

      for (const name of pokemon[0].evolutions) {
        query.name = name
        const evolution = await Pokedex.find(query, 'name pokedexNo types forms sprite')

        for (const form of evolution[0].forms) {
          if (formList.includes(form.name)) {
            forms.push(form)
          }
        }

        delete evolution[0]._doc.forms;
        if (pokemonList.includes(evolution[0]._doc.name)) {
          evolutions.push(evolution[0]);
        }
      }

      res.json({ forms: forms, evolutions: evolutions })
    } else {
      res.json({ pokedex });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  pokedexGET,
};
