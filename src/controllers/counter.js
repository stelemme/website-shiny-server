const Counter = require("../models/counter");
const axios = require('axios');

const counterGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    let sort = {}
    if (req.query.trainer) {
      query.trainer = req.query.trainer;
    }
    if (req.query.preview) {
      select = "name gameSort pokedexNo endDate sprite.game trainer totalEncounters";
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

    if (req.query.action === "latest") {
      sort.endDate = "desc"
      const counters = await Counter.find(query, select).sort(sort).limit(Number(req.query.amount));
      res.json({ counters })
    } else if (req.query.trainers) {
      sort.endDate = "desc"
      const valuesArray = req.query.trainers.split(',');
      let counters = []
      for (const element of valuesArray) {
        query.trainer = element;
        const userCounters = await Counter.find(query, select).sort(sort).limit(Number(req.query.amount));
        counters.push(userCounters[0])
      }
      res.json({ counters });
    } else {
      const counters = await Counter.find(query, select).sort(sort);
      res.json({ counters });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdGET = async (req, res) => {
  try {
    const counterId = req.params.id;
    const counter = await Counter.findById(counterId);

    if (!counter) {
      res.status(404).json({ error: "Counter not found" });
    } else {
      res.json({ counter });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterPOST = async (req, res) => {
  const counter = new Counter(req.body);
  try {
    await counter.save();

    res.status(201).json({ counter });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const counterIdPUT = async (req, res) => {
  try {
    const counterId = req.params.id;
    const counter = await Counter.findOneAndReplace(
      { _id: counterId },
      req.body,
      { new: true }
    );

    res.json({ counter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdPATCH = async (req, res) => {
  try {
    const counterId = req.params.id;
    const count = await Counter.findById(counterId, "totalEncounters increment");
    let counter;

    let game

    if (req.query.action === "dateFix") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          startDate: count.encounters[0],
          endDate: count.encounters.pop()
        },
        { new: true }
      )
    }

    if (req.query.action === "dateEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          startDate: req.body.startDate,
          endDate: req.body.endDate
        },
        { new: true }
      )
    }

    if (req.query.action === "encounterEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { totalEncounters: req.body.count },
        { new: true }
      )
    }
    if (req.query.action === "searchLevelEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { "method.searchLevel": req.body.searchLevel },
        { new: true }
      )
    }

    if (req.query.action === "gameSort") {
      try {
        const response = await axios.get(`https://website-shiny-server.vercel.app/api/game`);
        const gameList = response.data.game;

        game = gameList.find((g) => g.name === count.game)

      } catch (error) {
        console.log(error);
      }

      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { gameSort: game.sort },
        { new: true }
      )
    }

    if (req.query.action === "csv") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { encounters: req.body },
        { new: true }
      )
    }
    if (req.query.action === "add") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $push: { encounters: Date.now() },
          $inc: { totalEncounters: count.increment },
          endDate: Date.now()
        },
        { new: true }
      );
    } else if (req.query.action === "addSearchLevel") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $inc: { "method.searchLevel": 1 },
        },
        { new: true }
      );
    } else if (req.query.action === "undo" && count.totalEncounters > 0) {
      const encounters = await Counter.findById(counterId, "encounters");
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          endDate: encounters.encounters[encounters.encounters.length - 2],
          $pop: { encounters: 1 },
          $inc: { totalEncounters: -count.increment },
        },
        { new: true }
      );
    }

    res.json({ counter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdDELETE = async (req, res) => {
  try {
    const counterId = req.params.id;
    const result = await Counter.deleteOne({ _id: counterId });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  counterGET,
  counterIdGET,
  counterPOST,
  counterIdPUT,
  counterIdPATCH,
  counterIdDELETE,
};
