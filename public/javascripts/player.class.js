cPlayer = function (sName, sColor, iLeft, iRight, hPos, iMove) {
  this.hPos = hPos || { x: 40, y: 120 };
  this.hInit = {
    hPos: {},
    iMove: iMove,
  };
  this.hInit.hPos.x = this.hPos.x;
  this.hInit.hPos.y = this.hPos.y;
  this.iBlockSize = game.iBlockSize || 2;
  this.sName = sName || "Hidden";
  this.sColor = sColor || "rgb(0,0,0)";
  this.iLeft = iLeft || 75; // 75: k
  this.iRight = iRight || 76; // 76: l
  this.hDir = { x: 0, y: 0 };
  document.addEventListener("keydown", (evt) => this.changeDir(evt));
  this.init(this.hPos, iMove);
};
cPlayer.prototype = {
  init: function (hPos, iMove) {
    this.hPos = hPos;
    this.iMove = iMove || 1;
    this.bAlive = 1;
    this.bEscaped = 0;
    this.iKilledBy = -1;
    this.setDir();
  },

  reset: function () {
    var hPos = {
      x: this.hInit.hPos.x,
      y: this.hInit.hPos.y,
    };
    this.init(hPos, this.hInit.iMove);
  },

  setDir: function () {
    this.hDir["x"] = this.iMove % 2 == 0 ? 0 : this.iMove == 1 ? 1 : -1;
    this.hDir["y"] = this.iMove % 2 == 1 ? 0 : this.iMove == 2 ? 1 : -1;
  },

  move: function () {
    for (var sAxis in { x: 1, y: 1 }) {
      this.hPos[sAxis] += this.hDir[sAxis];
    }
  },

  changeDir: function (oEvent) {
    if (oEvent.keyCode == this.iLeft || oEvent.keyCode == this.iRight) {
      var iChange = oEvent.keyCode == this.iLeft ? -1 : 1;
      this.iMove = (this.iMove + iChange + 4) % 4;
      this.setDir();
    }
  },
};
