const Shiny = require("../models/shiny");
const User = require("../models/user");

const shinyGET = async (req, res) => {
  try {
    let query = {};
    let select = "-encounters";
    const sort = {}

    /* FILTERS */
    if (req.query.all) {
      select = ""
    }
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

    /* SORTS */
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

    /* RETURNS GROUPS FOR RADAR */
    if (req.query.group) {
      const groups = await Shiny.distinct("group");

      res.json(groups);

      /* RETURNS THE USER STATS */
    } else if (req.query.action === "userStats") {
      const responses = {};

      responses.first = await Shiny.find(query, "name sprite endDate trainer").sort({ endDate: "asc" }).limit(Number(req.query.amount));
      responses.mostEncounters = await Shiny.find(query, "name sprite totalEncounters trainer").sort({ totalEncounters: "desc" }).limit(Number(req.query.amount));
      responses.longestHunt = await Shiny.find(query, "name sprite stats trainer").sort({ 'stats.totalHuntTime': "desc" }).limit(Number(req.query.amount));
      responses.mostDays = await Shiny.find(query, "name sprite stats trainer").sort({ 'stats.daysHunting': "desc" }).limit(Number(req.query.amount));

      query.totalEncounters = { $gt: 0 }
      responses.lowestEncounters = await Shiny.find(query, "name sprite totalEncounters trainer").sort({ totalEncounters: "asc" }).limit(Number(req.query.amount));
      delete query.totalEncounters

      query['stats.totalHuntTime'] = { $gt: 0 }
      responses.shortestHunt = await Shiny.find(query, "name sprite stats trainer").sort({ 'stats.totalHuntTime': "asc" }).limit(Number(req.query.amount));

      res.json(responses);

      /* RETURNS LATEST SHINIES*/
    } else if (req.query.trainers) {
      const userList = await User.find({}, 'user')
      const names = userList.map(user => user.user);

      let shinies = []
      for (const element of names) {
        query.trainer = element;
        const userShinies = await Shiny.find(query, "name sprite endDate trainer").sort(sort).limit(Number(req.query.amount));
        shinies.push(userShinies[0])
      }

      res.json(shinies);

      /* RETURNS A LIST FOR THE ENC. GRAPH */
    } else if (req.query.encountersList) {
      query.totalEncounters = { $gt: 0 }
      const encountersList = await Shiny.find(query, 'totalEncounters stats method')
      const encounters = encountersList.map(shiny => {
        if (shiny.method?.correctedEncounters) {
          return Math.round(shiny.method.correctedEncounters * 8192 / shiny.stats.probability)
        }
        return Math.round(shiny.totalEncounters * 8192 / shiny.stats.probability)
      });

      const rangeSize = 1000

      const result = encounters.reduce((acc, number) => {
        const lowerBound = Math.floor((number - 1) / rangeSize) * rangeSize + 1;
        const upperBound = lowerBound + rangeSize - 1;
        const rangeName = `${upperBound}`;

        const existingRange = acc.find((item) => item.name === rangeName);

        if (existingRange) {
          existingRange.amount++;
        } else {
          acc.push({ name: rangeName, amount: 1, expected: Math.round((((1 - ((8191 / 8192) ** upperBound)) - (1 - ((8191 / 8192) ** (upperBound - 1000)))) * encounters.length) * 100) / 100 });
        }

        return acc;
      }, []);

      for (let lowerBound = 1; lowerBound <= 56000; lowerBound += rangeSize) {
        const upperBound = lowerBound + rangeSize - 1;
        const rangeName = `${upperBound}`;
        if (!result.find((item) => item.name === rangeName)) {
          result.push({ name: rangeName, amount: 0, expected: Math.round((((1 - ((8191 / 8192) ** upperBound)) - (1 - ((8191 / 8192) ** (upperBound - 1000)))) * encounters.length) * 100) / 100 });
        }
      }

      result.sort((a, b) => {
        const rangeA = a.name.split('-').map(Number);
        const rangeB = b.name.split('-').map(Number);
        return rangeA[0] - rangeB[0];
      });

      res.json(result);
    } else {
      /* SHINY RESPONSE */
      const shiny = await Shiny.find(query, select).sort(sort);

      res.json(shiny);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const shinyIdGET = async (req, res) => {
  try {
    let select = "";
    const shinyId = req.params.id;

    /* FILTERS */
    if (req.query.action === "noEncounters") {
      select = "-encounters"
    }

    /* SHINY RESPONSE */
    const shiny = await Shiny.findById(shinyId, select);

    res.json(shiny);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const shinyPOST = async (req, res) => {
  const shiny = new Shiny(req.body);
  try {
    await shiny.save();

    res.status(201).json(shiny);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const shinyIdPATCH = async (req, res) => {
  try {
    const shinyId = req.params.id;

    if (req.query.action === "evolutionsEdit") {
      shiny = await Shiny.findOneAndUpdate(
        { _id: shinyId },
        {
          evolutions: req.body.evolutions,
          forms: req.body.forms
        },
        { new: true }
      )
    }

    res.json(shiny)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

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
  shinyIdPATCH,
  shinyIdDELETE
};