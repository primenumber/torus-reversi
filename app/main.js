const Empty = 0;
const Black = 1;
const White = 2;

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
    turn: Black
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
    reset: function() {
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
    },
    pass: function() {
      let flipped = movable(this.matrix, this.turn);
      if (flipped) {
        alert("今はパスできません");
      } else {
        this.turn = 3 - this.turn;
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
      Vue.set(this.matrix[row], col, this.turn);
      const di = [1, 1, 1, 0, -1, -1, -1, 0];
      const dj = [1, 0, -1, -1, -1, 0, 1, 1];
      let flipped = false;
      for (let dir = 0; dir < 8; dir++) {
        for (let k = 1; k <= 8; ++k) {
          const ni = mod(row + di[dir] * k, 8);
          const nj = mod(col + dj[dir] * k, 8);
          let finished = false;
          switch (this.matrix[ni][nj]) {
            case Empty:
              finished = true;
              break;
            case this.turn:
              for (let l = 1; l < k; ++l) {
                const mi = mod(row + di[dir] * l, 8);
                const mj = mod(col + dj[dir] * l, 8);
                Vue.set(this.matrix[mi], mj, this.turn);
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
      if (!flipped) {
        Vue.set(this.matrix[row], col, Empty);
        alert("ここには置けません");
      } else {
        this.turn = 3 - this.turn;
      }
    }
  }
})
