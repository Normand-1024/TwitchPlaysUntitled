/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import fly from "../sprites/fly.js"
import lang from '../lang'
import averagedPlayerController from '../sprites/averagedPlayerController.js'

// Global Variables
var flyCount = 0

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
        var obj = control[i];
        console.log("Pushing into input queue " );
        localObj.addRowOfData(obj.name, obj.direction);
        localObj.game.inputQueue.push(obj);
        localObj.averagedPlayerController.setInputList(localObj.game.inputQueue);
      }

    });

  }

  init() { }
  

  preload() { 
       this.output;
    }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //this.flyCount = 0;
    this.devMode = true;
    this.playerStartX = 100;
    this.playerStartY = 300;
    this.baseSpeed = 100;
    this.game.inputQueue = [];
    if(this.devMode){
      this.cursors = game.input.keyboard.createCursorKeys();
    }
    this.inputQueue = []

    this.averagedPlayerController = new averagedPlayerController({
      game: this.game,
      x: this.playerStartX,
      y: this.playerStartY,
      asset: 'chameleon',
      baseSpeed: this.baseSpeed
    })
    var anim = this.averagedPlayerController.animations.add("walk");
    this.averagedPlayerController.animations.play("walk", 5, true);

    this.game.world.setBounds(0,0,5000,800)
    this.game.camera.follow(this.averagedPlayerController, 2);

    // ******************************
    //        CREATING WATER TILES
    // EDIT this.waterCoord TO PLACE WATERS
    // ******************************
    this.waterGroup = game.add.physicsGroup();
<<<<<<< HEAD
    this.waterCoord = [[0,0],[100,0],[200,0],[300,0],[400,0],[500,0],[600,0],[700,0],[800,0],[900,0],[1000,0], [1100, 0], [1200, 0], [1300, 0], [1400, 0], [1500, 0], [1600, 0], [1700, 0], [1800, 0], [1900, 0], [2000, 0], [2100, 0], [2200, 0], [2300, 0], [2400, 0], [2500, 0], [2600, 0], [2700, 0], [2800, 0], [2900, 0], [3000, 0],
    [0,700],[100,700],[200,700],[300,700],[400,700],[500,700],[600,700],[700,700],[800,700],[900,700],[1000,700], [1100, 700], [1200, 700], [1300, 700], [1400, 700], [1500, 700], [1600, 700], [1700, 700], [1800, 700], [1900, 700], [2000, 700], [2100, 700], [2200, 700], [2300, 700], [2400, 700], [2500, 700], [2600, 700], [2700, 700], [2800, 700], [2900, 700], [3000, 700],
    [0,600],
    [100,500],[100,600],
    [200,400],[200,500],[200,600],
    [300,100],[300,400],[300,500],[300,600],
    [400,100],[400,400],[400,500],[400,600],
    [500,100],[500,500],[500,600],
    [600,100],[600,600],[600,200],
    [700,100],[700,200],[700,300],
    [900,600],
    [1000,200],[1000,300],[1000,600],
    [1100,300],[1100,600]]

    for (var i = 0; i < this.waterCoord.length; i++)
      {
        var c = this.waterGroup.create(this.waterCoord[i][0], this.waterCoord[i][1], 'water', 0)
        c.scale.setTo(1, 1);
      }
    // ******************************

=======
    this.placeWaterTiles();
