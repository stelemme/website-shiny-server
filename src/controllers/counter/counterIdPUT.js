const Counter = require("../../models/counter");

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

module.exports = counterIdPUT;
