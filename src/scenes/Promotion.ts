import { Square } from "chess.js";
import { PromotionOptionSelected, PromotionParams } from "../game/interfaces";
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle';
import { Piece, TEXT_COLOR, TWO, ZERO } from "../game/utils/consts";
import SceneKeys from "../game/utils/SceneKeys";

export default class PromotionScene extends Phaser.Scene {
  private pieceColor: Piece.Black | Piece.White = Piece.Black;
  private origin!: Square;
  private target!: Square;

  init(promotionSeed: PromotionParams) {
    const { rectangle: { x, y, width, height }, pieceColor, offset, origin, target } = promotionSeed;
    this.pieceColor = pieceColor;
    this.origin = origin;
    this.target = target;
    const squareColor = 0xF7F7FF;
    const piecesToShow = 4;
    const piecesOptionsHeight =  (width * piecesToShow);
    const sizeInPercentage = 0.08;
    const closeButtonHeight = piecesOptionsHeight * sizeInPercentage;
    const offsetX = (offset?.x??ZERO);
    const offsetY = (offset?.y??ZERO);
    const moveUpOptions = 3;
    const roundedBorderSize = 10;

    // PIECE OPTIONS
    const xPosition = (pieceColor === Piece.White) ? x + offsetX : x + offsetX;
    const yPosition = (pieceColor === Piece.White) ? y + offsetY : y - (moveUpOptions * height) + offsetY;

    const piecesOptionsButton = new RoundRectanglePlugin(
      this,
      xPosition,
      yPosition,
      width,
      piecesOptionsHeight,
      (pieceColor === Piece.White) ?
        {
          tl: roundedBorderSize,
          tr: roundedBorderSize,
          bl: ZERO,
          br: ZERO,
        } :
        {
          tl: ZERO,
          tr: ZERO,
          bl: roundedBorderSize,
          br: roundedBorderSize,
        }
      ,
      squareColor,
    );
    piecesOptionsButton.setOrigin(ZERO, ZERO);
    this.add.existing(piecesOptionsButton);

    // CLOSE BUTTON
    const closeXPosition = xPosition;
    const closeYPosition = (pieceColor === Piece.White) ? yPosition + piecesOptionsButton.height : piecesOptionsButton.y - closeButtonHeight;
    const closeButtonColor = 0xDCDCE3;
    const closeButton = new RoundRectanglePlugin(
      this,
      closeXPosition,
      closeYPosition,
      width,
      closeButtonHeight,
      (pieceColor === Piece.White) ?
        {
          tl: ZERO,
          tr: ZERO,
          bl: roundedBorderSize,
          br: roundedBorderSize,
        } :
        {
          tl: roundedBorderSize,
          tr: roundedBorderSize,
          bl: ZERO,
          br: ZERO,
        }
      ,
      closeButtonColor,
    );
    // closeButton.setDataEnabled();
    closeButton.setData({
      fullName: 'close_button',
      pieceName: 'close',
    })
    closeButton.setOrigin(ZERO, ZERO);
    closeButton.setInteractive();;
    this.add.existing(closeButton);

    // X CLOSE "BUTTON"
    const originAt = 0.5;
    this.add.text(
      closeButton.x + (closeButton.width / TWO), 
      closeButton.y + (closeButton.height / TWO), 
      'x', 
      { fontFamily: 'Helvetica', fontSize: '.8rem', color: TEXT_COLOR },
    )
    .setOrigin(originAt, originAt);

    const pieceColorName = (this.pieceColor === Piece.Black) ? 'black_' : 'white_' ;
    const promotionPiecesNames = [
      'queen',
      'knight',
      'rook',
      'bishop',
    ];
    promotionPiecesNames.forEach((pieceName, i) => {
      const squareCenter = width / 2;
      const xPos = piecesOptionsButton.x;
      const yPos = piecesOptionsButton.y + (height * i);
      const promotionPiece = this.add.image(xPos + squareCenter, yPos + squareCenter, 'chess-pieces-atlas', `${pieceColorName}${pieceName}.png`);
      // promotionPiece.setDataEnabled();
      promotionPiece.setData({
        fullName: `${pieceColorName}${pieceName}`,
        pieceName,
      })
      promotionPiece.setScale(0.2)
      promotionPiece.setInteractive();
    });
  }

  create() {
    this.input.on('pointerdown', this.optionSelected, this);
  }

  optionSelected(_pointer: Phaser.Input.Pointer, options: Array<Phaser.GameObjects.Image | RoundRectanglePlugin>) {
    const [optionClicked] = options;
    const promotionOptionPicked: PromotionOptionSelected = {
      fullName: optionClicked.data.get('fullName'),
      pieceName: optionClicked.data.get('pieceName'),
      pieceColor: this.pieceColor,
      origin: this.origin,
      target: this.target,
    }
    this.game.scene.pause(SceneKeys.Promotion);
    this.game.scene.resume(
      SceneKeys.MainBoard,
      promotionOptionPicked
    );
    this.registry.destroy();
    this.events.off('pointerdown');
    this.scene.stop(SceneKeys.Promotion);
  }
}