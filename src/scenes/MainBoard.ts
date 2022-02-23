import { Chess, ChessInstance, Square } from 'chess.js';
import ChessBoard from "../game/ChessBoard";
import { PromotionOptionSelected, PromotionParams } from '../game/interfaces';
import ChessPiece from '../game/Piece';
import { ONE, POSSIBLE_MOVE_BORDER_COLOR, POSSIBLE_MOVE_BORDER_LINE_WIDTH, SQUARE_TO_MOVE_COLOR, THREE, TWO, ZERO } from '../game/utils/consts';
import SceneKeys from '../game/utils/SceneKeys';

export default class MainBoardScene extends Phaser.Scene {
  private chessBoard!: ChessBoard;
  private chessGame: ChessInstance = new Chess();

  private originSquareColor!: number;

  preload() {}

  create() {
    // Promotion FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,'rnbq2nr/ppppkPpp/3b4/8/8/3B3N/PPPPKpPP/RNBQ3R b - - 1 8');
    // this.chessGame = new Chess('rnbq2nr/ppppkPpp/3b4/8/8/3B3N/PPPPKpPP/RNBQ3R b - - 1 8');
    // CheckMate FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    // this.chessGame = new Chess('rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3');

    // PRE- CheckMate FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,'rnb1kbnr/pppp1ppp/8/4p2q/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 2');
    // this.chessGame = new Chess('rnb1kbnr/pppp1ppp/8/4p2q/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 2');

    // Stalemate FEN
    this.chessBoard = new ChessBoard(this, 0, 0,'4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');
    this.chessGame = new Chess('4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');

    // DRAW FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,);
    // this.chessGame = new Chess();

    //threefold repetition FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,);
    // this.chessGame = new Chess();

    // Insufficient Material FEN
    // this.chessBoard = new ChessBoard(this, 0, 0,);
    // this.chessGame = new Chess();

    // Starter FEN
    // this.chessBoard = new ChessBoard(this, 0, 0);
    // this.chessGame = new Chess(this.chessBoard.getFen());

    //  The pointer has to move 16 pixels before it's considered as a drag
    this.input.dragDistanceThreshold = 16;
    
    this.input.on('dragstart', this.startDrag, this);
    this.input.on('drag', this.doDrag, this);
    this.input.on('dragend', this.stopDrag, this);

    // Rectangles behavior when a piece is being dragged
    this.input.on('dragenter', this.onPieceDragEnter, this);
    this.input.on('dragleave', this.onPieceDragLeave, this);
    this.input.on('drop', this.onPieceDrop, this);

    // Promotion behavior
    this.events.on('resume', this.finishPromotionMove, this);

    // Check if the game is already over
    this.checkGameOver();
  }

  update() {}

  checkGameOver() {
    // Returns true if the game has ended via checkmate, stalemate, draw, threefold repetition, or insufficient material. Otherwise, returns false.
    if (this.chessGame.game_over()) {
      console.log('GAME OVER');
      console.log(this.chessGame.history());
      const isCheckmate = this.chessGame.in_checkmate();
      const isStalemate = this.chessGame.in_stalemate();
      const isDraw = this.chessGame.in_draw();
      const isThreefoldRepetition = this.chessGame.in_threefold_repetition();
      const isInsufficientMaterial = this.chessGame.insufficient_material();
      if(isCheckmate) {
        console.log('Reason: isCheckmate');
        return;
      }
      if(isStalemate) {
        console.log('Reason: Stalemate');
        return;
      }
      if(isDraw) {
        console.log('Reason: Draw');
        return;
      }
      if(isThreefoldRepetition) {
        console.log('Reason: ThreefoldRepetition');
        return;
      }
      if(isInsufficientMaterial) {
        console.log('Reason: InsufficientMaterial');
        return;
      }
    }
  }

  startDrag(_pointer: Phaser.Input.Pointer, dragablePiece: ChessPiece) {
    this.children.bringToTop(dragablePiece);
    const moves = this.chessGame.moves({ square: dragablePiece.getPositionInBoard(), verbose: true });
    const possibleMoves: Set<Square> = new Set();
    moves.map( move => possibleMoves.add(move.to));
    const currentBoard = this.chessBoard.getBoard();

    // Change the color of the origin Square to highlight it in the board
    const positionNumber = ChessBoard.getSquareNumberInBoard(dragablePiece.getPositionInBoard());
    this.originSquareColor = currentBoard[positionNumber].rectangle.fillColor;
    currentBoard[positionNumber].rectangle.setFillStyle(SQUARE_TO_MOVE_COLOR);

    currentBoard.forEach( square => {
      if (possibleMoves.has(square.positionName)) {
        const squareRect = square.rectangle;
        squareRect.setInteractive();
        squareRect.input.dropZone = true;
        this.chessBoard.addPossibleMovement(squareRect);
      }
    });
  }

