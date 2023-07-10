const express = require("express");
const router = express.Router();


// Importing the controllers
const {
  counterGET,
  counterIdGET,
  counterPOST,
  counterIdPUT,
  counterIdDELETE,
} = require("../controllers/counter");


// Assigning controllers to the "/api/counters" URI
router.get("/counters", counterGET);
router.get("/counters/:id", counterIdGET);
router.post("/counters", counterPOST);
router.put("/counters/:id", counterIdPUT);
router.delete("/counters/:id", counterIdPUT);

module.exports = router;