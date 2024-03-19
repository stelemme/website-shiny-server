const User = require("../../models/user");

const userGET = async (req, res) => {
  try {
    let query = {};
    let select = "";

    /* FILTERS */
    if (req.query.user) {
      query.user = req.query.user;
    }

    /* RETURNS A LIST OF USERS */
    if (req.query.userList) {
      const userList = await User.find({}, "user");
      const names = userList.map((user) => user.user);

      res.json(names);
    } else {
      /* USER RESPONSE */
      const user = await User.findOne(query, select);

      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = userGET;