>>>>>>> 1a8824a4fe957a94df15588dd89d245e6bc1de41
    // ******************************
    //         CREATING FLIES
    // ******************************
    this.flyGroup = game.add.physicsGroup();
    this.flyCoord = [[600, 400, 100, -100],
                    [1000, 250, 40, 0],
                    [1100, 250, -40, 0],
                    [1150, 400, 0, -40]]
    for (var i = 0; i < this.flyCoord.length; i++)
    {
      var f = new fly({game: this.game,
                      x : this.flyCoord[i][0],
                      y : this.flyCoord[i][1],
                      asset: 'fly',
                      x_mov: this.flyCoord[i][2],
                      y_mov: this.flyCoord[i][3]})
      this.flyGroup.add(f);
    }
    // ******************************

    this.game.add.existing(this.waterGroup)
    this.game.add.existing(this.flyGroup)
    this.game.add.existing(this.averagedPlayerController)

    this.game.physics.arcade.enable([this.averagedPlayerController, this.waterGroup, this.flyGroup]);
    this.testWebSocket();

    // Put Text
    this.bmpText = game.add.bitmapText(10, 10, 'gem', flyCount + " / 10 Flies", 30);
  }

  update() {
    if (this.devMode) {
      var obj;
      if (this.cursors.right.isDown) {

        obj = {
          "direction": "right"
        }
      }
      if (this.cursors.left.isDown) {

        obj = {
          "direction": "left"
        }
      }

      if (this.cursors.down.isDown) {

        obj = {
          "direction": "down"
        }
      }
      if (this.cursors.up.isDown)

        obj = {
          "direction": "up"
        }

      if (obj != null) ;
      this.game.inputQueue.push(obj);
    }

    // this.averagedPlayerController.setInputList(this.game.inputQueue);
    // Collision Detection
    game.physics.arcade.overlap(this.averagedPlayerController, this.waterGroup, this.playerWaterCollision, null)
    game.physics.arcade.overlap(this.averagedPlayerController, this.fly, this.playerFlyCollision, null)
    game.physics.arcade.overlap(this.averagedPlayerController, this.waterGroup, this.playerWaterCollision, null);
    game.physics.arcade.overlap(this.averagedPlayerController, this.flyGroup, this.playerFlyCollision, null)
    if (flyCount < 3){
      this.bmpText.setText(flyCount + " flies eaten, the night will be deadly.")
    }
    else if (flyCount < 6){
      this.bmpText.setText(flyCount + " flies eaten, the night will be harsh.")
    }
    else if (flyCount < 8){
      this.bmpText.setText(flyCount + " flies eaten, the night will be bearable.")
    }
    else{
      this.bmpText.setText(flyCount + " flies eaten, the dawn will come.")
    }
  }

  render(){
    game.debug.body(this.averagedPlayerController)
  }

  placeWaterTiles(){
    // ******************************
    //        CREATING WATER TILES
    // EDIT this.waterCoord TO PLACE WATERS
    // ******************************
    this.waterGroup = game.add.physicsGroup();
    this.waterCoord = [[0,0],[100,0],[200,0],[300,0],[400,0],[500,0],[600,0],[700,0],[800,0],[900,0],[1000,0],
      [0,700],[100,700],[200,700],[300,700],[400,700],[500,700],[600,700],[700,700],[800,700],[900,700],[1000,700],
      [0,600],
      [100,500],[100,600],
      [200,400],[200,500],[200,600],
      [300,100],[300,400],[300,500],[300,600],
      [400,100],[400,400],[400,500],[400,600],
      [500,100],[500,500],[500,600],
      [600,100],[600,600],[600,200],
      [700,100],[700,200],[700,300],
      [900,600],
      [1000,200],[1000,300],[1000,600],[1000,500]]


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
    var centerOfScreenX = this.game.camera.position + this.game.camera.width/2;
    var centerOfScreenY = this.game.camera.height/2;
    var gameOverText = this.add.text(
      centerOfScreenX, centerOfScreenY-10,
      "Game Over!"
    );
    gameOverText.anchor.set(0.5);
    var gameOverTween = game.add.tween(gameOverText).to( { x: centerOfScreenX, y: centerOfScreenY }, 1000, "Sine.easeInOut", false, 0, 0);
    gameOverTween.onComplete.add(this.gameOverComplete, this)
    gameOverTween.start();
  }

  gameOverComplete(){
    this.state.start(this.state.current);
  }

  setupTweens(){
    return gameOverTween
  }

  playerFlyCollision(player, fly){
    console.log('FlyCollision')
    fly.center_x = -1000000;
    flyCount++;
    //this.averagedPlayerController.x = 500;
    //this.averagedPlayerController.y = 500;
  }

  //   function init()
  // {
  //   output = document.getElementById("output");
  //   testWebSocket();
  // }
  addRowOfData(name, direction){
    var sideTable = document.querySelector("#Inputs");
    var row = document.createElement("tr");
    var column1 = document.createElement("td");
    var column2 = document.createElement("td");

    row.appendChild(column1);
    row.appendChild(column2);
    sideTable.appendChild(row);



    column1.appendChild(document.createTextNode(name));
    column2.appendChild(document.createTextNode(direction));


    var rightDiv = document.querySelector("#RightDiv");
    rightDiv.scrollTop = rightDiv.scrollHeight;


  }

}
