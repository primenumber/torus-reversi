pub const MAT_SIZE: usize = 8;
pub const KOMI: isize = 13; // 0.5-point omitted
pub const MAX_SCORE: isize = 2 * ((MAT_SIZE * MAT_SIZE) as isize + KOMI) + 1;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Square {
    Empty,
    Black,
    White
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Turn {
    First,
    Second
}

impl Turn {
    pub fn opponent(&self) -> Self {
        match self {
            Turn::First => Turn::Second,
            Turn::Second => Turn::First
        }
    }
}

impl From<Turn> for Square {
    fn from(turn: Turn) -> Self {
        match turn {
            Turn::First => Square::Black,
            Turn::Second => Square::White
        }
    }
}

#[derive(Clone, PartialEq, Eq, Hash, Debug)]
pub struct Board {
    matrix: [[Square; MAT_SIZE]; MAT_SIZE]
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub struct Pos {
    row: usize,
    col: usize
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Play {
    Pass,
    Move(Pos),
    Invalid
}

pub struct NextBoard<'a> {
    board: &'a Board,
    turn: Turn,
    index: usize,
    played: bool
}

impl Board {
    pub fn is_movable_at(&self, turn: Turn, pos: Pos) -> bool {
        assert!(pos.row < MAT_SIZE, "{} >= {}", pos.row, MAT_SIZE);
        assert!(pos.col < MAT_SIZE, "{} >= {}", pos.col, MAT_SIZE);
        if self.matrix[pos.row][pos.col] != Square::Empty {
            return false;
        }
        let mat_size = MAT_SIZE as isize;
        let row = pos.row as isize;
        let col = pos.col as isize;
        let dr = [1, 1, 1, 0, -1, -1, -1, 0];
        let dc = [1, 0, -1, -1, -1, 0, 1, 1];
        for dir in 0..8 {
            for len in 1..=mat_size {
                if len == mat_size {
                    return true;
                }
                let new_r = ((row + len * dr[dir] + mat_size) % mat_size) as usize;
                let new_c = ((col + len * dc[dir] + mat_size) % mat_size) as usize;
                if self.matrix[new_r][new_c] == Square::Empty {
                    break;
                } else if self.matrix[new_r][new_c] == Square::from(turn) {
                    if len > 1 {
                        return true;
                    } else {
                        break;
                    }
                }
            }
        }
        false
    }
    pub fn is_movable(&self, turn: Turn) -> bool {
        for row in 0..MAT_SIZE {
            for col in 0..MAT_SIZE {
                if self.is_movable_at(turn, Pos { row, col }) {
                    return true;
                }
            }
        }
        false
    }
    pub fn is_gameover(&self) -> bool {
        !self.is_movable(Turn::First) && !self.is_movable(Turn::Second)
    }
    pub fn move_at(&self, turn: Turn, pos: Pos) -> Self {
        assert!(pos.row < MAT_SIZE, "{} >= {}", pos.row, MAT_SIZE);
        assert!(pos.col < MAT_SIZE, "{} >= {}", pos.col, MAT_SIZE);
        assert!(self.is_movable_at(turn, pos), "Cannot move at {:?}", pos);
        let mut result = self.clone();
        result.matrix[pos.row][pos.col] = Square::from(turn);
        let mat_size = MAT_SIZE as isize;
        let row = pos.row as isize;
        let col = pos.col as isize;
        let dr = [1, 1, 1, 0, -1, -1, -1, 0];
        let dc = [1, 0, -1, -1, -1, 0, 1, 1];
        for dir in 0..8 {
            for len in 1..mat_size {
                let new_r = ((row + len * dr[dir] + mat_size) % mat_size) as usize;
                let new_c = ((col + len * dc[dir] + mat_size) % mat_size) as usize;
                if self.matrix[new_r][new_c] == Square::Empty {
                    break;
                } else if self.matrix[new_r][new_c] == Square::from(turn) {
                    for mid in 1..len {
                        let mid_r = ((row + mid * dr[dir] + mat_size) % mat_size) as usize;
                        let mid_c = ((col + mid * dc[dir] + mat_size) % mat_size) as usize;
                        result.matrix[mid_r][mid_c] = Square::from(turn);
                    }
                }
            }
        }
        result
    }
    pub fn play(&self, turn: Turn, play: Play) -> Self {
        match play {
            Play::Pass => {
                assert!(!self.is_movable(turn), "Cannot pass");
                self.clone()
            },
            Play::Move(pos) => {
                self.move_at(turn, pos)
            },
            Play::Invalid => {
                panic!("Invalid move");
            }
        }
    }
    pub fn nexts(&self, turn: Turn) -> NextBoard {
        NextBoard {
            board: self,
            turn,
            index: 0,
            played: false
        }
    }
    pub fn count(&self, kind: Square) -> usize {
        let mut result = 0;
        for row in 0..MAT_SIZE {
            for col in 0..MAT_SIZE {
                if self.matrix[row][col] == kind {
                    result += 1;
                }
            }
        }
        result
    }
    pub fn current_score(&self) -> isize {
        let black_count = self.count(Square::Black) as isize;
        let white_count = self.count(Square::White) as isize;
        let total_squares = (MAT_SIZE * MAT_SIZE) as isize;
        if black_count + KOMI >= white_count {
            let new_black_count = total_squares - white_count;
            2 * (new_black_count - white_count + KOMI) + 1 // add 0.5-point komi
        } else {
            let new_white_count = total_squares - black_count;
            2 * (black_count - new_white_count + KOMI) + 1
        }
    }
}

impl Default for Board {
    fn default() -> Self {
        assert_eq!(MAT_SIZE % 2, 0);
        let mut matrix: [[Square; MAT_SIZE]; MAT_SIZE] =
            [[Square::Empty; MAT_SIZE]; MAT_SIZE];
        let half = MAT_SIZE / 2;
        matrix[half][half] = Square::White;
        matrix[half][half-1] = Square::Black;
        matrix[half-1][half] = Square::Black;
        matrix[half-1][half-1] = Square::White;
        Board { matrix }
    }
}

use std::fmt;

impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in &self.matrix {
            for sq in line {
                match sq {
                    Square::Empty => write!(f, "."),
                    Square::Black => write!(f, "X"),
                    Square::White => write!(f, "O")
                }?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

impl Iterator for NextBoard<'_> {
    type Item = (Board, Play);
    fn next(&mut self) -> Option<Self::Item> {
        while self.index < MAT_SIZE * MAT_SIZE {
            let row = self.index / MAT_SIZE;
            let col = self.index % MAT_SIZE;
            let pos = Pos { row, col };
            self.index += 1;
            if self.board.is_movable_at(self.turn, pos) {
                self.played = true;
                return Some((self.board.move_at(self.turn, pos), Play::Move(pos)));
            }
        }
        if !self.played {
            self.played = true;
            Some((self.board.clone(), Play::Pass))
        } else {
            None
        }
    }
}

#[derive(Clone, PartialEq, Eq, Hash, Debug)]
pub struct Game {
    pub board: Board,
    pub turn: Turn
}

impl Game {
    pub fn is_movable_at(&self, pos: Pos) -> bool {
        self.board.is_movable_at(self.turn, pos)
    }
    pub fn is_movable(&self) -> bool {
        self.board.is_movable(self.turn)
    }
    pub fn is_gameover(&self) -> bool {
        self.board.is_gameover()
    }
    pub fn move_at(&self, pos: Pos) -> Self {
        Game {
            board: self.board.move_at(self.turn, pos),
            turn: self.turn.opponent()
        }
    }
    pub fn pass(&self) -> Self {
        assert!(!self.is_movable(), "Cannot pass");
        Game {
            board: self.board.clone(),
            turn: self.turn.opponent()
        }
    }
    pub fn play(&self, play: Play) -> Self {
        match play {
            Play::Pass => self.pass(),
            Play::Move(pos) => self.move_at(pos),
            Play::Invalid => {
                panic!("Invalid move");
            }
        }
    }
    pub fn nexts(&self) -> impl Iterator<Item=(Game, Play)> + '_ {
        self.board.nexts(self.turn).map(move |x| (Game { board: x.0, turn: self.turn.opponent() }, x.1))
    }
    pub fn current_score(&self) -> isize {
        if self.turn == Turn::First {
            self.board.current_score()
        } else {
            -self.board.current_score()
        }
    }
}

impl Default for Game {
    fn default() -> Self {
        Game {
            board: Default::default(),
            turn: Turn::First
        }
    }
}

impl fmt::Display for Game {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}\n{}", self.turn, self.board)
    }
}
