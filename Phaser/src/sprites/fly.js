import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset, x_mov, y_mov }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.center_x = x
    this.center_y = y
    this.x_mov = x_mov
    this.y_mov = y_mov
    var sincosdata = game.math.sinCosGenerator(200, 1, 1, 2);
    this.sindata = sincosdata.sin;
    this.count = 0;
  }

  update () {
    this.count = (this.count + 1) % 200;
    this.x = this.center_x + this.x_mov * this.sindata[this.count];
    this.y = this.center_y + this.y_mov * this.sindata[this.count];
  }
}
