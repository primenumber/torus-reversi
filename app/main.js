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
    worker: new Worker('com.js'),
    level: 0,
    lowest_level: 0,
  },
  computed: {
    blackcount: function() {
      const black_num = count(this.matrix, Black);
      const white_num = count(this.matrix, White);
      const diff = black_num - white_num + Komi;
      if (diff > 0) {
        return 64 - white_num;
      } else {
        return black_num;
      }
    },
    whitecount: function() {
      const black_num = count(this.matrix, Black);
      const white_num = count(this.matrix, White);
      const diff = black_num - white_num + Komi;
      if (diff > 0) {
        return white_num;
      } else {
        return 64 - black_num;
      }
    },
    winner: function() {
      const diff = this.blackcount - this.whitecount + Komi;
      if (diff > 0) {
        return Black;
      } else {
        return White;
      }
    },
    winner_string: function() {
      if (this.winner === Black) {
        return "黒の勝利";
      } else {
        return "白の勝利";
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
    },
    playerpass: function() {
      if (this.gameover) return false;
      if (!this.playerturn) return false;
      let flipped = movable(this.matrix, this.turn);
      return flipped == 0;
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
        this.prevrow = -1;
        this.prevcol = -1;
      }
      this.lowest_level = this.level;
    },
    doubleMode: function() {
      this.matrix = newMatrix();
      this.turn = Black;
      this.mode = Double;
      this.prevrow = -1;
      this.prevcol = -1;
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
      this.worker.postMessage({
        matrix: this.matrix,
        turn: this.turn,
        level: this.level
      });
    },
    share: function() {
      if (this.mode == Double) {
        const url = encodeURI(`https://twitter.com/intent/tweet?text=トーラスリバーシで遊んで、${this.blackcount} vs ${this.whitecount}で${this.winner}！&url=https://poyo.me/reversi/torus/&hashtags=トーラスリバーシ`);
        window.open(url, 'twitter');
      } else {
        let level_str = '';
        switch (this.lowest_level) {
          case 0: level_str = "Easy"; break;
          case 1: level_str = "Normal"; break;
          case 2: level_str = "Hard"; break;
        }
        let player_count = 0;
        let com_count = 0;
        let winlose = '';
        let turn = 0;
        let turn_string = '';
        if (this.mode == SingleBlack) {
          player_count = this.blackcount;
          com_count = this.whitecount;
          turn = Black;
          turn_string = '先手';
        } else {
          player_count = this.whitecount;
          com_count = this.blackcount;
          turn = White;
          turn_string = '後手';
        }
        if (this.winner == turn) {
          winlose = '勝利しました！';
        } else {
          winlose = '敗北しました...';
        }
        const url = encodeURI(`https://twitter.com/share?text=トーラスリバーシで難易度${level_str}のAIと${turn_string}で戦い、${player_count} vs ${com_count}(コミ${Komi}石)で${winlose}&url=https://poyo.me/reversi/torus/&hashtags=トーラスリバーシ`);
        window.open(url, 'twitter');
      }
    }
  },
  watch: {
    level: function(val) {
      this.lowest_level = Math.min(this.lowest_level, val);
    }
  }
})
