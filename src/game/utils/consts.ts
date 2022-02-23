// GENERAL GAME
export const GAME_BG_COLOR = 0x848D9A;
export const TEXT_COLOR = '#252D38';

// EXPLICIT NUMBERS
export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const THREE = 3;

// CHESSBOARD
export const SQUARES_IN_WIDTH = 8;
export const POSSIBLE_MOVE_BORDER_LINE_WIDTH = 4;
export const POSSIBLE_MOVE_BORDER_COLOR = 0xFFFEEB;
export const SQUARE_TO_MOVE_COLOR = 0xCBF559;
export const chessColumns = 'abcdefgh';

// CHESS PIECE
export enum Piece {
  None = 0,
  King = 1,
  Pawn = 2,
  Knight = 3,
  Bishop = 4,
  Rook = 5,
  Queen = 6,

  White = 8,
  Black = 16,
}
export const BLACK_SQUARE_COLOR = 0x6666ff;
export const WHITE_SQUARE_COLOR = 0xE8E8FF;