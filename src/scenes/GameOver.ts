import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle';
import { ScrollablePanel, FixWidthSizer, Label } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { GameOverParams } from "../game/interfaces";
import { BLACK_SQUARE_COLOR, TWO, WHITE_SQUARE_COLOR, ZERO } from "../game/utils/consts";

const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class GameOverScene extends Phaser.Scene {
  private cardCointainer!: Phaser.GameObjects.Container;
  private messageCointainer!: Phaser.GameObjects.Container;

  init(params: GameOverParams) {
    const cardHeightInBoardSquares = 5;
    const cardWidthInBoardSquares = 4;
    const textOriginAt = 0.5;
    const { winner, reason, chessSquareSize, gameHistory } = params;

    const overlayRect = this.add.rectangle(ZERO, ZERO, this.game.canvas.width, this.game.canvas.height, 0x000000, 0.4);
    overlayRect.setOrigin(ZERO, ZERO);

    this.cardCointainer = new Phaser.GameObjects.Container(
      this,
      this.game.canvas.width / TWO,
      this.game.canvas.height / TWO,
    );
    this.messageCointainer = new Phaser.GameObjects.Container(
      this,
      ZERO,
      -(chessSquareSize * (cardWidthInBoardSquares / TWO)),
      // -(chessSquareSize * cardWidthInBoardSquares),
      // -(chessSquareSize * cardHeightInBoardSquares),
    );
    this.add.existing(this.cardCointainer);
    
    const gameOverCard = new RoundRectanglePlugin(
      this,
      ZERO,
      ZERO,
      chessSquareSize * cardWidthInBoardSquares,
      chessSquareSize * cardHeightInBoardSquares,
      10,
      0x000000,
    );
    gameOverCard.setStrokeStyle(10, 0xFFFFFF);
    this.add.existing(gameOverCard);
    this.cardCointainer.add(gameOverCard);
    
    const gameOverText = this.add.text(
      ZERO,
      15,
      reason,
      { 
        fontFamily: 'Helvetica',
        fontSize: '2.5rem',
        resolution: 2,
        color: '#FFFFFF',
        stroke: '#FFFFFF',
        strokeThickness: 3,
      }
    );
    gameOverText.setOrigin(textOriginAt, textOriginAt);
    this.messageCointainer.add(gameOverText);
    
    if (winner) {
      const winnerText = this.add.text(
        ZERO,
        gameOverText.height,
        (winner === 'b') ?
        'Black for the win' :
        'White for the win',
        { fontFamily: 'Helvetica', fontSize: '.8rem', color: '#FFFFFF', resolution: 2 }
      );
      winnerText.setOrigin(textOriginAt, textOriginAt);
      this.messageCointainer.add(winnerText);
    }

    const historyPanelBG = this.add.existing(new RoundRectanglePlugin(this, 0, 0, 2, 2, 10, 0x56555C));
    const historyPanelTracker = this.add.existing(new RoundRectanglePlugin(this, 0, 0, 20, 10, 10, COLOR_DARK));
    const historyPanelThumb = this.add.existing(new RoundRectanglePlugin(this, 0, 0, 0, 0, 13, COLOR_LIGHT));
    // this.messageCointainer.add(historyPanelBG);
    // this.messageCointainer.add(historyPanelTracker);
    // this.messageCointainer.add(historyPanelThumb);

    const checkmate = gameHistory.shift();
    for (let i = 0; i < 49; i++) { gameHistory.push(`f${i + 1}`) }
    gameHistory.push(checkmate!);

    const sizer = this.createSizer(gameHistory);

    const historyPanelConfig: ScrollablePanel.IConfig = {
      x: 0,
      y: gameOverText.height * 3,
      width: chessSquareSize * 3,
      height: chessSquareSize * 2,

      scrollMode: 0,

      background: historyPanelBG,

      panel: {
          child: sizer,
          mask: {
              padding: 1,
          }
      },

      slider: {
          track: historyPanelTracker,
          thumb: historyPanelThumb,
          // position: 'left'
      },

      mouseWheelScroller: {
          focus: false,
          speed: 0.1
      },
      space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,

          panel: 10,
      }
    };
    const historyPanel = new ScrollablePanel(this, historyPanelConfig);
    historyPanel.layout();
    // this.add.existing(historyPanel);
    // const graphics = this.add.graphics();
    // this.messageCointainer.add(graphics);
    // this.messageCointainer.add(historyPanel.drawBounds(graphics, 0xff0000));
    this.messageCointainer.add(historyPanel);
    this.messageCointainer.add(historyPanelBG);
    this.messageCointainer.add(historyPanelTracker);
    this.messageCointainer.add(historyPanelThumb);
    this.messageCointainer.add(sizer);
    // this.fillSizer(historyPanel, gameHistory);




    // const newGameRect = new RoundRectanglePlugin(
    //   this,
    //   ZERO,
    //   ZERO,
    //   gameOverText.width,
    //   20,
    //   10,
    //   0xFFFFFF,
    // );
    // newGameRect.setOrigin(ZERO, ZERO);
    // this.add.existing(newGameRect);
    // button.add(newGameRect);

    this.cardCointainer.add(this.messageCointainer);
  }
  
  create() {

  }
  
  createSizer (gameHistory: string[]) {
    // const sizerBG = new RoundRectanglePlugin(this, 0, 0, 0, 0, 0, COLOR_DARK);
    // this.add.existing(sizerBG);
    // this.messageCointainer.add(sizerBG);
    const sizer = new FixWidthSizer(
      this,
      {
        space: {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
            item: 8,
            line: 8,
        },
    })
    for (let i = 0; i < gameHistory.length; i+=2) {
      const whiteBG = new RoundRectanglePlugin(this, 0, 0, 0, 0, 5, WHITE_SQUARE_COLOR);
      const blackBG = new RoundRectanglePlugin(this, 0, 0, 0, 0, 5, BLACK_SQUARE_COLOR);
      this.add.existing(whiteBG);
      this.add.existing(blackBG);
      // this.messageCointainer.add(whiteBG);
      // this.messageCointainer.add(blackBG);
      
      const whiteMove = this.add.text(0, 0, `${gameHistory[i]}`,
      {
        fontSize: '.8rem'
      });

      const blackMove = this.add.text(0, 0, `${gameHistory[i + 1]}`,
      {
        fontSize: '.8rem'
      });
      this.add.existing(whiteMove);
      this.add.existing(blackMove);
      // this.messageCointainer.add(whiteMove);
      // this.messageCointainer.add(blackMove);

      const labelOne = new Label(
        this,
        {
          width: 60,
          height: 60,
          background: whiteBG,
          text: whiteMove,
          align: 'center',
          space: {
              left: 10,
              right: 10,
              top: 3,
              bottom: 3,
          }
      });
      const labelTwo = new Label(
        this,
        {
          width: 60,
          height: 60,
          background: blackBG,
          text: blackMove,
          align: 'center',
          space: {
              left: 10,
              right: 10,
              top: 3,
              bottom: 3,
          }
      });
      this.add.existing(labelOne);
      this.add.existing(labelTwo);
      // this.messageCointainer.add(labelOne);
      // this.messageCointainer.add(labelTwo);
      sizer.add(labelOne);
      sizer.add(labelTwo);
    }
    this.add.existing(sizer);
    return sizer;
  }

  fillSizer(panel: ScrollablePanel, gameHistory: string[]) {
    const sizer = panel.getElement('panel') as FixWidthSizer;

    sizer.clear(true);
    // for (let i = 0; i < gameHistory.length; i+=2) {
    //   const whiteBG = new RoundRectanglePlugin(this, 0, 0, 0, 0, 5, WHITE_SQUARE_COLOR);
    //   const blackBG = new RoundRectanglePlugin(this, 0, 0, 0, 0, 5, BLACK_SQUARE_COLOR);
    //   this.add.existing(whiteBG);
    //   this.add.existing(blackBG);
    //   // this.messageCointainer.add(whiteBG);
    //   // this.messageCointainer.add(blackBG);
      
    //   const whiteMove = this.add.text(0, 0, `${gameHistory[i]}`,
    //   {
    //     fontSize: '.8rem'
    //   });

    //   const blackMove = this.add.text(0, 0, `${gameHistory[i + 1]}`,
    //   {
    //     fontSize: '.8rem'
    //   });
    //   this.add.existing(whiteMove);
    //   this.add.existing(blackMove);
    //   // this.messageCointainer.add(whiteMove);
    //   // this.messageCointainer.add(blackMove);

    //   const labelOne = new Label(
    //     this,
    //     {
    //       width: 60,
    //       height: 60,
    //       background: whiteBG,
    //       text: whiteMove,
    //       align: 'center',
    //       space: {
    //           left: 10,
    //           right: 10,
    //           top: 3,
    //           bottom: 3,
    //       }
    //   });
    //   const labelTwo = new Label(
    //     this,
    //     {
    //       width: 60,
    //       height: 60,
    //       background: blackBG,
    //       text: blackMove,
    //       align: 'center',
    //       space: {
    //           left: 10,
    //           right: 10,
    //           top: 3,
    //           bottom: 3,
    //       }
    //   });
    //   this.add.existing(labelOne);
    //   this.add.existing(labelTwo);
    //   // this.messageCointainer.add(labelOne);
    //   // this.messageCointainer.add(labelTwo);
    //   sizer.add(labelOne);
    //   sizer.add(labelTwo);
    // }
  }
}