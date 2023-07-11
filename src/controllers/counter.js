const Counter = require("../models/counter");

const counterGET = async (req, res) => {
  try {
    const counters = await Counter.find();

    res.json({ counters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdGET = async (req, res) => {
  console.log({ requestParams: req.params });
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
    const counter = await Counter.findOneAndReplace({ _id: counterId }, req.body, {new: true});

    res.json({counter});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdPATCH = async (req, res) => {
  try {
    const counterId = req.params.id;
    const counter = await Counter.findOneAndUpdate({ _id: counterId }, req.body, {new: true});

    res.json({counter});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const counterIdDELETE = async (req, res) => {
  try {
    const counterId = req.params.id;
    const result = await Counter.deleteOne({_id: counterId})

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  counterGET,
  counterIdGET,
  counterPOST,
  counterIdPUT,
  counterIdPATCH,
  counterIdDELETE,
};
