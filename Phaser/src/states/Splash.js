import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png');
    this.load.image('house', 'assets/images/House.png');
    
    this.load.spritesheet('water1', 'assets/images/WaterAnim3.png', 32,  32, 2);
    this.load.spritesheet('water2', 'assets/images/WaterAnim2.png', 32,  32, 2);
    this.load.image('fly', 'assets/images/fly.png');

    this.load.audio("music", "assets/sound/ProfessorUmlaut.mp3");
    this.load.audio("slurp", "assets/sound/slurp.ogg");
    this.load.audio("walk", "assets/sound/walk.ogg");

    this.load.spritesheet('chameleon', 'assets/images/chameleon.png', 128,128, 8);

  }

  create () {
    this.state.start('Game')
  }
}
