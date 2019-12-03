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
    const PARITY_PENALTY: i16 = 1250;
}

impl Evaluator for ParityEvaluator {
    const EVAL_MAX: i16 = 100 * MAX_SCORE as i16 + Self::PARITY_PENALTY;
    fn eval(&self, game: &Game) -> i16 {
        let empty_count = game.board.count(Square::Empty);
        let parity_penalty = if (empty_count % 2) == 1 { // odd
            Self::PARITY_PENALTY
        } else if empty_count > 0 { // even, not zero
            -Self::PARITY_PENALTY
        } else { // zero
            0
        } as isize; // komidashi
        (game.current_score() * 100 + parity_penalty) as i16
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