  doDrag(_pointer: Phaser.Input.Pointer, dragablePiece: ChessPiece, posX: number, posY: number) {
    const chessBoardXOffset = (this.game.canvas.width - this.chessBoard.width) / TWO;
    const chessBoardYOffset = (this.game.canvas.height - this.chessBoard.height) / TWO;
    const chessBoardXhBound = this.chessBoard.x + this.chessBoard.width;
    const chessBoardYBound = this.chessBoard.y + this.chessBoard.height;
    if ((posX >= this.chessBoard.x - chessBoardXOffset) && (posX <= chessBoardXhBound - chessBoardXOffset)) {
      dragablePiece.x = posX;
    }
    if ((posY >= this.chessBoard.y - chessBoardYOffset) && (posY <= chessBoardYBound - chessBoardYOffset)) {
      dragablePiece.y = posY;
    }
  }

  stopDrag(_pointer: Phaser.Input.Pointer, dragablePiece: ChessPiece, dropped: boolean) {
    if (!dropped)
    {
      dragablePiece.x = dragablePiece.input.dragStartX;
      dragablePiece.y = dragablePiece.input.dragStartY;

      // Change back the color of the origin Square
      const currentBoard = this.chessBoard.getBoard();
      const positionNumber = ChessBoard.getSquareNumberInBoard(dragablePiece.getPositionInBoard());
      currentBoard[positionNumber].rectangle.setFillStyle(this.originSquareColor);
      this.originSquareColor = 0;
    }
    this.chessBoard.destroyPossibleMovements();
    const moves = this.chessGame.moves({ square: dragablePiece.getPositionInBoard(), verbose: true });
    const possibleMoves: Set<Square> = new Set();
    moves.map( move => possibleMoves.add(move.to));
    const currentBoard = this.chessBoard.getBoard();
    currentBoard.forEach( square => {
      if (possibleMoves.has(square.positionName)) {
        square.rectangle.input.enabled = false;
        square.rectangle.setStrokeStyle(ZERO);
      }
    })
  }

  onPieceDragEnter(_pointer: Phaser.Input.Pointer, _dragablePiece: ChessPiece, rectangle: Phaser.GameObjects.Rectangle) {
    if (rectangle.input.enabled) {
      rectangle.setStrokeStyle(POSSIBLE_MOVE_BORDER_LINE_WIDTH, POSSIBLE_MOVE_BORDER_COLOR);
      // rectangle.setFillStyle(SQUARE_TO_MOVE_COLOR);
    }

  }

  onPieceDragLeave(_pointer: Phaser.Input.Pointer, _dragablePiece: ChessPiece, rectangle: Phaser.GameObjects.Rectangle) {
    if (rectangle.input.enabled) {
      rectangle.setStrokeStyle(ZERO);
    }
  }

