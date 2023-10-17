const Game = require("../models/game");

const gameGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    const sort = { sort: 1 }
    if (req.query.name) {
      query.name = req.query.name;
    }
    
    if (req.query.action === "form") {
      select = "name gen sprite locations shinyCharm dir methods sort balls";
    }
    
    if (req.query.action === "select") {
      select = "name gen sprite dir";
    }

    const game = await Game.find(query, select).sort(sort);

    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const gameIdGET = async (req, res) => {
  try {
    const gameId = req.params.id;
    let select = "";
    if (req.query.action === "pokemons") {
      select = "pokemons";
    }

    if (req.query.action === "dir") {
      select = "name dir";
    }

    const game = await Game.findById(gameId, select);

    console.log(game)

    if (!game) {
      res.status(404).json({ error: "Game not found" });
    } else {
      res.json({ game });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  gameGET,
  gameIdGET
};
