// sorting function to arrange group standings
const arrangeStandings = (a, b) => {
  // -1 means higher ranking
  if (a.points !== b.points) {
    // compare by points if different
    return b.points - a.points;
  }

  if (a.goals !== b.goals) {
    // compare by number of goals if different
    return b.goals - a.goals;
  }

  if (a.alternatePoints !== b.alternatePoints) {
    // compare by alternate points if different
    return b.alternatePoints - a.alternatePoints;
  }

  // finally, compare by registration date
  return a.registrationDate - b.registrationDate;
};

module.exports = {
  arrangeStandings,
};
