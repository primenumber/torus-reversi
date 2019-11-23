let think_impl = function(matrix, turn, alpha, beta, passed, depth) {
  if (depth <= 0) {
    return [score(matrix, turn), -1, -1];
  }
  const opp = oppTurn(turn);
  let pass = true;
  let max = -1e9;
  let maxrow = 0;
  let maxcol = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (movable_pos(matrix, turn, row, col)) {
        pass = false;
        const next = nextMatrix(matrix, turn, row, col);
        const val = -think_impl(next, opp, -beta, -alpha, false, depth-1)[0];
        if (val > max) {
          max = val;
          maxrow = row;
          maxcol = col;
          if (val > alpha) {
            alpha = val;
            if (val >= beta) {
              return [val, row, col];
            }
          }
        }
      }
    }
  }
  if (pass) {
    if (passed) {
      return [score(matrix, turn), -1, -1];
    } else {
      return [-think_impl(matrix, opp, -beta, -alpha, true, depth-1)[0], -1, -1];
    }
  } else {
    return [max, maxrow, maxcol];
  }
}

let think = function(matrix, turn) {
  const res = think_impl(matrix, turn, -64, 64, false, 5);
  return [res[1], res[2]];
}

const Single = 0;
const Double = 1;

let vm = new Vue({
  el: "#game",
  data: {
    matrix: newMatrix(),
    turn: Black,
    prevrow: -1,
    prevcol: -1,
    mode: Single
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
      }
      this.mode = Single;
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
      } else {
        this.turn = oppTurn(this.turn);
        if (this.mode == Single) {
          let [thinked_row, thinked_col] = think(this.matrix, this.turn);
          if (thinked_row >= 0 && thinked_col >= 0) {
            this.matrix = nextMatrix(this.matrix, this.turn, thinked_row, thinked_col);
          }
          this.turn = oppTurn(this.turn);
          this.prevrow = thinked_row;
          this.prevcol = thinked_col;
        }
      }
    },
    put: function(row, col) {
      if (row < 0 || row >= 8 || col < 0 || col >= 8) {
        console.log("Invalid position");
        return;
      }
      const now = this.matrix[row][col];
      if (now != Empty) {
        alert("ここには置けません");
        return;
      }
      if (!movable_pos(this.matrix, this.turn, row, col)) {
        alert("ここには置けません");
      } else {
        this.matrix = nextMatrix(this.matrix, this.turn, row, col);
        this.turn = oppTurn(this.turn);
        if (this.mode == Single) {
          let [thinked_row, thinked_col] = think(this.matrix, this.turn);
          if (thinked_row >= 0 && thinked_col >= 0) {
            this.matrix = nextMatrix(this.matrix, this.turn, thinked_row, thinked_col);
          }
          this.turn = oppTurn(this.turn);
          this.prevrow = thinked_row;
          this.prevcol = thinked_col;
        }
      }
    }
  }
})
