const Shiny = require("../../models/shiny");

const shinyIdPATCH = async (req, res) => {
    try {
      const shinyId = req.params.id;
      let shiny;
  
      if (req.query.action === "csv") {
        shiny = await Shiny.findOneAndUpdate(
          { _id: shinyId },
          { encounters: req.body },
          { new: true }
        );
      }
  
      if (req.query.action === "evolutionsEdit") {
        shiny = await Shiny.findOneAndUpdate(
          { _id: shinyId },
          {
            evolutions: req.body.evolutions,
            forms: req.body.forms,
          },
          { new: true }
        );
      }
  
      if (req.query.action === "marksEdit") {
        shiny = await Shiny.findOneAndUpdate(
          { _id: shinyId },
          {
            $addToSet: {
              marks: {
                name: req.body.name,
                sprite: req.body.sprite,
              },
            },
          },
          { new: true }
        );
      }
  
      if (req.query.action === "geoLocationsEdit") {
        shiny = await Shiny.findOneAndUpdate(
          { _id: shinyId },
          {
            geoLocation: req.body,
          },
          { new: true }
        );
      }
  
      res.json(shiny);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  module.exports = shinyIdPATCH;