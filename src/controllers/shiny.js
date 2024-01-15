const Shiny = require("../models/shiny");
const User = require("../models/user");

const shinyGET = async (req, res) => {
  try {
    let query = {};
    let select = "-encounters";
    const sort = {};
    const namesToCheck = ["Joaquin", "Korneel", "Simon", "Stef"];

    /* FILTERS */
    if (req.query.all) {
      select = "";
    }
    if (req.query.trainer) {
      query.trainer = req.query.trainer;
    }
    if (req.query.action === "counters") {
      query.totalEncounters = { $gt: 0 };
    }
    if (req.query.preview === "counter") {
      select =
        "name gameSort pokedexNo endDate sprite.game trainer totalEncounters";
    }
    if (req.query.preview === "shiny") {
      select = "name gameSort gen pokedexNo endDate sprite trainer";
    }
    if (req.query.gen === "Gen 1") {
      query.pokedexNo = { $lte: 151 };
    } else if (req.query.gen === "Gen 2") {
      query.pokedexNo = { $gt: 151, $lte: 251 };
    } else if (req.query.gen === "Gen 3") {
      query.pokedexNo = { $gt: 251, $lte: 386 };
    } else if (req.query.gen === "Gen 4") {
      query.pokedexNo = { $gt: 386, $lte: 493 };
    } else if (req.query.gen === "Gen 5") {
      query.pokedexNo = { $gt: 493, $lte: 649 };
    } else if (req.query.gen === "Gen 6") {
      query.pokedexNo = { $gt: 649, $lte: 721 };
    } else if (req.query.gen === "Gen 7") {
      query.pokedexNo = { $gt: 721, $lte: 809 };
    } else if (req.query.gen === "Gen 8") {
      query.pokedexNo = { $gt: 809, $lte: 905 };
    } else if (req.query.gen === "Gen 9") {
      query.pokedexNo = { $gt: 905 };
    }

    /* SORTS */
    if (req.query.sort === "gameAsc") {
      sort.gameSort = "asc";
      sort.pokedexNo = "asc";
    }
    if (req.query.sort === "gameDesc") {
      sort.gameSort = "desc";
      sort.pokedexNo = "asc";
    }
    if (req.query.sort === "pokedexNoAsc") {
      sort.pokedexNo = "asc";
    }
    if (req.query.sort === "pokedexNoDesc") {
      sort.pokedexNo = "asc";
    }
    if (req.query.sort === "newest") {
      sort.endDate = "desc";
    }
    if (req.query.sort === "oldest") {
      sort.endDate = "asc";
    }
    if (req.query.sort === "encAsc") {
      sort.totalEncounters = "desc";
    }
    if (req.query.sort === "encDesc") {
      sort.totalEncounters = "asc";
    }

    /* RETURNS GROUPS FOR RADAR */
    if (req.query.group) {
      const groups = await Shiny.distinct("group");

      res.json(groups);

      /* GETS THE BACKUP DATA */
    } else if (req.query.backup) {
      const result = await Shiny.aggregate([
        {
          $project: {
            _id: 0,
            evolutions: { _id: 0 },
            forms: { _id: 0 },
            marks: { _id: 0 },
            __v: 0,
          },
        },
      ]);

      res.json(result);
      /* TOTAL AMOUNT OF SHINIES */
    } else if (req.query.statsShinyAmount) {
      const pipeline = [
        {
          $group: {
            _id: "$trainer",
            data: { $sum: 1 },
          },
        },
        {
          $sort: {
            data: -1,
          },
        },
        {
          $project: {
            _id: 0,
            trainer: "$_id",
            data: 1,
          },
        },
      ];

      if (req.query.counted) {
        pipeline.unshift({
          $match: {
            totalEncounters: { $gt: 0 },
          },
        });
      }
      if (req.query.statsGen && req.query.statsGen !== "All") {
        pipeline.unshift({
          $match: {
            gen: req.query.statsGen,
          },
        });
      }

      result = await Shiny.aggregate(pipeline);

      const finalResult = namesToCheck.map((name) => {
        const existingData = result.find((item) => item.trainer === name);
        return existingData ? existingData : { trainer: name, data: 0 };
      });

      finalResult.sort((a, b) => b.data - a.data);

      res.json(finalResult);
      /* AVERAGE NUMBER OF ENCOUNTERS */
    } else if (req.query.statsAverageEnc) {
      const pipeline = [
        {
          $match: {
            totalEncounters: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: "$trainer",
            totalEncounters: {
              $push: {
                $multiply: [
                  "$totalEncounters",
                  { $divide: [8192, "$stats.probability"] },
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            trainer: "$_id",
            data: { $round: [{ $avg: "$totalEncounters" }, 0] },
          },
        },
        {
          $sort: {
            data: 1,
          },
        },
      ];

      if (req.query.statsGen && req.query.statsGen !== "All") {
        pipeline.unshift({
          $match: {
            gen: req.query.statsGen,
          },
        });
      }

      result = await Shiny.aggregate(pipeline);

      const finalResult = namesToCheck.map((name) => {
        const existingData = result.find((item) => item.trainer === name);
        return existingData ? existingData : { trainer: name, data: 0 };
      });

      finalResult.sort((a, b) => {
        if (a.data === 0) {
          return 1;
        }
        if (b.data === 0) {
          return -1;
        }
        return a.data - b.data;
      });

      res.json(finalResult);
      /* RETURNS THE USER RECORDS */
    } else if (req.query.dateStats) {
      const year = req.query.dateStats;

      const aggregationPipeline = [
        {
          $match: {
            endDate: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${Number(year) + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$endDate" },
              trainer: "$trainer",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.month",
            data: {
              $push: {
                k: "$_id.trainer",
                v: "$count",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 1] }, then: "January" },
                  { case: { $eq: ["$_id", 2] }, then: "February" },
                  { case: { $eq: ["$_id", 3] }, then: "March" },
                  { case: { $eq: ["$_id", 4] }, then: "April" },
                  { case: { $eq: ["$_id", 5] }, then: "May" },
                  { case: { $eq: ["$_id", 6] }, then: "June" },
                  { case: { $eq: ["$_id", 7] }, then: "July" },
                  { case: { $eq: ["$_id", 8] }, then: "August" },
                  { case: { $eq: ["$_id", 9] }, then: "September" },
                  { case: { $eq: ["$_id", 10] }, then: "October" },
                  { case: { $eq: ["$_id", 11] }, then: "November" },
                  { case: { $eq: ["$_id", 12] }, then: "December" },
                ],
                default: "Unknown",
              },
            },
            data: 1,
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ month: "$month" }, { $arrayToObject: "$data" }],
            },
          },
        },
        {
          $sort: { month: 1 },
        },
      ];

      const result = await Shiny.aggregate(aggregationPipeline);
      const formattedResult = [];

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      months.forEach((month) => {
        const monthObj = {
          month: month,
        };

        const counts = result.find((entry) => entry.month === month) || {};

        namesToCheck.forEach((month) => {
          monthObj[month] = counts[month] || 0;
        });

        formattedResult.push(monthObj);
      });

      res.json(formattedResult);
    } else if (req.query.action === "userRecords") {
      const responses = {};

      responses.first = await Shiny.find(query, "name endDate trainer")
        .sort({ endDate: "asc" })
        .limit(Number(req.query.amount));
      responses.mostEncounters = await Shiny.find(
        query,
        "name totalEncounters trainer"
      )
        .sort({ totalEncounters: "desc" })
        .limit(Number(req.query.amount));
      responses.longestHunt = await Shiny.find(query, "name stats trainer")
        .sort({ "stats.totalHuntTime": "desc" })
        .limit(Number(req.query.amount));
      responses.mostDays = await Shiny.find(query, "name stats trainer")
        .sort({ "stats.daysHunting": "desc" })
        .limit(Number(req.query.amount));

      query.totalEncounters = { $gt: 0 };
      responses.lowestEncounters = await Shiny.find(
        query,
        "name sprite totalEncounters trainer"
      )
        .sort({ totalEncounters: "asc" })
        .limit(Number(req.query.amount));
      delete query.totalEncounters;

      query["stats.totalHuntTime"] = { $gt: 0 };
      responses.shortestHunt = await Shiny.find(
        query,
        "name sprite stats trainer"
      )
        .sort({ "stats.totalHuntTime": "asc" })
        .limit(Number(req.query.amount));

      res.json(responses);

      /* RETURNS THE GAME STATS */
    } else if (req.query.action === "gameStats") {
      const pipeline = [
        {
          $group: {
            _id: "$trainer",
            shinyAmount: { $sum: 1 },
            countedShinyAmount: {
              $sum: {
                $cond: [{ $gt: ["$totalEncounters", 0] }, 1, 0],
              },
            },
            overOdds: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalEncounters", 0] },
                      { $gt: ["$totalEncounters", "$stats.probability"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            underOdds: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalEncounters", 0] },
                      { $lt: ["$totalEncounters", "$stats.probability"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalEncountersAvg: {
              $avg: {
                $cond: [
                  { $gt: ["$totalEncounters", 0] },
                  {
                    $multiply: [
                      "$totalEncounters",
                      { $divide: [8192, "$stats.probability"] },
                    ],
                  },
                  null,
                ],
              },
            },
            totalEncountersSum: { $sum: "$totalEncounters" },
            totalTimeSum: { $sum: "$stats.totalHuntTime" },
          },
        },
        {
          $project: {
            _id: 0,
            trainer: "$_id",
            shinyAmount: 1,
            countedShinyAmount: 1,
            overOdds: 1,
            underOdds: 1,
            totalEncountersAvg: { $round: ["$totalEncountersAvg", 0] },
            totalEncountersSum: 1,
            totalTimeSum: 1,
          },
        },
        {
          $group: {
            _id: null,
            trainers: {
              $push: {
                k: "$trainer",
                v: {
                  shinyAmount: "$shinyAmount",
                  countedShinyAmount: "$countedShinyAmount",
                  overOdds: "$overOdds",
                  underOdds: "$underOdds",
                  totalEncountersAvg: "$totalEncountersAvg",
                  totalEncountersSum: "$totalEncountersSum",
                  totalTimeSum: "$totalTimeSum",
                },
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $arrayToObject: "$trainers" },
          },
        },
      ];

      if (req.query.gameFilter && req.query.gameFilter !== "undefined") {
        pipeline.unshift({
          $match: { game: req.query.gameFilter },
        });
      }

      const result = await Shiny.aggregate(pipeline);

      res.json(result[0]);

      /* RETURNS THE TOTAL GAME STATS */
    } else if (req.query.action === "gameStatsTotal") {
      const pipeline = [
        {
          $group: {
            _id: null,
            shinyAmount: { $sum: 1 },
            countedShinyAmount: {
              $sum: {
                $cond: [{ $gt: ["$totalEncounters", 0] }, 1, 0],
              },
            },
            overOdds: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalEncounters", 0] },
                      { $gt: ["$totalEncounters", "$stats.probability"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            underOdds: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalEncounters", 0] },
                      { $lt: ["$totalEncounters", "$stats.probability"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalEncountersAvg: {
              $avg: {
                $cond: [
                  { $gt: ["$totalEncounters", 0] },
                  {
                    $multiply: [
                      "$totalEncounters",
                      { $divide: [8192, "$stats.probability"] },
                    ],
                  },
                  null,
                ],
              },
            },
            totalEncountersSum: { $sum: "$totalEncounters" },
            totalTimeSum: { $sum: "$stats.totalHuntTime" },
          },
        },
        {
          $project: {
            _id: 0,
            shinyAmount: 1,
            countedShinyAmount: 1,
            overOdds: 1,
            underOdds: 1,
            totalEncountersAvg: { $round: ["$totalEncountersAvg", 0] },
            totalEncountersSum: 1,
            totalTimeSum: 1,
          },
        },
      ];

      if (req.query.gameFilter && req.query.gameFilter !== "undefined") {
        pipeline.unshift({
          $match: { game: req.query.gameFilter },
        });
      }

      const result = await Shiny.aggregate(pipeline);

      res.json(result[0]);
      /* RETURNS THE USER STATS */
    } else if (req.query.action === "userStats") {
      const pipeline = [
        {
          $facet: {
            mostFrequentName: [
              { $group: { _id: "$name", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            mostFrequentNature: [
              { $group: { _id: "$nature", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            leastFrequentNature: [
              { $group: { _id: "$nature", count: { $sum: 1 } } },
              { $sort: { count: 1 } },
              { $limit: 1 },
            ],
            mostFrequentBall: [
              { $group: { _id: "$ball", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            leastFrequentBall: [
              { $group: { _id: "$ball", count: { $sum: 1 } } },
              { $sort: { count: 1 } },
              { $limit: 1 },
            ],
            mostFrequentGen: [
              { $group: { _id: "$gen", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            leastFrequentGen: [
              { $group: { _id: "$gen", count: { $sum: 1 } } },
              { $sort: { count: 1 } },
              { $limit: 1 },
            ],
            mostFrequentGame: [
              { $group: { _id: "$game", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            leastFrequentGame: [
              { $group: { _id: "$game", count: { $sum: 1 } } },
              { $sort: { count: 1 } },
              { $limit: 1 },
            ],
            mostFrequentLocation: [
              { $group: { _id: "$location", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            mostFrequentIRLLocation: [
              { $group: { _id: "$IRLLocation", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            mostFrequentMethod: [
              { $group: { _id: "$method.name", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            leastFrequentMethod: [
              { $group: { _id: "$method.name", count: { $sum: 1 } } },
              { $sort: { count: 1 } },
              { $limit: 1 },
            ],
            mostFrequentYear: [
              { $group: { _id: { $year: "$endDate" }, count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            mostFrequentMonth: [
              {
                $group: {
                  _id: {
                    year: { $year: "$endDate" },
                    month: { $month: "$endDate" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            mostFrequentDay: [
              {
                $group: {
                  _id: {
                    date: {
                      $dateToString: { format: "%Y-%m-%d", date: "$endDate" },
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
          },
        },
      ];

      if (req.query.trainer) {
        pipeline.unshift({
          $match: { trainer: req.query.trainer },
        });
      }

      const result = await Shiny.aggregate(pipeline);

      const responses = {
        mostFrequentName: result[0].mostFrequentName[0],
        mostFrequentNature: result[0].mostFrequentNature[0],
        leastFrequentNature: result[0].leastFrequentNature[0],
        mostFrequentBall: result[0].mostFrequentBall[0],
        leastFrequentBall: result[0].leastFrequentBall[0],
        mostFrequentGen: result[0].mostFrequentGen[0],
        leastFrequentGen: result[0].leastFrequentGen[0],
        mostFrequentGame: result[0].mostFrequentGame[0],
        leastFrequentGame: result[0].leastFrequentGame[0],
        mostFrequentLocation: result[0].mostFrequentLocation[0],
        mostFrequentIRLLocation: result[0].mostFrequentIRLLocation[0],
        mostFrequentMethod: result[0].mostFrequentMethod[0],
        leastFrequentMethod: result[0].leastFrequentMethod[0],
        mostFrequentYear: result[0].mostFrequentYear[0],
        mostFrequentMonth: {
          _id: new Date(
            result[0].mostFrequentMonth[0]._id.year,
            result[0].mostFrequentMonth[0]._id.month - 1,
            1
          ).toLocaleString("en-US", { month: "long", year: "numeric" }),
          count: result[0].mostFrequentMonth[0].count,
        },
        mostFrequentDay: {
          _id: new Date(
            result[0].mostFrequentDay[0]._id.date
          ).toLocaleDateString("nl-BE"),
          count: result[0].mostFrequentDay[0].count,
        },
      };

      res.json(responses);

      /* RETURNS LATEST SHINIES*/
    } else if (req.query.trainers) {
      const userList = await User.find({}, "user");
      const names = userList.map((user) => user.user);

      let shinies = [];
      for (const element of names) {
        query.trainer = element;
        const userShinies = await Shiny.find(
          query,
          "name sprite endDate trainer"
        )
          .sort(sort)
          .limit(Number(req.query.amount));
        shinies.push(userShinies[0]);
      }

      res.json(shinies);

      /* RETURNS THE SHINY LIST */
    } else if (req.query.shinyList) {
      const shinies = await Shiny.find(query, "name evolutions forms");
      const shinyList = new Set();

      shinies.forEach((shiny) => {
        shinyList.add(shiny.name);

        shiny.evolutions.forEach((evolution) => {
          shinyList.add(evolution.name);
        });
      });

      res.json(Array.from(shinyList));

      /* RETURNS A LIST FOR THE ENC. GRAPH */
    } else if (req.query.encountersList) {
      query.totalEncounters = { $gt: 0 };
      const encountersList = await Shiny.find(
        query,
        "totalEncounters stats method"
      );
      const encounters = encountersList.map((shiny) => {
        if (shiny.method?.correctedEncounters) {
          return Math.round(
            (shiny.method.correctedEncounters * 8192) / shiny.stats.probability
          );
        }
        return Math.round(
          (shiny.totalEncounters * 8192) / shiny.stats.probability
        );
      });

      const rangeSize = 1000;

      const result = encounters.reduce((acc, number) => {
        const lowerBound = Math.floor((number - 1) / rangeSize) * rangeSize + 1;
        const upperBound = lowerBound + rangeSize - 1;
        const rangeName = `${upperBound}`;

        const existingRange = acc.find((item) => item.name === rangeName);

        if (existingRange) {
          existingRange.amount++;
        } else {
          acc.push({
            name: rangeName,
            amount: 1,
            expected:
              Math.round(
                (1 -
                  (8191 / 8192) ** upperBound -
                  (1 - (8191 / 8192) ** (upperBound - 1000))) *
                  encounters.length *
                  100
              ) / 100,
          });
        }

        return acc;
      }, []);

      for (let lowerBound = 1; lowerBound <= 56000; lowerBound += rangeSize) {
        const upperBound = lowerBound + rangeSize - 1;
        const rangeName = `${upperBound}`;
        if (!result.find((item) => item.name === rangeName)) {
          result.push({
            name: rangeName,
            amount: 0,
            expected:
              Math.round(
                (1 -
                  (8191 / 8192) ** upperBound -
                  (1 - (8191 / 8192) ** (upperBound - 1000))) *
                  encounters.length *
                  100
              ) / 100,
          });
        }
      }

      result.sort((a, b) => {
        const rangeA = a.name.split("-").map(Number);
        const rangeB = b.name.split("-").map(Number);
        return rangeA[0] - rangeB[0];
      });

      res.json(result);

      /* SHINY SEARCH */
    } else if (req.query.search) {
      if (req.query.search === "false") {
        res.json([]);
      } else {
        const result = await Shiny.aggregate([
          {
            $search: {
              index: "shinies",
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: req.query.search,
                      path: "name",
                    },
                  },
                  {
                    autocomplete: {
                      query: req.query.search,
                      path: "evolutions.name",
                    },
                  },
                  {
                    autocomplete: {
                      query: req.query.search,
                      path: "forms.name",
                    },
                  },
                ],
                minimumShouldMatch: 1,
              },
            },
          },
          { $limit: 50 },
          {
            $project: {
              _id: 1,
              name: 1,
              sprite: 1,
              trainer: 1,
            },
          },
        ]);

        res.json(result);
      }
    } else {
      /* SHINY RESPONSE */
      const shiny = await Shiny.find(query, select).sort(sort);

      res.json(shiny);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

const shinyPOST = async (req, res) => {
  const shiny = new Shiny(req.body);
  try {
    await shiny.save();

    res.status(201).json(shiny);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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
          $push: {
            marks: {
              name: req.body.name,
              sprite: req.body.sprite,
            },
          },
        },
        { new: true }
      );
    }

    res.json(shiny);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const shinyIdDELETE = async (req, res) => {
  try {
    const shinyId = req.params.id;
    const result = await Shiny.deleteOne({ _id: shinyId });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  shinyGET,
  shinyIdGET,
  shinyPOST,
  shinyIdPATCH,
  shinyIdDELETE,
};
