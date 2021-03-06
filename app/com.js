importScripts('board.js');

let eval_board = function(matrix, turn) {
  if (isGameOver(matrix)) {
    return score(matrix, turn);
  } else {
    const empty_num = count(matrix, Empty);
    const player_num = count(matrix, turn);
    const opponent_num = count(matrix, oppTurn(turn));
    const evenodd = empty_num % 2;
    let parity_penalty = 0;
    if (evenodd == 0) { // even
      parity_penalty = Komi / 2;
    } else {
      parity_penalty = -Komi / 2;
    }
    return player_num - opponent_num - parity_penalty;
  }
}

let think_impl = function(matrix, turn, alpha, beta, passed, depth) {
  if (depth <= 0) {
    return [eval_board(matrix, turn), -1, -1];
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

let think = function(matrix, turn, level) {
  level = Math.min(level, 2);
  const empty_count = count(matrix, Empty);
  let depth = [2, 4, 6];
  if (empty_count <= 10) {
    depth = [4, 7, 10];
  } else if (empty_count <= 14) {
    depth = [3, 5, 8];
  }
  const res = think_impl(matrix, turn, -64, 64, false, depth[level]);
  return [res[1], res[2]];
}

onmessage = function(e) {
  const res = think(e.data.matrix, e.data.turn, e.data.level);
  postMessage(res);
};
