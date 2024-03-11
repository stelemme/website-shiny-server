const Pokedex = require("../models/pokedex");
const Game = require("../models/game");
const axios = require("axios");

const pokedexGET = async (req, res) => {
  try {
    let query = {};
    const sort = { pokedexNo: 1 };

    /* FILTERS */
    if (req.query.name) {
      query.name = req.query.name;
    }
    if (req.query.gen === "Gen 1") {
      query.pokedexNo = { $lte: 151 };
    } else if (req.query.gen === "Gen 2") {
      query.pokedexNo = { $gt: 151, $lte: 251 };
    } else if (req.query.gen === "Gen 3") {
      query.pokedexNo = { $gt: 251, $lte: 386 };
    } else if (req.query.gen === "Gen 4") {
      query.pokedexNo = { $gt: 386, $lte: 493 };
    } else if (req.query.gen === "Gen 5") {
      query.pokedexNo = { $gt: 493, $lte: 649 };
    } else if (req.query.gen === "Gen 6") {
      query.pokedexNo = { $gt: 649, $lte: 721 };
    } else if (req.query.gen === "Gen 7") {
      query.pokedexNo = { $gt: 721, $lte: 809 };
    } else if (req.query.gen === "Gen 8") {
      query.pokedexNo = { $gt: 809, $lte: 905 };
    } else if (req.query.gen === "Gen 9") {
      query.pokedexNo = { $gt: 905 };
    }

    /* FILTER IF IN GAME */
    if (req.query.game) {
      try {
        const response = await Game.findById(req.query.game, "pokemons");
        const gamePokemons = response.data.game.pokemons;

        query.name = { $in: gamePokemons };
      } catch (error) {
        console.log(error);
      }
    }

    /* RETURNS A LIST OF POKEMONS */
    if (req.query.pokemonList) {
      const pokemonList = await Pokedex.find({}, "name");
      const names = pokemonList.map((pokemon) => pokemon.name);

      res.json({ pokemonList: names });

      /* RETURNS A LIST OF FORMS */
    } else if (req.query.formsList) {
      const formsList = await Pokedex.find({}, "forms.name");
      const names = formsList.reduce((accumulator, pokemon) => {
        const formNames = pokemon.forms.map((form) => form.name);
        return accumulator.concat(formNames);
      }, []);

      res.json({ formsList: names });

      /* BACKUPS THE DATA */
    } else if (req.query.backup) {
      const result = await Pokedex.aggregate([
        {
          $sort: {
            pokedexNo: 1,
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
          },
        },
      ]);

      res.json(result);

      /* RETURNS A LIST OF FORMS & EVOLUTIONS OF A CERTAIN POKEMON */
    } else if (req.query.evolutions) {
      const pokemon = await Pokedex.find(
        query,
        "name pokedexNo evolutions types forms sprite"
      );

      const game = await Game.findOne({ name: req.query.game });
      const pokemonList = game ? game.pokemons : [];
      const formList = game ? game.forms : [];

      const evolutions = [];
      const forms = [];

      for (const form of pokemon[0].forms) {
        console.log(form)
        if (formList.includes(form.name)) {
          forms.push(form);
        }
      }

      for (const name of pokemon[0].evolutions) {
        query.name = name;
        const evolution = await Pokedex.find(
          query,
          "name pokedexNo types forms sprite"
        );

        for (const form of evolution[0].forms) {
          if (formList.includes(form.name)) {
            forms.push(form);
          }
        }

        delete evolution[0]._doc.forms;
        if (pokemonList.includes(evolution[0]._doc.name)) {
          evolutions.push(evolution[0]);
        }
      }

      res.json({ forms: forms, evolutions: evolutions });

      /* POKEDEX RESPONSE */
    } else {
      const pokedex = await Pokedex.find(query).sort(sort);

      /* ADD FORMS TO POKEDEX */
      if (req.query.action === "forms") {
        forms = [].concat(
          ...pokedex
            .map((pokemon) => pokemon.forms)
            .filter((formsArray) => formsArray.length > 0)
        );

        pokedex.push(
          ...forms.filter(
            (item, index, array) =>
              array.findIndex((other) => other.name === item.name) === index
          )
        );
      }

      res.json(pokedex);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  pokedexGET,
};
