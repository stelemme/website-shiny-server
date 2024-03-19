const Counter = require("../../models/counter");

const counterIdPATCH = async (req, res) => {
  try {
    const counterId = req.params.id;
    const count = await Counter.findById(
      counterId,
      "totalEncounters increment"
    );
    let counter;
    let game;

    /* INITIALIZE DATES FROM CSV (NOT USED ANYMORE) */
    if (req.query.action === "dateFix") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          startDate: count.encounters[0],
          endDate: count.encounters.pop(),
        },
        { new: true }
      );
    }

    /* EDIT START & END DATE */
    if (req.query.action === "dateEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        },
        { new: true }
      );
    }

    /* EDIT ENCOUNTERS */
    if (req.query.action === "encounterEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { totalEncounters: req.body.count },
        { new: true }
      );
    }
    if (req.query.action === "encounterAdd") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $inc: { totalEncounters: req.body.add },
          $push: {
            encounters: { $each: Array(req.body.add).fill(Date.now()) },
          },
        },
        { new: true }
      );
    }

    /* EDIT SEARCHLEVEL */
    if (req.query.action === "searchLevelEdit") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { "method.searchLevel": req.body.searchLevel },
        { new: true }
      );
    }

    /* EDIT ENCOUNTERS WITH CSV */
    if (req.query.action === "csv") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { encounters: req.body },
        { new: true }
      );
    }

    /* INCREMENT THE COUNT */
    if (req.query.action === "add") {
      counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        {
          $push: {
            encounters: { $each: Array(count.increment).fill(Date.now()) },
          },
          $inc: { totalEncounters: count.increment },
          endDate: Date.now(),
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
          encounters: encounters.encounters.slice(0, -count.increment),
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

module.exports = counterIdPATCH;
