const Team = require("../models/Team");
const { Points } = require("../utils/constants");

// Get all teams info
const getAllTeams = async (req, res) => {
  const teams = await Team.find();
  return res.status(200).json(teams);
};

// Get group standings
const getGroupStandings = async (req, res) => {
  const teams = await Team.find().sort({
    groupNo: 1,
    points: -1,
    goals: -1,
    alternatePoints: -1,
    registrationDate: 1,
  });

  const standings = [];

  if (teams && teams.length > 0) {
    let startInd = 0;
    let groupNo = teams[0].groupNo;

    for (let i in teams) {
      if (teams[i].groupNo !== groupNo) {
        standings.push(teams.slice(startInd, i));
        startInd = i;
        groupNo = teams[i].groupNo;
      }
    }
    standings.push(teams.slice(startInd));
  }

  return res.status(200).json(standings);
};

// Add team info
// body: {
//   name: string;
//   registrationDate: date;
//   groupNo: number;
// }
const addTeam = async (req, res) => {
  const existing = await Team.findOne({ name: req.body.name });
  if (existing) {
    return res.status(400).send(`${req.body.name} already exists`);
  }

  const newTeam = new Team({ ...req.body });
  const addedTeam = await newTeam.save();
  return res.status(200).json(addedTeam);
};

// helper function to recalculate and update team points
// @Params:
//   team: mongoose model of team
const updateTeamPoints = async (team) => {
  team.points =
    team.wins * Points.WIN_POINTS +
    team.losses * Points.LOSE_POINTS +
    team.draws * Points.DRAW_POINTS;
  team.alternatePoints =
    team.wins * Points.WIN_ALT_POINTS +
    team.losses * Points.LOSE_ALT_POINTS +
    team.draws * Points.DRAW_ALT_POINTS;

  const updatedTeam = await team.save();
  return updatedTeam;
};

// Add match info
// body: {
//   team1: string;
//   team2: string;
//   team1Goals: number;
//   team2Goals: number;
// }
const addMatch = async (req, res) => {
  const { team1, team2, team1Goals, team2Goals } = req.body;

  const firstTeam = await Team.findOne({ name: team1 });
  const secondTeam = await Team.findOne({ name: team2 });

  // only teams in the same group play each other
  if (firstTeam.groupNo !== secondTeam.groupNo) {
    return res.status(400).send("Teams are in different groups");
  }

  // update teams' total goals
  firstTeam.goals += team1Goals;
  secondTeam.goals += team2Goals;

  // update teams' points and WDL record
  if (team1Goals > team2Goals) {
    firstTeam.wins += 1;
    secondTeam.losses += 1;

    firstTeam.points += 3;
    firstTeam.alternatePoints += 5;
  } else if (team2Goals > team1Goals) {
    secondTeam.wins += 1;
    firstTeam.losses += 1;

    secondTeam.points += 3;
    secondTeam.alternatePoints += 5;
  } else {
    firstTeam.draws += 1;
    secondTeam.draws += 1;

    firstTeam.points += 1;
    firstTeam.alternatePoints += 3;

    secondTeam.points += 1;
    secondTeam.alternatePoints += 3;
  }

  const updatedFirstTeam = await updateTeamPoints(firstTeam);
  const updatedSecondTeam = await updateTeamPoints(secondTeam);

  return res.status(200).json([updatedFirstTeam, updatedSecondTeam]);
};

module.exports = {
  getAllTeams,
  getGroupStandings,
  addTeam,
  addMatch,
};
