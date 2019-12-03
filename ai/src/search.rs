use crate::board::*;
use crate::eval::*;
use std::cell::Cell;

pub struct Search<'a, T: Evaluator> {
    pub evaluator: &'a T,
    pub count: Cell<usize>
}

impl<T: Evaluator> Search<'_, T> {
    fn search(&self, game: &Game, alpha: i16, beta: i16, passed: bool, depth: isize) -> i16 {
        self.count.set(self.count.get() + 1);
        if depth <= 0 {
            return self.evaluator.eval(game);
        }
        let mut current_alpha = alpha;
        let mut current_max = -T::EVAL_MAX-1;
        for (next, play) in game.nexts() {
            let pass = play == Play::Pass;
            if pass && passed {
                return self.evaluator.eval(game);
            }
            let val = -self.search(&next, -beta, -current_alpha, pass, depth-1);
            if val > current_max {
                current_max = val;
                if val > current_alpha {
                    current_alpha = val;
                    if val >= beta {
                        return val;
                    }
                }
            }
        }
        current_max
    }
    pub fn search_root(&self, game: &Game, alpha: i16, beta: i16, passed: bool, depth: isize) -> (Play, i16) {
        self.count.set(self.count.get() + 1);
        if depth <= 0 {
            return (Play::Invalid, self.evaluator.eval(game));
        }
        let mut current_alpha = alpha;
        let mut current_max = -T::EVAL_MAX-1;
        let mut current_play = Play::Invalid;
        for (next, play) in game.nexts() {
            let pass = play == Play::Pass;
            if pass && passed {
                return (Play::Pass, self.evaluator.eval(game));
            }
            let val = -self.search(&next, -beta, -current_alpha, pass, depth-1);
            if val > current_max {
                current_max = val;
                current_play = play;
                if val > current_alpha {
                    current_alpha = val;
                    if val >= beta {
                        return (play, val);
                    }
                }
            }
        }
        (current_play, current_max)
    }
}
