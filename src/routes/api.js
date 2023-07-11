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

module.exports = router;