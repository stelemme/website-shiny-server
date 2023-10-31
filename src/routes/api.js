const express = require("express");
const router = express.Router();

// Importing counters
const {
  counterGET,
  counterIdGET,
  counterPOST,
  counterIdPUT,
  counterIdPATCH,
  counterIdDELETE,
} = require("../controllers/counter");

// Assigning controllers to the "/api/counters" URI
router.get("/counters", counterGET);
router.get("/counters/:id", counterIdGET);
router.post("/counters", counterPOST);
router.put("/counters/:id", counterIdPUT);
router.patch("/counters/:id", counterIdPATCH);
router.delete("/counters/:id", counterIdDELETE);

// Importing pokedex
const {
  pokedexGET,
} = require("../controllers/pokedex");

// Assigning controllers to the "/api/pokedex" URI
router.get("/pokedex", pokedexGET);

// Importing game
const {
  gameGET,
  gameIdGET,
} = require("../controllers/game");

// Assigning controllers to the "/api/game" URI
router.get("/game", gameGET);
router.get("/game/:id", gameIdGET);

// Importing shiny
const {
  shinyGET,
  shinyIdGET,
  shinyPOST,
  shinyIdPATCH,
  shinyIdDELETE
} = require("../controllers/shiny");

// Assigning controllers to the "/api/user" URI
router.get("/shiny", shinyGET);
router.get("/shiny/:id", shinyIdGET);
router.post("/shiny", shinyPOST);
router.patch("/shiny/:id", shinyIdPATCH);
router.delete("/shiny/:id", shinyIdDELETE);

// Importing user
const {
  userGET,
} = require("../controllers/user");

// Assigning controllers to the "/api/user" URI
router.get("/user", userGET);

module.exports = router;