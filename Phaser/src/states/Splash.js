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
    this.load.image('house', 'assets/images/bush.png');
    this.load.image('grass', 'assets/images/Grass1.png');
    this.load.image('flowers', 'assets/images/Grass1d.png');
    this.load.image('stump', 'assets/images/Grass1a.png');
    this.load.spritesheet('water1', 'assets/images/WaterAnim3.png', 32,  32);
    this.load.spritesheet('water2', 'assets/images/WaterAnim2.png', 32,  32);
    this.load.image('fly', 'assets/images/fly.png');
    this.load.spritesheet('chameleon', 'assets/images/chameleon.png', 128,128, 2);
  }

  create () {
    this.state.start('Game')
  }
}
