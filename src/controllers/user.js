const User = require("../models/user");

const userGET = async (req, res) => {
  try {
    let query = {};
    let select = "";
    if (req.query.user) {
      query.user = req.query.user;
    }
    if (req.query.action === "colorMode") {
      select = "user colorMode";
    }
    if (req.query.action === "counterSort") {
      select = "user ongoingCounterSort completedCounterSort";
    }

    const user = await User.findOne(query, select);

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const userPATCH = async (req, res) => {
  try {
    let query = {};
    if (req.query.user) {
      query.user = req.query.user;
    }

    let user;

    if (req.query.action === "colorMode") {
      const userColorMode = await User.findOne(query, "colorMode");

      const newColorMode = userColorMode.colorMode === "light" ? "dark" : "light";

      user = await User.findOneAndUpdate(query, {colorMode: newColorMode}, { new: true })
    }
    if (req.query.ongoingCounterSort) {
      user = await User.findOneAndUpdate(query, {ongoingCounterSort: req.query.ongoingCounterSort}, { new: true })
    }
    if (req.query.completedCounterSort) {
      user = await User.findOneAndUpdate(query, {completedCounterSort: req.query.completedCounterSort}, { new: true })
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  userGET,
  userPATCH,
};