import Phaser from 'phaser'

Number.prototype.clamp = function(min, max){
  return Math.min(Math.max(this, min), max);
};


export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset, baseSpeed }) {
    super(game, x, y, asset);
    this.anchor.setTo(0.5);
    this.speed = baseSpeed;
   	game.physics.arcade.enable(this);
		this.shrinkCollision(90, 110);
		this.paused = false;
		this.collideEnabled = true;
    this.walkSound = game.add.audio("walk");
    this.walkSound.loop = false;
    this.inputClamp = 100
  }

  create(){
    
  }
  update (){
    if (!this.paused) {
      if (this.game.inputQueue != null && this.game.inputQueue.length > 0) {
        var input = this.game.inputQueue.shift();
        if (input == null) {
        } else {

          this.body.velocity.add(input.right * this.speed, 0);
          this.body.velocity.add(input.left * this.speed * -1, 0);
          this.body.velocity.add(0,input.up * this.speed* -1);
          this.body.velocity.add(0,input.down * this.speed );

        }
      }
       if(this.body.velocity.x >0 ){
          this.scale.x = 1;
       }
       if(this.body.velocity.x < 0){
          this.scale.x = -1;
       }

     this.body.velocity.set(this.body.velocity.x.clamp(-this.inputClamp, this.inputClamp), this.body.velocity.y.clamp(-this.inputClamp, this.inputClamp))

      if (this.body.velocity) {
        this.body.velocity.set(this.body.velocity.x * .95, this.body.velocity.y * .95);
      }
      if (this.walkSound){
        if(this.body.velocity.x > 2 || this.body.velocity.y > 2 || this.body.velocity.x < -2 || this.body.velocity.y < -2){
          if(!this.walkSound.isPlaying){
            this.walkSound.play();
          }
        }
        else{
          if(this.walkSound.isPlaying){
            this.walkSound.stop();
          }
        }
      }
      
    }
  }


  setInputList(inputList) {
    this.inputList = inputList;
  }

  pause(){
    this.paused = true;
  }

  unpause(){
    this.setInputList([]);
    this.pause = false;
  }

  shrinkCollision(x, y){
    this.body.setSize(this.body.width - x, this.body.height - y, x/2, y/2 + 15)
  }

  stopAllMovement(){
    this.body.velocity.set(0,0);
    this.pause();
  }

  appendInputList(inputList){
  	this.inputList.push(inputList);
	}

	disableCollision(){
    this.collideEnabled = false;
  }

  enabledCollision(){
    this.collideEnabled = true;
  }
}
