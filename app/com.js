importScripts('board.js');

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
  const empty_count = count(matrix, Empty);
  let depth = 6;
  if (empty_count <= 10) {
    depth = 10;
  } else if (empty_count <= 16) {
    depth = 8;
  }
  const res = think_impl(matrix, turn, -64, 64, false, depth);
  return [res[1], res[2]];
}

onmessage = function(e) {
  const res = think(e.data[0], e.data[1]);
  postMessage(res);
};
