const Game = require("../../models/game");

const gameIdGET = async (req, res) => {
  try {
    const gameId = req.params.id;
    let select = "";

    /* FILTERS */
    if (req.query.action === "pokemons") {
      select = "pokemons";
    }
    if (req.query.action === "dir") {
      select = "name dir";
    }

    /* GAMES RESPONSE */
    const game = await Game.findById(gameId, select);

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = gameIdGET;
