const Shiny = require("../models/shiny");
const User = require("../models/user");

const shinyGET = async (req, res) => {
  try {
    let pipeline = [];

    pipeline.push({
      $project: {
        encounters: 0,
      },
    });

    let query = {};

    const namesToCheck = ["Joaquin", "Korneel", "Simon", "Stef"];
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

    /* FILTERS */
    if (req.query.all) {
      let indexToRemove = pipeline.findIndex(
        (item) => item["$project"] && item["$project"]["encounters"] === 0
      );

      if (indexToRemove !== -1) {
        pipeline.splice(indexToRemove, 1);
      }
    }
    if (req.query.trainer) {
      pipeline.push({
        $match: {
          trainer: req.query.trainer,
        },
      });
    }
    if (req.query.action === "counters") {
      pipeline.push({
        $match: {
          totalEncounters: { $gt: 0 },
        },
      });
    }
    if (req.query.gen === "Gen 1") {
      pipeline.push({
        $match: {
          pokedexNo: { $lte: 151 },
        },
      });
    } else if (req.query.gen === "Gen 2") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 151, $lte: 251 },
        },
      });
    } else if (req.query.gen === "Gen 3") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 251, $lte: 386 },
        },
      });
    } else if (req.query.gen === "Gen 4") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 386, $lte: 493 },
        },
      });
    } else if (req.query.gen === "Gen 5") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 493, $lte: 649 },
        },
      });
    } else if (req.query.gen === "Gen 6") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 649, $lte: 721 },
        },
      });
    } else if (req.query.gen === "Gen 7") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 721, $lte: 809 },
        },
      });
    } else if (req.query.gen === "Gen 8") {
      pipeline.push({
        $match: {
          pokedexNo: { $gt: 809, $lte: 905 },
        },
      });
    } else if (req.query.gen === "Gen 9") {
      pipeline.push({ $match: { pokedexNo: { $gt: 905 } } });
    }
    if (req.query.groupShinies && !req.query.shinyList) {
      pipeline = pipeline.concat([
        {
          $group: {
            _id: "$group",
            count: { $sum: 1 },
            documents: { $push: "$$ROOT" },
          },
        },
        {
          $addFields: {
            documents: {
              $cond: {
                if: { $eq: ["$_id", null] },
                then: "$documents",
                else: { $slice: ["$documents", 1] },
              },
            },
          },
        },
        {
          $unwind: "$documents",
        },
        {
          $replaceRoot: { newRoot: "$documents" },
        },
      ]);
    }
    if (req.query.preview === "counter") {
      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          gameSort: 1,
          pokedexNo: 1,
          endDate: 1,
          "sprite.game": 1,
          trainer: 1,
          totalEncounters: 1,
        },
      });
    }
    if (req.query.preview === "shiny") {
      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          gameSort: 1,
          gen: 1,
          pokedexNo: 1,
          endDate: 1,
          sprite: 1,
          trainer: 1,
          evolutions: 1,
          forms: 1,
          group: 1,
        },
      });
    }

    /* SORTS */
    if (req.query.sort === "gameAsc") {
      pipeline.push({ $sort: { gameSort: 1, pokedexNo: 1 } });
    }
    if (req.query.sort === "gameDesc") {
      pipeline.push({ $sort: { gameSort: -1, pokedexNo: 1 } });
    }
    if (req.query.sort === "pokedexNoAsc") {
      pipeline.push({ $sort: { pokedexNo: 1 } });
    }
    if (req.query.sort === "pokedexNoDesc") {
      pipeline.push({ $sort: { pokedexNo: -1 } });
    }
    if (req.query.sort === "newest") {
      pipeline.push({ $sort: { endDate: -1 } });
    }
    if (req.query.sort === "oldest") {
      pipeline.push({ $sort: { endDate: 1 } });
    }
    if (req.query.sort === "encAsc") {
      pipeline.push({ $sort: { totalEncounters: -1 } });
    }
    if (req.query.sort === "encDesc") {
      pipeline.push({ $sort: { totalEncounters: 1 } });
    }

    /* TOTAL AMOUNT OF SHINIES */
    if (req.query.statsShinyAmount) {
      pipeline = pipeline.concat([
        {
          $group: { _id: "$trainer", data: { $sum: 1 } },
        },
        {
          $sort: { data: -1 },
        },
        {
          $project: {
            _id: 0,
            trainer: "$_id",
            data: 1,
          },
        },
        {
          $group: {
            _id: null,
            result: { $push: "$$ROOT" },
            allTrainers: { $push: "$trainer" },
          },
        },
        {
          $project: {
            _id: 0,
            result: {
              $concatArrays: [
                "$result",
                {
                  $map: {
                    input: {
                      $setDifference: [namesToCheck, "$allTrainers"],
                    },
                    as: "missingTrainer",
                    in: {
                      trainer: "$$missingTrainer",
                      data: 0,
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $unwind: "$result",
        },
        {
          $replaceRoot: { newRoot: "$result" },
        },
      ]);
    }

    /* AVERAGE NUMBER OF ENCOUNTERS */
    if (req.query.statsAverageEnc) {
      pipeline = pipeline.concat([
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
        {
          $group: {
            _id: null,
            result: { $push: "$$ROOT" },
            allTrainers: { $push: "$trainer" },
          },
        },
        {
          $project: {
            _id: 0,
            result: {
              $concatArrays: [
                "$result",
                {
                  $map: {
                    input: {
                      $setDifference: [namesToCheck, "$allTrainers"],
                    },
                    as: "missingTrainer",
                    in: {
                      data: 0,
                      trainer: "$$missingTrainer",
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $unwind: "$result",
        },
        {
          $replaceRoot: { newRoot: "$result" },
        },
      ]);
    }

    /* RETURNS THE DATESTATS */
    if (req.query.dateStats) {
      const year = req.query.dateStats;

      pipeline = pipeline.concat([
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
        {
          $group: {
            _id: null,
            result: { $push: "$$ROOT" },
            allMonths: { $push: "$month" },
          },
        },
        {
          $project: {
            _id: 0,
            result: {
              $concatArrays: [
                "$result",
                {
                  $map: {
                    input: {
                      $setDifference: [months, "$allMonths"],
                    },
                    as: "missingMonth",
                    in: {
                      month: "$$missingMonth",
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $unwind: "$result",
        },
        {
          $replaceRoot: { newRoot: "$result" },
        },
        {
          $addFields: {
            monthOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$month", "January"] }, then: 1 },
                  { case: { $eq: ["$month", "February"] }, then: 2 },
                  { case: { $eq: ["$month", "March"] }, then: 3 },
                  { case: { $eq: ["$month", "April"] }, then: 4 },
                  { case: { $eq: ["$month", "May"] }, then: 5 },
                  { case: { $eq: ["$month", "June"] }, then: 6 },
                  { case: { $eq: ["$month", "July"] }, then: 7 },
                  { case: { $eq: ["$month", "August"] }, then: 8 },
                  { case: { $eq: ["$month", "September"] }, then: 9 },
                  { case: { $eq: ["$month", "October"] }, then: 10 },
                  { case: { $eq: ["$month", "November"] }, then: 11 },
                  { case: { $eq: ["$month", "December"] }, then: 12 },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $sort: {
            monthOrder: 1,
          },
        },
        {
          $project: {
            monthOrder: 0,
          },
        },
      ]);
    }

    /* RETURNS THE GAME STATS */
    if (req.query.action === "gameStats") {
      pipeline = pipeline.concat([
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
      ]);
    }

    /* RETURNS THE TOTAL GAME STATS */
    if (req.query.action === "gameStatsTotal") {
      pipeline = pipeline.concat([
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
      ]);
    }

    /* RETURNS LATEST SHINIES*/
    if (req.query.action === "latest") {
      pipeline = pipeline.concat([
        {
          $sort: {
            trainer: 1,
            endDate: -1,
          },
        },
        {
          $group: {
            _id: "$trainer",
            latestDocument: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$latestDocument",
          },
        },
        {
          $project: {
            _id: 1,
            sprite: 1,
            trainer: 1,
            name: 1,
          },
        },
        { $sort: { trainer: 1 } },
      ]);
    }

    /* RETURNS THE USER STATS */
    if (req.query.action === "userStats") {
      pipeline = pipeline.concat([
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
            mostFrequentGeoLocation: [
              { $group: { _id: "$geoLocation.name", count: { $sum: 1 } } },
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
        {
          $project: {
            mostFrequentName: { $arrayElemAt: ["$mostFrequentName", 0] },
            mostFrequentNature: { $arrayElemAt: ["$mostFrequentNature", 0] },
            leastFrequentNature: { $arrayElemAt: ["$leastFrequentNature", 0] },
            mostFrequentBall: { $arrayElemAt: ["$mostFrequentBall", 0] },
            leastFrequentBall: { $arrayElemAt: ["$leastFrequentBall", 0] },
            mostFrequentGen: { $arrayElemAt: ["$mostFrequentGen", 0] },
            leastFrequentGen: { $arrayElemAt: ["$leastFrequentGen", 0] },
            mostFrequentGame: { $arrayElemAt: ["$mostFrequentGame", 0] },
            leastFrequentGame: { $arrayElemAt: ["$leastFrequentGame", 0] },
            mostFrequentLocation: {
              $arrayElemAt: ["$mostFrequentLocation", 0],
            },
            mostFrequentGeoLocation: {
              $arrayElemAt: ["$mostFrequentGeoLocation", 0],
            },
            mostFrequentMethod: { $arrayElemAt: ["$mostFrequentMethod", 0] },
            leastFrequentMethod: { $arrayElemAt: ["$leastFrequentMethod", 0] },
            mostFrequentYear: { $arrayElemAt: ["$mostFrequentYear", 0] },
            mostFrequentMonth: {
              $let: {
                vars: {
                  mostFrequentMonth: {
                    $arrayElemAt: ["$mostFrequentMonth", 0],
                  },
                },
                in: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m",
                      date: {
                        $dateFromParts: {
                          year: "$$mostFrequentMonth._id.year",
                          month: "$$mostFrequentMonth._id.month",
                          day: 1,
                        },
                      },
                    },
                  },
                  count: "$$mostFrequentMonth.count",
                },
              },
            },
            mostFrequentDay: {
              $let: {
                vars: {
                  mostFrequentDay: {
                    $arrayElemAt: ["$mostFrequentDay", 0],
                  },
                },
                in: {
                  _id: "$$mostFrequentDay._id.date",
                  count: "$$mostFrequentDay.count",
                },
              },
            },
          },
        },
      ]);
    }

    /* RETURNS THE USER RECORDS */
    if (req.query.action === "userRecords") {
      pipeline = pipeline.concat([
        {
          $facet: {
            first: [{ $sort: { endDate: 1 } }, { $limit: 1 }],
            mostEncounters: [{ $sort: { totalEncounters: -1 } }, { $limit: 1 }],
            longestHunt: [
              { $sort: { "stats.totalHuntTime": -1 } },
              { $limit: 1 },
            ],
            mostDays: [{ $sort: { "stats.daysHunting": -1 } }, { $limit: 1 }],
            lowestEncounters: [
              {
                $match: {
                  totalEncounters: { $gt: 0 },
                },
              },
              { $sort: { totalEncounters: 1 } },
              { $limit: 1 },
            ],
            shortestHunt: [
              {
                $match: {
                  "stats.totalHuntTime": { $gt: 0 },
                },
              },
              { $sort: { "stats.totalHuntTime": 1 } },
              { $limit: 1 },
            ],
          },
        },
        {
          $project: {
            first: { $arrayElemAt: ["$first", 0] },
            mostEncounters: { $arrayElemAt: ["$mostEncounters", 0] },
            longestHunt: { $arrayElemAt: ["$longestHunt", 0] },
            mostDays: { $arrayElemAt: ["$mostDays", 0] },
            lowestEncounters: { $arrayElemAt: ["$lowestEncounters", 0] },
            shortestHunt: { $arrayElemAt: ["$shortestHunt", 0] },
          },
        },
      ]);
    }

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

    if (req.query.gameFilter && req.query.gameFilter !== "undefined") {
      pipeline.unshift({
        $match: { game: req.query.gameFilter },
      });
    }

    /* RETURNS THE SHINY LIST */
    if (req.query.shinyList) {
      pipeline = pipeline.concat([
        {
          $group: {
            _id: null,
            names: { $addToSet: "$name" },
            evolutionNames: {
              $addToSet: {
                $map: { input: "$evolutions", as: "evo", in: "$$evo.name" },
              },
            },
            formNames: {
              $addToSet: {
                $map: { input: "$forms", as: "form", in: "$$form.name" },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            names: {
              $setUnion: [
                "$names",
                {
                  $reduce: {
                    input: "$evolutionNames",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                {
                  $reduce: {
                    input: "$formNames",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
              ],
            },
          },
        },
      ]);
    }

    /* RETURNS GEOLOCATION LISTS */
    if (req.query.geoLocationList) {
      pipeline = [
        {
          $match: {
            "geoLocation.position": { $exists: true, $type: "array" },
            $expr: { $gt: [{ $size: "$geoLocation.position" }, 1] },
          },
        },
        {
          $group: {
            _id: null,
            geoLocation: { $addToSet: "$geoLocation" },
          },
        },
        {
          $unwind: "$geoLocation",
        },
        {
          $unwind: "$geoLocation",
        },
        {
          $match: {
            "geoLocation.name": {
              $nin: ["Bus", "Auto", "Trein"],
            },
          },
        },
        {
          $sort: { "geoLocation.name": 1 },
        },
        {
          $group: {
            _id: null,
            geoLocation: { $push: "$geoLocation" },
          },
        },
        {
          $project: {
            _id: 0,
            geoLocation: 1,
          },
        },
      ];
    }

    /* RETURNS GEOLOCATION LISTS */
    if (req.query.geoMapLocations) {
      pipeline = pipeline.concat([
        {
          $match: {
            "geoLocation.position": { $exists: true, $type: "array" },
            $expr: { $gt: [{ $size: "$geoLocation.position" }, 1] },
          },
        },
        {
          $project: {
            _id: 1,
            geoLocation: 1,
            trainer: 1,
            name: 1,
          },
        },
      ]);
    }

    /* RETURNS GEOLOCATION LISTS */
    if (req.query.geoMapLocationsMissing) {
      pipeline = [
        {
          $match: {
            geoLocation: { $exists: false },
          },
        },
      ];
    }

    /* RETURNS LIST OF GROUP EVOLUTIONS */
    if (req.query.groupShiniesEvolutions) {
      pipeline = [
        {
          $match: { group: req.query.groupShiniesEvolutions },
        },
        {
          $group: {
            _id: null,
            evolutions: { $addToSet: "$evolutions" },
            forms: { $addToSet: "$forms" },
          },
        },
        {
          $project: {
            _id: 0,
            evolutions: {
              $reduce: {
                input: "$evolutions",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
            forms: {
              $reduce: {
                input: "$forms",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
          },
        },
      ];
    }

    /* RETURNS LIST OF GROUPED POKéMONS */
    if (req.query.groupShiniesPokemons) {
      pipeline = [
        {
          $match: { group: req.query.groupShiniesPokemons },
        },
      ];
    }

    /* RETURNS THE NATURES COLLECTION */
    if (req.query.natureCollection) {
      pipeline = pipeline.concat([
        {
          $group: {
            _id: "$nature",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            data: { $push: { k: "$_id", v: "$count" } },
          },
        },
        {
          $project: {
            _id: 0,
            natureCount: { $arrayToObject: "$data" },
          },
        },
      ]);
    }

    /* RETURNS THE BALLS COLLECTION */
    if (req.query.ballCollection) {
      pipeline = pipeline.concat([
        {
          $group: {
            _id: "$ball",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            data: { $push: { k: "$_id", v: "$count" } },
          },
        },
        {
          $project: {
            _id: 0,
            ballCount: { $arrayToObject: "$data" },
          },
        },
      ]);
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

      /* RETURNS A LIST FOR THE ENC. GRAPH */
    } else if (req.query.encountersList) {
      query.totalEncounters = { $gt: 0 };
      if (req.query.trainer) {
        query.trainer = req.query.trainer;
      }
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
              totalEncounters: 1,
            },
          },
        ]);

        res.json(result);
      }
    } else {
      /* SHINY RESPONSE */
      let shiny = "";
      if (pipeline.length > 0) {
        shiny = await Shiny.aggregate(pipeline);
      } else {
        shiny = await Shiny.find();
      }

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
