const Counter = require("../../models/counter");

const counterPOST = async (req, res) => {
  const counter = new Counter(req.body);
  try {
    await counter.save();

    res.status(201).json(counter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = counterPOST;
