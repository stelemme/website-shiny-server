const Shiny = require("../models/shiny");

const shinyGET = async (req, res) => {
  try {
    let query = {};
    let select = "-encounters";
    const sort = {}

    if (req.query.trainer) {
      query.trainer = req.query.trainer;
    }
    if (req.query.action === "counters") {
      query.totalEncounters = { $gt: 0 }
    }
    if (req.query.preview === "counter") {
      select = "name gameSort pokedexNo endDate sprite.game trainer totalEncounters";
    }
    if (req.query.preview === "shiny") {
      select = "name gameSort pokedexNo endDate sprite trainer";
    }
    if (req.query.sort === "gameAsc") {
      sort.gameSort = "asc"
      sort.pokedexNo = "asc"
    }
    if (req.query.sort === "gameDesc") {
      sort.gameSort = "desc"
      sort.pokedexNo = "asc"
    }
    if (req.query.sort === "pokedexNoAsc") {
      sort.pokedexNo = "asc"
    }
    if (req.query.sort === "pokedexNoDesc") {
      sort.pokedexNo = "asc"
    }
    if (req.query.sort === "newest") {
      sort.endDate = "desc"
    }
    if (req.query.sort === "oldest") {
      sort.endDate = "asc"
    }
    if (req.query.sort === "encAsc") {
      sort.totalEncounters = "desc"
    }
    if (req.query.sort === "encDesc") {
      sort.totalEncounters = "asc"
    }

    if (req.query.group) {
      const groups = await Shiny.distinct("group");
      res.json({ groups });
    } else {
      const shiny = await Shiny.find(query, select).sort(sort);
      res.json({ shiny });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const shinyIdGET = async (req, res) => {
  try {
    let select = "";
    const shinyId = req.params.id;

    if (req.query.action === "noEncounters") {
      select="-encounters"
    }

    const shiny = await Shiny.findById(shinyId, select);

    res.json({ shiny });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const shinyPOST = async (req, res) => {
  const shiny = new Shiny(req.body);
  try {
    await shiny.save();

    res.status(201).json({ shiny });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const shinyIdDELETE = async (req, res) => {
  try {
    const shinyId = req.params.id;
    const result = await Shiny.deleteOne({ _id: shinyId });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  shinyGET,
  shinyIdGET,
  shinyPOST,
  shinyIdDELETE
};