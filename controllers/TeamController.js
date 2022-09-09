const { Group } = require("../models/Group");
const { Team } = require("../models/Team");
const {
  POINTS,
  NUMBER_OF_TEAMS_PER_GROUP,
  NUMBER_OF_GROUPS,
  NUMBER_OF_MATCHES,
} = require("../utils/constants");
const { updateGroupStandings, addGroup } = require("./GroupController");

// Get all teams info
const getAllTeams = async (req, res) => {
  const teams = await Team.find();
  return res.status(200).json(teams);
};

// Add team info
// @Params
// team: team to be added
const addTeam = async (team) => {
  const newTeam = new Team({ ...team });
  const addedTeam = await newTeam.save();

  // add team to group and update standings
  await updateGroupStandings(team.groupNo, addedTeam);
};

// Add teams
// body: {
//   teams: {
//     name: string;
//     registrationDate: date;
//     groupNo: number;
//   }[];
// }
const addTeams = async (req, res) => {
  if (!req || !req.body || !req.body.teams) {
    return res.status(400).send("No teams provided");
  }

  const { teams } = req.body;

  const teamNames = new Map();
  const groupNumbers = new Map();
  for (const team of teams) {
    teamNames.set(team.name, 1);

    const currGroupVal = groupNumbers.get(team.groupNo);
    groupNumbers.set(team.groupNo, currGroupVal ? currGroupVal + 1 : 1);
  }

  // Check for duplicate team names
  if (teamNames.size < teams.length) {
    return res.status(400).send("Teams cannot have the same names");
  }

  // Check if there are correct number of groups
  if (groupNumbers.size !== NUMBER_OF_GROUPS) {
    return res.status(400).send(`There must be ${NUMBER_OF_GROUPS} groups`);
  }

  // Check if there are correct number of teams per group
  for (const val of groupNumbers.values()) {
    if (val !== NUMBER_OF_TEAMS_PER_GROUP) {
      return res
        .status(400)
        .send(`Each group must have ${NUMBER_OF_TEAMS_PER_GROUP} teams`);
    }
  }

  // Add groups
  for (const groupNo of groupNumbers.keys()) {
    await addGroup(groupNo);
  }

  // Add teams
  for (const team of teams) {
    await addTeam(team);
  }

  const groups = await Group.find();
  return res.status(200).json(groups);
};

// helper function to recalculate and update team points
// @Params:
//   team: mongoose model of team
const updateTeamPoints = async (team) => {
  team.points =
    team.wins * POINTS.WIN_POINTS +
    team.losses * POINTS.LOSE_POINTS +
    team.draws * POINTS.DRAW_POINTS;
  team.alternatePoints =
    team.wins * POINTS.WIN_ALT_POINTS +
    team.losses * POINTS.LOSE_ALT_POINTS +
    team.draws * POINTS.DRAW_ALT_POINTS;

  const updatedTeam = await team.save();
  await updateGroupStandings(updatedTeam.groupNo, updatedTeam);

  return updatedTeam;
};

// Add match info
// @Params
// match: match to be added
const addMatch = async (match) => {
  const { team1, team2, team1Goals, team2Goals } = match;
  const firstTeam = await Team.findOne({ name: team1 });
  const secondTeam = await Team.findOne({ name: team2 });

  // update teams' total goals
  console.log("first before", firstTeam.goals, team1Goals);
  firstTeam.goals += team1Goals;
  secondTeam.goals += team2Goals;
  console.log("first after", firstTeam.goals, team1Goals);

  // update teams' points and WDL record
  if (team1Goals > team2Goals) {
    firstTeam.wins += 1;
    secondTeam.losses += 1;
  } else if (team2Goals > team1Goals) {
    secondTeam.wins += 1;
    firstTeam.losses += 1;
  } else {
    firstTeam.draws += 1;
    secondTeam.draws += 1;
  }

  const savedFirstTeam = await firstTeam.save();
  const savedSecondTeam = await secondTeam.save();

  await updateTeamPoints(savedFirstTeam);
  await updateTeamPoints(savedSecondTeam);
};

// Add matches
// body: {
//   matches: {
//     team1: string;
//     team2: string;
//     team1Goals: number;
//     team2Goals: number;
//   }[];
// }
const addMatches = async (req, res) => {
  const { matches } = req.body;
  if (!req || !req.body || !req.body.matches) {
    return res.status(400).send("No matches provided");
  }

  // check if there are correct number of matches
  if (matches.length !== NUMBER_OF_MATCHES) {
    return res.status(400).send(`There must be ${NUMBER_OF_MATCHES} matches`);
  }

  const teamPairings = new Map();
  for (const match of matches) {
    const firstTeam = await Team.findOne({ name: match.team1 });
    const secondTeam = await Team.findOne({ name: match.team2 });

    // check if both teams exist
    if (!firstTeam) {
      return res.status(404).send(`Team ${match.team1} not found`);
    }

    if (!secondTeam) {
      return res.status(404).send(`Team ${match.team2} not found`);
    }

    // only teams in the same group play each other
    if (firstTeam.groupNo !== secondTeam.groupNo) {
      return res.status(400).send("Teams are in different groups");
    }

    // check if teams have played each other before
    // using a concatenated string of their names as key
    if (match.team1 < match.team2) {
      if (teamPairings.has(match.team1 + match.team2)) {
        return res.status(400).send("Teams can only play each other once");
      }
      teamPairings.set(match.team1 + match.team2, 1);
    } else if (match.team2 < match.team1) {
      if (teamPairings.has(match.team2 + match.team1)) {
        return res.status(400).send("Teams can only play each other once");
      }
      teamPairings.set(match.team2 + match.team1, 1);
    } else {
      // team1 is team2
      return res.status(400).send("A team cannot play against themselves");
    }

    // check if goals are negative
    if (match.team1Goals < 0 || match.team2Goals < 0) {
      return res.status(400).send("Goals cannot be a negative number");
    }
  }

  for (const match of matches) {
    await addMatch(match);
  }

  const groups = await Group.find();
  return res.status(200).json(groups);
};

const clearTeams = () => Team.deleteMany({});

module.exports = {
  getAllTeams,
  addTeams,
  addMatches,
  clearTeams,
};
