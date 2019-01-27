/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import averagedPlayerController from '../sprites/averagedPlayerController.js'

export default class extends Phaser.State {
  

  testWebSocket()
  {
    this.websocket = new WebSocket("ws://tpg45.herokuapp.com/game_receive");
    this.websocket.addEventListener('open', function (event) {
      console.log("connected");
    });
    this.websocket.addEventListener('message', function (event) {
      console.log("event recieved");
      console.log('Message from server ' + event.data);
      var control = JSON.parse(event.data);

      if(!Array.isArray(control)){
         control = [control];
      }
      for(var i = 0; i < control.length; i++){
        obj = control[i];
        this.inputQueue.push(obj);
        this.averagedPlayerController.setInputList(this.inputQueue);
      }

    });

  }

  init() { }
  

  preload() { 
       this.output;
    }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.devMode = true;
    this.playerStartX = this.world.centerX;
    this.playerStartY = this.world.centerY
    if(this.devMode){
      this.cursors = game.input.keyboard.createCursorKeys();
    }
    this.inputQueue = []
    console.log(this);
    this.averagedPlayerController = new averagedPlayerController({
      game: this.game,
      x: this.playerStartX,
      y: this.playerStartY,
      asset: 'mushroom',
      baseSpeed: 10
    });

    this.placeWaterTiles();

    this.game.add.existing(this.waterGroup);
    this.game.add.existing(this.averagedPlayerController);

    this.game.physics.arcade.enable([this.averagedPlayerController, this.waterGroup]);
    this.testWebSocket();
    this.gameOverTween = this.setupTweens();
  }

  update(){
    if(this.devMode){
      var obj;
      if(this.cursors.right.isDown){

        obj = {
          "direction":"right"
        }
      }
       if(this.cursors.left.isDown){

        obj = {
          "direction":"left"
        }
      }
      
      if(this.cursors.down.isDown){

        obj = {
          "direction":"down"
        }
      }
      if(this.cursors.up.isDown)

        obj = {
          "direction":"up"
        }
      }
      this.inputQueue.push(obj);
      this.averagedPlayerController.setInputList(this.inputQueue);

    // Collision Detection
    game.physics.arcade.overlap(
      this.averagedPlayerController,
      this.waterGroup,
      this.playerWaterCollision,
      null)
  }

  render(){
    game.debug.body(this.averagedPlayerController)
  }

  restartGame(){
    this.restart()
  }

  placeWaterTiles(){
    // ******************************
    //        CREATING WATER TILES
    // EDIT this.waterCoord TO PLACE WATERS
    // ******************************
    this.waterGroup = game.add.physicsGroup();
    this.waterCoord = [[300, 300], [50, 50], [0, 0]]

    for (var i = 0; i < this.waterCoord.length; i++)
    {
      var c = this.waterGroup.create(this.waterCoord[i][0], this.waterCoord[i][1], 'water', 0)
      c.scale.setTo(1, 1);
    }
    // ******************************
  }

  playerWaterCollision(playerSprite, water){
    console.log("Water collision.");
    // WTF, do we really have to do this?
    playerSprite.stopAllMovement();
    var stateManager = playerSprite.game.state;
    var currentStateName = stateManager.current;
    var currentState = stateManager.states[currentStateName];
    currentState.gameOver();
  }

  gameOver(){
    this.gameOverTween.start();
  }

  gameOverComplete(){
    // this.inputQueue = [];
    // console.log(this.averagedPlayerController);
    // this.averagedPlayerController.x = this.playerStartX;
    // this.averagedPlayerController.y = this.playerStartY;
    // this.averagedPlayerController.unpause();
    console.log(this);
    this.state.start(this.state.current);
  }

  setupTweens(){
    var text = this.add.text(
      this.game.world.centerX, -10,
      "Game Over!"
    );
    text.anchor.set(0.5);
    var w = this.game.world.centerX;
    var h = this.game.world.centerX;
    var gameOverTween = game.add.tween(text).to( { x: w, y: h }, 1000, "Sine.easeInOut", false, 0, 0);
    gameOverTween.onComplete.add(this.gameOverComplete, this)
    return gameOverTween
  }

  //   function init()
  // {
  //   output = document.getElementById("output");
  //   testWebSocket();
  // }

  

}
