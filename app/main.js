const Empty = 0;
const Black = 1;
const White = 2;

let oppTurn = function(turn) {
  return 3 - turn;
}

let mod = function(x, m) {
  if (x < 0) {
    const mxm = -x % m;
    return (m - mxm) % m;
  } else {
    return x % m;
  }
}

let movable_pos = function(matrix, turn, row, col) {
  if (matrix[row][col] != 0) return false;
  let flipped = false;
  const di = [1, 1, 1, 0, -1, -1, -1, 0];
  const dj = [1, 0, -1, -1, -1, 0, 1, 1];
  for (let dir = 0; dir < 8; dir++) {
    for (let k = 1; k <= 8; ++k) {
      const ni = mod(row + di[dir] * k, 8);
      const nj = mod(col + dj[dir] * k, 8);
      if (k == 8) {
        flipped = true;
        break;
      }
      let finished = false;
      switch (matrix[ni][nj]) {
        case Empty:
          finished = true;
          break;
        case turn:
          if (k > 1) {
            flipped = true;
          }
          finished = true;
          break;
        default: break;
      }
      if (finished) {
        break;
      }
    }
  }
  return flipped;
}

let movable = function(matrix, turn) {
  let flipped = false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (movable_pos(matrix, turn, row, col)) {
        flipped = true;
      }
    }
  }
  return flipped;
}

let isGameOver = function(matrix) {
  return !movable(matrix, Black) && !movable(matrix, White);
}

let copyMatrix = function(matrix) {
  return Array.from(matrix, row => Array.from(row, x => x));
}

let nextMatrix = function(matrix, turn, row, col) {
  let next = copyMatrix(matrix);
  next[row][col] = turn;
  const di = [1, 1, 1, 0, -1, -1, -1, 0];
  const dj = [1, 0, -1, -1, -1, 0, 1, 1];
  let flipped = false;
  for (let dir = 0; dir < 8; dir++) {
    for (let k = 1; k <= 8; ++k) {
      const ni = mod(row + di[dir] * k, 8);
      const nj = mod(col + dj[dir] * k, 8);
      let finished = false;
      switch (next[ni][nj]) {
        case Empty:
          finished = true;
          break;
        case turn:
          for (let l = 1; l < k; ++l) {
            const mi = mod(row + di[dir] * l, 8);
            const mj = mod(col + dj[dir] * l, 8);
            next[mi][mj] = turn;
            flipped = true;
          }
          finished = true;
          break;
        default: break;
      }
      if (finished) {
        break;
      }
    }
  }
  return next;
}

let score = function(matrix, turn) {
  let turn_num = 0;
  let opp_num = 0;
  const opp = oppTurn(turn);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      switch (matrix[row][col]) {
        case turn: turn_num++; break;
        case opp: opp_num++; break;
      }
    }
  }
  if (turn_num > opp_num) {
    return 64 - 2*opp_num;
  } else if (opp_num > turn_num) {
    return -64 + 2*turn_num;
  } else {
    return 0;
  }
}

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
      return [score(matrix, turn)[0], -1, -1];
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
    matrix: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    turn: Black,
    prevrow: -1,
    prevcol: -1,
    mode: Single
  },
  computed: {
    blackcount: function() {
      let black_num = 0;
      let white_num = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          switch (this.matrix[row][col]) {
            case Black: black_num++; break;
            case White: white_num++; break;
          }
        }
      }
      if (black_num > white_num) {
        return 64 - white_num;
      } else {
        return black_num;
      }
    },
    whitecount: function() {
      let black_num = 0;
      let white_num = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          switch (this.matrix[row][col]) {
            case Black: black_num++; break;
            case White: white_num++; break;
          }
        }
      }
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
      this.matrix = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ];
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
      this.matrix = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ];
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
