
import Phaser from 'phaser';
import { GAME_BG_COLOR } from './game/utils/consts';
import SceneKeys from './game/utils/SceneKeys';
import GameOverScene from './scenes/GameOver';
import MainBoardScene from './scenes/MainBoard';
import Preloader from './scenes/Preloader';
import PromotionScene from './scenes/Promotion';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 700,
  height: 700,
  backgroundColor: GAME_BG_COLOR,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0,
      }
    }
  },
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH
  },
};

const chessGame = new Phaser.Game(config);

// SCENES
chessGame.scene.add(SceneKeys.Preloader, Preloader);
chessGame.scene.add(SceneKeys.MainBoard, MainBoardScene);
chessGame.scene.add(SceneKeys.Promotion, PromotionScene);
chessGame.scene.add(SceneKeys.GameOver, GameOverScene);

chessGame.scene.start(SceneKeys.Preloader);

export default chessGame;
