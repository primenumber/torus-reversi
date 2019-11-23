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

let newMatrix = function() {
  return [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
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

let count = function(matrix, turn) {
  let num = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (matrix[row][col] == turn) {
        num++;
      }
    }
  }
  return num;
}

let score = function(matrix, turn) {
  let turn_num = count(matrix, turn);
  let opp_num = count(matrix, oppTurn(turn));
  if (turn_num > opp_num) {
    return 64 - 2*opp_num;
  } else if (opp_num > turn_num) {
    return -64 + 2*turn_num;
  } else {
    return 0;
  }
}
