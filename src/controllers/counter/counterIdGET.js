const Counter = require("../../models/counter");

const counterIdGET = async (req, res) => {
  try {
    const counterId = req.params.id;
    const counter = await Counter.findById(counterId);

    res.json(counter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = counterIdGET;
