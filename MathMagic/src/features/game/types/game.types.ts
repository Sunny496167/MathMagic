export type GameState = 'idle' | 'playing' | 'gameover';

export interface GameSessionState {
  gameState: GameState;
  score: number;
  timeLeft: number;
  question: string;
  correctAnswer: number;
  userAnswer: string;
  shake: boolean;
}
