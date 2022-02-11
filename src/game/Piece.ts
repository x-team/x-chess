import { Square } from "chess.js";

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

export default class ChessPiece extends Phaser.GameObjects.Image {

  static typeMask = 0b00111;
  static blackMask = 0b10000;
  static whiteMask = 0b01000;
  static colourMask = this.whiteMask | this.blackMask;

  private chessPiece: number;
  private positionInBoard: Square;

  constructor(piece: number, positionInBoard: Square, squareParent: Phaser.GameObjects.Rectangle, scene: Phaser.Scene) {
    const isPieceColorBlack = ChessPiece.isColour(piece, Piece.Black);
    let mutableImageName = '';
    if (isPieceColorBlack) {
      mutableImageName += 'black_';
    } else {
      mutableImageName += 'white_';
    }

    const foundPiece = Piece[ChessPiece.pieceType(piece)];
    mutableImageName += `${foundPiece.toLowerCase()}.png`;

    const squareCenter = squareParent.width / 2;
    const xPos = squareParent.x;
    const yPos = squareParent.y;
    super(scene, xPos + squareCenter, yPos + squareCenter, 'chess-pieces-atlas', mutableImageName);

    this.chessPiece = piece;
    this.positionInBoard = positionInBoard;
    this.setScale(0.2)
    
    this.setInteractive({ draggable: true })
    scene.add.existing(this);
    scene.input.setDraggable(this);
  }

  static pieceTypeFromSymbol(symbol: string) {
    switch(symbol.toLowerCase()) {
      case 'k':
        return Piece.King;
      case 'p':
        return Piece.Pawn;
      case 'n':
        return Piece.Knight;
      case 'b':
        return Piece.Bishop;
      case 'r':
        return Piece.Rook;
      case 'q':
        return Piece.Queen;
      default:
        return Piece.None
    }
  }

  static pieceTypeFromNumber(pieceType: number) {
    switch(pieceType) {
      case Piece.King:
        return 'K';
      case Piece.Pawn:
        return '';
      case Piece.Knight:
        return 'N';
      case Piece.Bishop:
        return 'B';
      case Piece.Rook:
        return 'R';
      case Piece.Queen:
        return 'Q';
      default:
        return '';
    }
  }

  static isColour (piece: Piece, colour: Piece) {
    return (piece & this.colourMask) === colour;
  }

  static pieceType (piece: Piece) {
    return piece & this.typeMask;
  }

  getChessPiece() {
    return this.chessPiece;
  }
  
  getPositionInBoard() {
    return this.positionInBoard;
  }
  
  setPositionInBoard(positionInBoard: Square) {
    this.positionInBoard = positionInBoard;
  }

}