var game = {};
game.hParams = {
  iFps: 20,
  iWidth: 640,
  iHeight: 480,
  iBlockSize: 2,
  sBGColor: "rgb(255,255,255)",
  sBorderColor: "rgb(0,0,0)",
};

game.timer = {
  interval: null,
  started: null,
  lastrun: null,
};

game.init = function () {
  game.oArena = new cArena();
  game.oArena.addPlayer();
  game.oArena.addPlayer(
    "sheimer",
    "rgb(0,0,0)",
    65 /*a*/,
    83 /*s*/,
    { x: 279, y: 120 },
    3,
  );
};

game.start = function () {
  document.getElementById("log").innerHTML = "";
  game.oArena.reset();
  console.log(Math.round(1000 / game.hParams.iFps));
  //game.running = setInterval(game.run, Math.round(1000 / game.hParams.iFps));
  game.running = true;
  game.timer.interval = Math.round(1000 / game.hParams.iFps);
  game.timer.started = new Date().getTime();
  game.timer.lastrun = null;
  game.run();
};

game.run = function () {
  const current = new Date().getTime();

  const timediff =
    game.timer.lastrun !== null
      ? current - game.timer.lastrun
      : game.timer.interval;

  if (timediff >= game.timer.interval) {
    const overlap = timediff - game.timer.interval;
    game.timer.lastrun = current - overlap;
    game.oArena.run();
  }

  window.requestAnimationFrame(() => {
    console.log(timediff);
    if (game.running) {
      game.run();
    }
  });
};
