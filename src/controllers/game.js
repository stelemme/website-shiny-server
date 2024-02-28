const Game = require("../models/game");

const gameGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    const sort = { sort: 1 };

    /* FILTERS */
    if (req.query.name) {
      query.name = req.query.name;
    }
    if (req.query.action === "form") {
      select = "name gen sprite locations shinyCharm dir methods sort balls";
    }
    if (req.query.action === "select") {
      select = "name gen sprite dir";
    }
    if (req.query.action === "marks") {
      select = "marks";
    }

    /* GEN LIST */
    if (req.query.genList) {
      const games = await Game.find(query, "gen").sort({ gen: 1 });
      const genList = [...new Set(games.map((game) => game.gen))];

      res.json(genList);
    } else if (req.query.ballList) {
      const result = await Game.aggregate([
        {
          $unwind: "$balls",
        },
        {
          $replaceRoot: { newRoot: "$balls" },
        },
        {
          $group: {
            _id: {
              name: "$name",
              sprite: "$sprite",
            },
          },
        },
        {
          $replaceRoot: { newRoot: "$_id" },
        },
        {
          $group: {
            _id: null,
            data: { $push: { k: "$name", v: "$sprite" } },
          },
        },
        {
          $project: {
            _id: 0,
            ballsprites: { $arrayToObject: "$data" },
          },
        },
      ]);

      res.json(result);
    } else if (req.query.backup) {
      const result = await Game.aggregate([
        {
          $project: {
            _id: 0,
            __v: 0,
          },
        },
      ]);

      res.json(result);
    } else {
      /* GAMES RESPONSE */
      const game = await Game.find(query, select).sort(sort);

      res.json(game);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

module.exports = {
  gameGET,
  gameIdGET,
};
