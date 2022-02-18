import { Piece } from "../utils/consts";

export interface PromotionSeed {
  rectangle: Phaser.GameObjects.Rectangle,
  pieceColor: Piece.Black | Piece.White,
  offset?: {
    x: number,
    y: number,
  }
}