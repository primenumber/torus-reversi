#![feature(clamp)]
mod board;
mod eval;
mod search;

use crate::board::*;
use crate::eval::*;
use crate::search::*;
use std::cell::Cell;
use rayon::prelude::*;

fn play_to_end<T: Evaluator>(search: &Search<T>, game: &Game) -> isize {
    let mut current_game = game.clone();
    let mut passed = false;
    while !current_game.is_gameover() {
        let empty_count = current_game.board.count(Square::Empty);
        let depth = if empty_count > 14 {
            4
        } else if empty_count > 8 {
            6
        } else {
            8
        };
        let play = search.search_root(&current_game, -T::EVAL_MAX, T::EVAL_MAX, passed, depth).0;
        assert!(play != Play::Invalid, "Invalid play");
        current_game = current_game.play(play);
        passed = play == Play::Pass;
    }
    current_game.board.current_score()
}

fn main() {
    let initial: Game = Default::default();
    let repeat = 10000;
    let sum: isize = (0..repeat).into_par_iter().map(|_i| {
        type BaseEvalType = ParityEvaluator;
        let base_eval = BaseEvalType{};
        let evaluator = RandomizedEvaluator::<BaseEvalType> { base: base_eval };
        let search = Search::<RandomizedEvaluator::<BaseEvalType>> { evaluator: &evaluator, count: Cell::new(0) };
        play_to_end(&search, &initial)
    }).sum();
    println!("average: {}", sum as f64 / (repeat as f64));
}
