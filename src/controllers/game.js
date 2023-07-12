const Game = require("../models/game");

const gameGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    if (req.query.action === "form") {
      select = "name gen sprite locations shinyCharm dir methods";
    }

    const game = await Game.find(query, select);

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

    const game = await Game.findById(gameId, select);

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
