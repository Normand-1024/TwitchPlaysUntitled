import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset, radius }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.center_x = x
    this.center_y = y
    this.center_x_ori = x
    this.center_y_ori = y
    this.player_x = 0
    this.player_y = 0
    var sincosdata = game.math.sinCosGenerator(150, 1, 1, 2);
    this.sindata = sincosdata.sin
    this.cosdata = sincosdata.cos
    this.radius = radius;
    this.count = 0;

    this.alertDist = 200;
    this.evadeSpeed = 0.005;
    this.speed_x = 0;
    this.speed_y = 0;
  }

  update () {
    //console.log(this.x, this.y)
    //var dist = game.math.distanceSq(dist_x, dist_y, this.player_x, this.player_y);
    var dist_x = this.player_x - this.center_x;
    var dist_y = this.player_y - this.center_y;

    if (dist_x * dist_x + dist_y * dist_y < this.alertDist * this.alertDist){
      // Moving away from player
      this.speed_x = - dist_x * this.evadeSpeed;//- this.speed_x + dist_x_u * this.evadeSpeed;
      this.speed_y = - dist_y * this.evadeSpeed;//- this.speed_y + dist_y_u * this.evadeSpeed;

      // Sidestepping the player
      //this.speed_x = this.speed_x - dist_y_u * this.evadeSpeed;
      //this.speed_y = this.speed_y + dist_x_u * this.evadeSpeed;
    }
    else if(this.center_x_ori != this.center_x || this.center_x_ori != this.center_x){
      var diff_x = this.center_x - this.center_x_ori
      var diff_y = this.center_y - this.center_y_ori
      if (diff_x <= 5 || diff_x >= -5){
        this.center_x = this.center_x_ori + diff_x * 0.95
      }
      else {
        this.center_x = this.cetner_x_ori
      }
      if (diff_y <= 5 || diff_y >= -5){
        this.center_y = this.center_y_ori + diff_y * 0.95
      }
      else {
        this.center_y = this.center_y_ori
      }
    }
    else{
      this.speed_x = 0;
      this.speed_y = 0;
    }
    
    this.center_x = this.center_x + this.speed_x;
    this.center_y = this.center_y + this.speed_y;

    this.count = (this.count + 1) % 150;
    this.x = this.center_x + this.radius * this.sindata[this.count];
    this.y = this.center_y + this.radius * this.cosdata[this.count];

  }
}
