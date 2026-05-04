window.SMJ_TEAMS = [
  ['cardinals','Arizona Cardinals','ARI'],['falcons','Atlanta Falcons','ATL'],['ravens','Baltimore Ravens','BAL'],['bills','Buffalo Bills','BUF'],
  ['panthers','Carolina Panthers','CAR'],['bears','Chicago Bears','CHI'],['bengals','Cincinnati Bengals','CIN'],['browns','Cleveland Browns','CLE'],
  ['cowboys','Dallas Cowboys','DAL'],['broncos','Denver Broncos','DEN'],['lions','Detroit Lions','DET'],['packers','Green Bay Packers','GB'],
  ['texans','Houston Texans','HOU'],['colts','Indianapolis Colts','IND'],['jaguars','Jacksonville Jaguars','JAX'],['chiefs','Kansas City Chiefs','KC'],
  ['raiders','Las Vegas Raiders','LV'],['chargers','Los Angeles Chargers','LAC'],['rams','Los Angeles Rams','LAR'],['dolphins','Miami Dolphins','MIA'],
  ['vikings','Minnesota Vikings','MIN'],['patriots','New England Patriots','NE'],['saints','New Orleans Saints','NO'],['giants','New York Giants','NYG'],
  ['jets','New York Jets','NYJ'],['eagles','Philadelphia Eagles','PHI'],['steelers','Pittsburgh Steelers','PIT'],['forty-niners','San Francisco 49ers','SF'],
  ['seahawks','Seattle Seahawks','SEA'],['buccaneers','Tampa Bay Buccaneers','TB'],['titans','Tennessee Titans','TEN'],['commanders','Washington Commanders','WAS']
].map(([id,name,abbr]) => ({ id, name, abbr, logo:`assets/teams/${id}.png` }));
