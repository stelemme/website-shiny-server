const Shiny = require("../../models/shiny");

const shinyPOST = async (req, res) => {
  const shiny = new Shiny(req.body);
  try {
    await shiny.save();

    res.status(201).json(shiny);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = shinyPOST;