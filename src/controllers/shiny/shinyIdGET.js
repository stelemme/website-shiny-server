const Shiny = require("../../models/shiny");

const shinyIdGET = async (req, res) => {
  try {
    let select = "";
    const shinyId = req.params.id;

    /* FILTERS */
    if (req.query.action === "noEncounters") {
      select = "-encounters";
    }

    /* SHINY RESPONSE */
    const shiny = await Shiny.findById(shinyId, select);

    res.json(shiny);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = shinyIdGET;
