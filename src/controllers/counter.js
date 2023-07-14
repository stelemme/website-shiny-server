const Counter = require("../models/counter");

const counterGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    if (req.query.completed) {
      query.completed = req.query.completed;
    }
    if (req.query.trainer) {
      query.trainer = req.query.trainer;
    }
    if (req.query.preview) {
      select = "-encounters";
    }

    const counters = await Counter.find(query, select);

    res.json({ counters });
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

    if (req.query.action === "csv") {

      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { encounters: req.body },
        { new: true }
      )
    }
    if (req.query.action === "shiny") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { completed: true },
        { new: true }
      )
    }
    if (req.query.action === "add") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $push: { encounters: Date.now() },
          $inc: { totalEncounters: count.increment },
        },
        { new: true }
      );
    } else if (req.query.action === "undo" && count.totalEncounters > 0) {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
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
