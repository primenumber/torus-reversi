use crate::board::*;

pub trait Evaluator {
    const EVAL_MAX: i16;
    fn eval(&self, game: &Game) -> i16;
}

pub struct SimpleEvaluator;

impl Evaluator for SimpleEvaluator {
    const EVAL_MAX: i16 = 100 * MAX_SCORE as i16;
    fn eval(&self, game: &Game) -> i16 {
        (game.current_score() * 100) as i16
    }
}

pub struct ParityEvaluator;

impl ParityEvaluator {
    const PARITY_PENALTY: i16 = 100 * KOMI as i16 + 50;
}

impl Evaluator for ParityEvaluator {
    const EVAL_MAX: i16 = 100 * MAX_SCORE as i16;
    fn eval(&self, game: &Game) -> i16 {
        if game.is_gameover() {
            return (game.current_score() * 100) as i16;
        }
        let empty_count = game.board.count(Square::Empty);
        let player_count = game.board.count(Square::from(game.turn));
        let opponent_count = game.board.count(Square::from(game.turn.opponent()));
        let parity_penalty = if (empty_count % 2) == 1 { // odd
            Self::PARITY_PENALTY
        } else { // even, not zero
            -Self::PARITY_PENALTY
        } as i16; // komidashi
        let diff = player_count as i16 - opponent_count as i16;
        diff * 200 + parity_penalty
    }
}

use rand_distr::{Distribution, Beta};

pub struct RandomizedEvaluator<T: Evaluator> {
    pub base: T
}

impl<T: Evaluator> Evaluator for RandomizedEvaluator<T> {
    const EVAL_MAX: i16 = T::EVAL_MAX;
    fn eval(&self, game: &Game) -> i16 {
        let mut rng = rand::thread_rng();
        let base_score = self.base.eval(game) as f32;
        let max_float = Self::EVAL_MAX as f32;
        let range = 2.0 * max_float;
        let coeff = 50.0;
        let percentage = ((base_score + max_float) / range).clamp(0.01, 0.99);
        let dis = Beta::new(coeff * percentage, coeff * (1.0 - percentage)).unwrap();
        (dis.sample(&mut rng) * range - max_float) as i16
    }
}
