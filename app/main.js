const SingleBlack = 0;
const SingleWhite = 1;
const Double = 2;

let vm = new Vue({
  el: "#game",
  data: {
    matrix: newMatrix(),
    turn: Black,
    prevrow: -1,
    prevcol: -1,
    mode: SingleBlack,
    worker: new Worker('com.js')
  },
  computed: {
    blackcount: function() {
      let black_num = count(this.matrix, Black);
      let white_num = count(this.matrix, White);
      if (black_num > white_num) {
        return 64 - white_num;
      } else {
        return black_num;
      }
    },
    whitecount: function() {
      let black_num = count(this.matrix, Black);
      let white_num = count(this.matrix, White);
      if (white_num > black_num) {
        return 64 - black_num;
      } else {
        return white_num;
      }
    },
    winner: function() {
      if (this.blackcount > this.whitecount) {
        return "黒の勝利";
      } else if (this.whitecount > this.blackcount) {
        return "白の勝利";
      } else {
        return "引き分け";
      }
    },
    ok: function() {
      let okary = Array.from(Array(8), () => Array(8));
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          okary[row][col] = movable_pos(this.matrix, this.turn, row, col);
        }
      }
      return okary;
    },
    gameover: function() {
      return isGameOver(this.matrix);
    },
    turnstring: function() {
      switch (this.turn) {
        case Black: return "黒";
        case White: return "白";
        default: return "";
      }
    },
    singlemode: function() {
      return this.mode == SingleBlack || this.mode == SingleWhite;
    },
    playerturn: function() {
      switch (this.mode) {
        case Double: return true;
        case SingleBlack: return this.turn == Black;
        case SingleWhite: return this.turn == White;
        default: return false;
      }
    }
  },
  methods: {
    singleMode: function(turn) {
      this.matrix = newMatrix();
      this.turn = turn;
      if (turn == White) {
        this.matrix[3][2] = Black;
        this.matrix[3][3] = Black;
        this.prevrow = 3;
        this.prevcol = 2;
        this.mode = SingleWhite;
      } else {
        this.mode = SingleBlack;
      }
    },
    doubleMode: function() {
      this.matrix = newMatrix();
      this.turn = Black;
      this.mode = Double;
    },
    pass: function() {
      let flipped = movable(this.matrix, this.turn);
      if (flipped) {
        alert("今はパスできません");
      } else if (this.playerturn) {
        this.turn = oppTurn(this.turn);
        this.prevrow = -1;
        this.prevcol = -1;
        if (this.singlemode) {
          this.kick();
        }
      }
    },
    put: function(row, col) {
      if (row < 0 || row >= 8 || col < 0 || col >= 8) {
        console.log("Invalid position");
        return;
      }
      if (!this.playerturn) {
        console.log("Com turn");
        return;
      }
      const now = this.matrix[row][col];
      if (now != Empty) {
        return;
      }
      if (movable_pos(this.matrix, this.turn, row, col)) {
        this.matrix = nextMatrix(this.matrix, this.turn, row, col);
        this.turn = oppTurn(this.turn);
        this.prevrow = row;
        this.prevcol = col;
        if (this.singlemode) {
          this.kick();
        }
      }
    },
    kick: function() {
      this.worker.onmessage = e => {
        const [row, col] = e.data;
        if (row >= 0 && col >= 0) {
          this.matrix = nextMatrix(this.matrix, this.turn, row, col);
        }
        this.turn = oppTurn(this.turn);
        this.prevrow = row;
        this.prevcol = col;
      };
      this.worker.postMessage([this.matrix, this.turn]);
    }
  }
})

vm.singleMode(White);
