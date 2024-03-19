const Counter = require("../../models/counter");

const counterIdDELETE = async (req, res) => {
    try {
      const counterId = req.params.id;
      const result = await Counter.deleteOne({ _id: counterId });
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = counterIdDELETE