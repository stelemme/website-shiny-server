const Shiny = require("../../models/shiny");

const shinyIdDELETE = async (req, res) => {
  try {
    const shinyId = req.params.id;
    const result = await Shiny.deleteOne({ _id: shinyId });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = shinyIdDELETE;
