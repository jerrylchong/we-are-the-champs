const { Team } = require("../models/Team");
const { POINTS, NUMBER_OF_TEAMS_PER_GROUP } = require("../utils/constants");
const { updateGroupStandings, addGroup } = require("./GroupController");

// Get all teams info
const getAllTeams = async (req, res) => {
  const teams = await Team.find();
  return res.status(200).json(teams);
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

  const group = await addGroup(req.body.groupNo);
  if (!group) {
    return res.status(400).send("No more groups can be added");
  }

  if (group.teams.length >= NUMBER_OF_TEAMS_PER_GROUP) {
    return res.status(400).send(`Group ${req.body.groupNo} is already full`);
  }

  const newTeam = new Team({ ...req.body });
  const addedTeam = await newTeam.save();

  // add team to group and update standings
  await updateGroupStandings(group.number, addedTeam);

  return res.status(200).json(addedTeam);
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
  } else if (team2Goals > team1Goals) {
    secondTeam.wins += 1;
    firstTeam.losses += 1;
  } else {
    firstTeam.draws += 1;
    secondTeam.draws += 1;
  }

  const savedFirstTeam = await firstTeam.save();
  const savedSecondTeam = await secondTeam.save();

  const updatedFirstTeam = await updateTeamPoints(savedFirstTeam);
  const updatedSecondTeam = await updateTeamPoints(savedSecondTeam);

  return res.status(200).json([updatedFirstTeam, updatedSecondTeam]);
};

const clearTeams = () => Team.deleteMany({});

module.exports = {
  getAllTeams,
  addTeam,
  addMatch,
  clearTeams,
};