  onPieceDrop(_pointer: Phaser.Input.Pointer, dragablePiece: ChessPiece, rectangle: Phaser.GameObjects.Rectangle) {
    const offsetPositionX = rectangle.width / TWO;
    const offsetPositionY = rectangle.width / TWO;
    dragablePiece.x = rectangle.x + offsetPositionX;
    dragablePiece.y = rectangle.y + offsetPositionY;

    const currentBoard = this.chessBoard.getBoard();
    
    // Change back the color of the origin Square
    const positionNumber = ChessBoard.getSquareNumberInBoard(dragablePiece.getPositionInBoard());
    currentBoard[positionNumber].rectangle.setFillStyle(this.originSquareColor);
    this.originSquareColor = 0;

    const verboseMoves = this.chessGame.moves({ square: dragablePiece.getPositionInBoard(), verbose: true });
    const sansMoves = this.chessGame.moves({ square: dragablePiece.getPositionInBoard() });
    const possibleSquaresToMove: Set<Square> = new Set();
    verboseMoves.map( move => possibleSquaresToMove.add(move.to));
    this.chessBoard.destroyPossibleMovements();

    const pieceToMove = ChessPiece.pieceTypeFromNumber(ChessPiece.pieceType(dragablePiece.getChessPiece()));

    currentBoard.forEach( square => {
      // Remove possible movement circles
      if (possibleSquaresToMove.has(square.positionName)) {
        square.rectangle.input.enabled = false;
        square.rectangle.setStrokeStyle(ZERO);
      }


      if ((rectangle.x === square.rectangle.x) && (rectangle.y === square.rectangle.y)) {
        let mutableFinalMove: string = '';
        if (pieceToMove === '') {
          const mutableMoves: string[] = sansMoves.filter((move) => move.includes(square.positionName));
          if (mutableMoves.length === ONE) {
            mutableFinalMove = mutableMoves.pop()!;
          } else {
            // Is it a promotion?
            const promotionParams: PromotionParams = {
              rectangle: square.rectangle,
              pieceColor: dragablePiece.getColour(),
              origin: dragablePiece.getPositionInBoard(),
              target: square.positionName,
              offset: {
                x: (this.game.canvas.width - this.chessBoard.width) /TWO,
                y: (this.game.canvas.height - this.chessBoard.height) /TWO,
              }
            }
            this.game.scene.pause(SceneKeys.MainBoard);
            this.game.scene.start(
              SceneKeys.Promotion,
              promotionParams
            );
            dragablePiece.x = dragablePiece.input.dragStartX;
            dragablePiece.y = dragablePiece.input.dragStartY;
            return;
          }

          if (square.piece) {
            square.piece.destroy();
          } else if ((!square.piece) && (mutableFinalMove.includes('x'))) {
            // Is it an en-passant?
            this.chessBoard.processEnPassant(dragablePiece, square.positionNumber);
          }
        } else {
          if (square.piece) {
            square.piece.destroy();
          }

          const mutableMoves: string[] = sansMoves.filter((move) => move.includes(square.positionName));
          if (mutableMoves.length === ONE) {
            mutableFinalMove = mutableMoves.pop()!;
          } else if (mutableMoves.length < ONE) {
            // Calculate possible castling O-O
            if (pieceToMove === 'K' && (square.positionName == 'g1' || square.positionName == 'g8')) {
              // Set the movement to king side castling
              mutableFinalMove = 'O-O';
              // Rook is +ONE position from the square we want to move the King
              const rook = currentBoard[square.positionNumber].piece!;
              // Change Rook's position
              this.chessBoard.removePieceFromCurrentPosition(rook);
              // Get the squares beside the king
              const squareLeftFromKing = currentBoard[square.positionNumber- TWO];
              // Move rook to king's left
              squareLeftFromKing.piece = rook;
              rook.setPositionInBoard(squareLeftFromKing.positionName);
              // Move Sprite to kings left
              rook.x = squareLeftFromKing.rectangle.x + offsetPositionX;
              rook.y = squareLeftFromKing.rectangle.y + offsetPositionY;

              
              // Calculate possible castling O-O-O
            } else if (pieceToMove === 'K' && (square.positionName == 'c1' || square.positionName == 'c8')) {
              // Set the movement to queen side castling
              mutableFinalMove = 'O-O-O';
              // Rook is -ONE position from the square we want to move the King
              const rook = currentBoard[square.positionNumber - THREE].piece!;
              // Change Rook's position
              this.chessBoard.removePieceFromCurrentPosition(rook);
              // Get the squares beside the king
              const squareRightFromKing = currentBoard[square.positionNumber];
              // Move rook to king's right
              squareRightFromKing.piece = rook;
              rook.setPositionInBoard(squareRightFromKing.positionName);
              // Move Sprite to kings right
              rook.x = squareRightFromKing.rectangle.x + offsetPositionX;
              rook.y = squareRightFromKing.rectangle.y + offsetPositionY;
            }
          }
        }
        
        // Remove piece from current position
        this.chessBoard.removePieceFromCurrentPosition(dragablePiece);
        
        // Set the new position of the piece
        square.piece = dragablePiece;
        square.piece.setPositionInBoard(square.positionName);
        
        this.chessGame.move(mutableFinalMove);
        this.chessBoard.setFen(this.chessGame.fen());
        console.log(`The chess lib FEN: ${this.chessGame.fen()}`);

        // Check if the game is over
        this.checkGameOver();
      }

    })
  }

  finishPromotionMove(_scene: Phaser.Scene, promotionData: PromotionOptionSelected) {
    const currentBoard = this.chessBoard.getBoard();
    const { origin, target, pieceColor, pieceName } = promotionData;
    const sansMoves = this.chessGame.moves({ square: origin });
    if (pieceName === 'close') {
      return;
    }
    const promotionFor = pieceName[ZERO]?.toUpperCase();
    const pieceType = ChessPiece.pieceTypeFromSymbol(promotionFor);
    const originIndex = ChessBoard.getSquareNumberInBoard(origin);
    const targetIndex = ChessBoard.getSquareNumberInBoard(target);
    const originSquare = currentBoard[originIndex];
    const targetSquare = currentBoard[targetIndex];
    
    let mutableFinalMove = `${target}=${promotionFor}`;
    const possibleMoves = sansMoves.filter((move) => move.indexOf(mutableFinalMove) >= ZERO);
    if(possibleMoves.length > ONE) {
      possibleMoves.sort((pMoveA, pMoveB) => pMoveB.length - pMoveA.length);
      mutableFinalMove = possibleMoves.shift()??mutableFinalMove;
    } else {
      mutableFinalMove = possibleMoves.shift()??mutableFinalMove;
    }
    
    const newChessPiece = new ChessPiece(pieceColor | pieceType, target, targetSquare.rectangle, this);
    
    if (targetSquare.piece) {
      targetSquare.piece.destroy();
    }

    // Remove piece from current position
    originSquare.piece?.destroy();
    this.chessBoard.removePieceFromCurrentPosition(originSquare.piece!);
    
    // Set the new position of the piece
    targetSquare.piece = newChessPiece;
    this.chessBoard.add(targetSquare.piece);
    
    this.chessGame.move(mutableFinalMove);
    this.chessBoard.setFen(this.chessGame.fen());

    // Check if the game is over
    this.checkGameOver();
  }
}