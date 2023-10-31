const Counter = require("../models/counter");
const User = require("../models/user");

const counterGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    let sort = {}

    /* FILTERS */
    if (req.query.trainer) {
      query.trainer = req.query.trainer;
    }
    if (req.query.preview) {
      select = "name gameSort pokedexNo endDate sprite.game trainer totalEncounters";
    }

    /* SORTING */
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

    /* LATEST COUNTERS RESPONSE*/
    if (req.query.trainers) {
      const userList = await User.find({}, 'user')
      const names = userList.map(user => user.user);

      let counters = []
      for (const element of names) {
        query.trainer = element;
        const userCounters = await Counter.find(query, select).sort(sort).limit(Number(req.query.amount));
        counters.push(userCounters[0])
      }

      res.json(counters);

      /* COUNTERS RESPONSE */
    } else {
      const counters = await Counter.find(query, select).sort(sort);

      res.json(counters);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdGET = async (req, res) => {
  try {
    const counterId = req.params.id;
    const counter = await Counter.findById(counterId);

    res.json(counter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterPOST = async (req, res) => {
  const counter = new Counter(req.body);
  try {
    await counter.save();

    res.status(201).json(counter);
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

    res.json(counter);
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

    /* INITIALIZE DATES FROM CSV (NOT USED ANYMORE) */
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

    /* EDIT START & END DATE */
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

    /* EDIT ENCOUNTERS */
    if (req.query.action === "encounterEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { totalEncounters: req.body.count },
        { new: true }
      )
    }

    /* EDIT SEARCHLEVEL */
    if (req.query.action === "searchLevelEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { "method.searchLevel": req.body.searchLevel },
        { new: true }
      )
    }

    /* EDIT ENCOUNTERS WITH CSV */
    if (req.query.action === "csv") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { encounters: req.body },
        { new: true }
      )
    }

    /* INCREMENT THE COUNT */
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
    } 
    
    /* INCREMENT SEARCHLEVEL */
    if (req.query.action === "addSearchLevel") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $inc: { "method.searchLevel": 1 },
        },
        { new: true }
      );
    }
    
    /* UNDO A COUNT */
    if (req.query.action === "undo" && count.totalEncounters > 0) {
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

    res.json(counter);
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
