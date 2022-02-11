import { Square } from 'chess.js';
import { isNaN, toNumber, parseInt } from 'lodash';
import ChessPiece, { Piece } from "./Piece";
import { chessColumns, ONE, SQUARES_IN_WIDTH, TWO, ZERO } from "./utils/consts";

interface chessBoardSquare {
  positionNumber: number;
  positionName: Square;
  rectangle: Phaser.GameObjects.Rectangle;
  piece?: ChessPiece;
}

export default class ChessBoard extends Phaser.GameObjects.Container {
  private fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  private board: chessBoardSquare[] = [];
  private blackColor = 0x6666ff;
  private blackColorHex = '#6666FF';
  private whiteColor = 0xE8E8FF;
  private whiteColorHex = '#E8E8FF';
  private fontSize = '15px';
  private possibleMovementCircleColor = 0x0A3E5C;
  private possibleMovementCircleSize = 0.35;
  private possibleMovements: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, startingFen?: string) {
    super(scene, x, y);
    
    const chessboardOffset = 133;
    const canvasWidth = scene.game.canvas.width;
    this.width = (canvasWidth - chessboardOffset);
    this.height = (canvasWidth - chessboardOffset);
    const squareSize = this.width / SQUARES_IN_WIDTH;
    let mutableSquareColorCounter = ONE;
    const chessSquares: Phaser.GameObjects.GameObject[] = [];
    
    // BOARD CREATION
    for (let numberRow = ZERO; numberRow < SQUARES_IN_WIDTH; numberRow++) {
      for (let letterColumn = ZERO; letterColumn < SQUARES_IN_WIDTH; letterColumn++) {
        mutableSquareColorCounter *= -ONE;
        const squareColor = (mutableSquareColorCounter < ZERO)? this.whiteColor : this.blackColor;
        const xCoord = letterColumn * squareSize;
        const yCoord = numberRow * squareSize;
        const rect = scene.add.rectangle(
          xCoord,
          yCoord,
          squareSize,
          squareSize,
          squareColor,
        );
        rect.setOrigin(ZERO, ZERO);
        scene.physics.world.enable(rect);
        this.board.push({
          positionName: `${chessColumns[letterColumn]}${SQUARES_IN_WIDTH - numberRow}` as Square,
          positionNumber: (numberRow * SQUARES_IN_WIDTH) + letterColumn + ONE,
          rectangle: rect,
        });
        
        chessSquares.push(rect);
      }
      mutableSquareColorCounter *= -ONE;
    }

    this.add(chessSquares);
    scene.add.existing(this);
    
    // LABEL THE FILE
    const labelsFontDistance = 7;
    let mutableRowNumber = 8;
    let mutableLabelColorCounter = ONE;
    for (let squareNumber = 0; squareNumber < this.board.length; squareNumber += 8, mutableRowNumber--) {
      const squareTextColor = (mutableLabelColorCounter > ZERO)? this.blackColorHex : this.whiteColorHex;
      mutableLabelColorCounter *= -ONE;
      const rect = this.board[squareNumber].rectangle;
      const labelText = scene.add.text(
        rect.x + labelsFontDistance,
        rect.y + labelsFontDistance,
        `${mutableRowNumber}`,
        { fontSize: this.fontSize, fontFamily: 'Helvetica', color: squareTextColor },
      );
      this.add(labelText);
    }
    
    // LABEL THE RANK
    let mutableColumnNumber = 7;
    const letterLabelOffset = 8;
    mutableLabelColorCounter = ONE;
    for (let squareLetter = this.board.length - ONE; squareLetter > (this.board.length - SQUARES_IN_WIDTH - ONE); squareLetter--, mutableColumnNumber--) {
      const rect = this.board[squareLetter].rectangle;
      const squareTextColor = (mutableLabelColorCounter > ZERO)? this.blackColorHex : this.whiteColorHex;
      mutableLabelColorCounter *= -ONE;

      const labelText = scene.add.text(
        rect.x + squareSize - labelsFontDistance - letterLabelOffset,
        rect.y + squareSize - (labelsFontDistance * TWO) - letterLabelOffset,
        `${chessColumns[mutableColumnNumber]}`,
        { fontSize: this.fontSize, fontFamily: 'Helvetica', color: squareTextColor },
      );
      this.add(labelText);
    }

    // LOAD STARTING PIECES
    this.loadPositionFromFen(startingFen || this.fen);

    const newXposition = (scene.game.canvas.width / TWO) - (this.width / TWO);
    const newYposition = (scene.game.canvas.height / TWO) - (this.height / TWO);
    this.setPosition(newXposition, newYposition);
    // console.log(this.board.map(({
    //   positionName,
    //   positionNumber ,
    //   rectangle,
    // }) => (`
    // {
    //   positionName: ${positionName},
    //   positionNumber: ${positionNumber}, 
    //   rectangle: ${rectangle},
    // }
    // `)).join('\n'));
  }

  getBoard() {
    return this.board;
  }

  getFen() {
    return this.fen;
  }

  setFen(fen: string) {
    this.fen = fen;
  }

  getPossibleMovements() {
    return this.possibleMovements;
  }

  addPossibleMovement(squareRect: Phaser.GameObjects.Rectangle) {
    const offsetPositionX =
      (this.scene.game.canvas.width / TWO) - (this.width / TWO) + (squareRect.width / TWO);
    const offsetPositionY =
      (this.scene.game.canvas.height / TWO) - (this.height / TWO) + (squareRect.width / TWO);
    
    const possibleMovementCircle = this.scene.add.circle(
      squareRect.x + offsetPositionX,
      squareRect.y + offsetPositionY,
      squareRect.width * 0.2,
      this.possibleMovementCircleColor,
      this.possibleMovementCircleSize,
    )
    this.possibleMovements.push(possibleMovementCircle);
  }

  setPossibleMovements(possibleMovements: Phaser.GameObjects.Arc[]) {
    this.possibleMovements = possibleMovements;
  }

  destroyPossibleMovements() {
    this.possibleMovements.forEach( movement => movement.destroy());
    this.possibleMovements = [];
  }


  loadPositionFromFen(fen: string) {
    const fenBoard = fen.split(' ').shift();

    if (!fenBoard) {
      return;
    }

    let mutableFile = 0;
    let mutableRank = 0;
    
    for (let i = 0; i < fenBoard.length; i++) {
      const symbol = fenBoard[i];
      
      if (symbol === '/') {
        mutableFile = 0;
        mutableRank++;
      } else {
        if (!isNaN(toNumber(symbol))) {
          mutableFile += toNumber(symbol);
        } else {
          const pieceColor = (symbol === symbol.toUpperCase()) ? Piece.White : Piece.Black;
          const pieceType = ChessPiece.pieceTypeFromSymbol(symbol);
          const SQUARES_IN_CHESS = 8;
          const chessBoardSquare = this.board[mutableRank * SQUARES_IN_CHESS + mutableFile];
          chessBoardSquare.piece = new ChessPiece(pieceColor | pieceType, chessBoardSquare.positionName, chessBoardSquare.rectangle, this.scene);
          this.add(chessBoardSquare.piece);
          mutableFile++;
        }
      }
    }
  }

  removePieceFromCurrentPosition(piece: ChessPiece) {
    const currentPositionName = piece.getPositionInBoard()! as string;
    
    const currentPositionNumber = ((SQUARES_IN_WIDTH - parseInt(currentPositionName[ONE])) * SQUARES_IN_WIDTH) + (chessColumns.indexOf(currentPositionName[ZERO]) + ONE);
    this.board[currentPositionNumber - ONE].piece = undefined;
  }

  processEnPassant(chessPiece: ChessPiece, targetSquarePositionNumber: number) {
    const isWhitePiece = ChessPiece.isColour(chessPiece.getChessPiece(), Piece.White);
    const enPassantSquareNumber = (isWhitePiece)? targetSquarePositionNumber + SQUARES_IN_WIDTH - ONE : targetSquarePositionNumber - SQUARES_IN_WIDTH - ONE;
    const oppositePiece = (isWhitePiece)? (Piece.Black | Piece.Pawn) : (Piece.White | Piece.Pawn); 
    const enPassantSquare = this.board[enPassantSquareNumber];
    const enPassantPiece = enPassantSquare.piece
    if (enPassantPiece?.getChessPiece() === oppositePiece) {
      enPassantSquare.piece?.destroy();
      this.removePieceFromCurrentPosition(enPassantPiece);
    }
  }
}
