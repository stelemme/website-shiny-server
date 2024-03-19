const express = require("express");
const router = express.Router();

// Importing counters
const counterGET = require("../controllers/counter/counterGET");
const counterIdGET = require("../controllers/counter/counterIdGET");
const counterPOST = require("../controllers/counter/counterPOST");
const counterIdPUT = require("../controllers/counter/counterIdPUT");
const counterIdPATCH = require("../controllers/counter/counterIdPATCH");
const counterIdDELETE = require("../controllers/counter/counterIdDELETE");

// Assigning controllers to the "/api/counters" URI
router.get("/counters", counterGET);
router.get("/counters/:id", counterIdGET);
router.post("/counters", counterPOST);
router.put("/counters/:id", counterIdPUT);
router.patch("/counters/:id", counterIdPATCH);
router.delete("/counters/:id", counterIdDELETE);

// Importing pokedex
const pokedexGET = require("../controllers/pokedex/pokedexGET");

// Assigning controllers to the "/api/pokedex" URI
router.get("/pokedex", pokedexGET);

// Importing game
const gameGET = require("../controllers/game/gameGET");
const gameIdGET = require("../controllers/game/gameIdGET");

// Assigning controllers to the "/api/game" URI
router.get("/game", gameGET);
router.get("/game/:id", gameIdGET);

// Importing shiny
const shinyGET = require("../controllers/shiny/shinyGET");
const shinyIdGET = require("../controllers/shiny/shinyIdGET");
const shinyPOST = require("../controllers/shiny/shinyPOST");
const shinyIdPATCH = require("../controllers/shiny/shinyIdPATCH");
const shinyIdDELETE = require("../controllers/shiny/shinyIdDELETE");

// Assigning controllers to the "/api/user" URI
router.get("/shiny", shinyGET);
router.get("/shiny/:id", shinyIdGET);
router.post("/shiny", shinyPOST);
router.patch("/shiny/:id", shinyIdPATCH);
router.delete("/shiny/:id", shinyIdDELETE);

// Importing user
const userGET = require("../controllers/user/userGET");

// Assigning controllers to the "/api/user" URI
router.get("/user", userGET);

module.exports = router;
