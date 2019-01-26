import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset, baseSpeed }) {
    super(game, x, y, asset);
    this.anchor.setTo(0.5);
    this.speed = baseSpeed;
   	game.physics.arcade.enable(this);
  }

  update () {
  	if(this.inputList != null && this.inputList.length > 0){
	  	var input = this.inputList.pop();
	  	if (input == null){ return; }

	    if(input.direction == "right"){
	    	this.body.velocity.add(this.speed, 0);
	    }
	    if(input.direction == "left"){
	    	this.body.velocity.add(-1*this.speed, 0);
	    }
	    if(input.direction == "up"){
	    	this.body.velocity.add(0, -1*this.speed);
	    }
	    if(input.direction == "down"){
	    	this.body.velocity.add(0, this.speed);
	    }
  	}
  	else{
  		this.body.velocity.set(0,0);
  	}


  }

  setInputList(inputList){
  	this.inputList = inputList;
  	console.log(this.inputList);
  }

  appendInputList(inputList){
  	this.inputList.push(inputList);
	}
}
