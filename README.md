some infos taken from
  https://github.com/mist64/ultimatetron2

score calculation from https://github.com/mist64/ultimatetron2/blob/master/basic.bas
    kill:   score += PR
    escape: score += PR*3 (ON ESCAPE:: "time of dead" and "win" scores not counted)
    time of dead: score += DEATH_ORDER OF PLAYER
        on player death store amount of already dead players as bonus score, _then_ add one to number of dead players.
    win:    score += PR*2

display:
    $GAMENUMBER GAME'S RESULTS..
    $NAME1 KILLS NAME2
display one of:
    ALL PLAYERS CRASHED
    $NAME ESCAPED!!!
    $NAME WINS GAME!
