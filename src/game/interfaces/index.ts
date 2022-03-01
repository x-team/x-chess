import { Square } from "chess.js";
import { Piece } from "../utils/consts";

export interface PromotionParams {
  rectangle: Phaser.GameObjects.Rectangle;
  pieceColor: Piece.Black | Piece.White;
  origin: Square;
  target: Square;
  offset?: {
    x: number;
    y: number;
  }
}

export interface PromotionOptionSelected {
  fullName: string;
  pieceName: string;
  origin: Square;
  target: Square;
  pieceColor: Piece.Black | Piece.White,
}

export interface GameOverParams {
  winner?: 'b' | 'w';
  reason: string;
  chessSquareSize: number;
  gameHistory: string[];
}