/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import fly from "../sprites/fly.js"
import lang from '../lang'
import mapData from '../map.js'
import averagedPlayerController from '../sprites/averagedPlayerController.js'

// Global Variables
var flyCount = 0
console.log(mapData)

export default class extends Phaser.State {
  

  testWebSocket()
  {
    this.websocket = new WebSocket("ws://tpg45.herokuapp.com/game_receive");
    this.websocket.addEventListener('open', function (event) {
      console.log("connected");
    });
    var localObj = this;
    this.websocket.addEventListener('message', function (event) {
      console.log("event recieved");
      console.log('Message from server ' + event.data);
      var control = JSON.parse(event.data);
      if(!Array.isArray(control)){
         control = [control];
      }
      for(var i = 0; i < control.length; i++){
        var obj = control[i];
        // localObj.addRowOfData(obj.name, obj.direction);
        console.log("Pushing into input queue " );
        localObj.game.inputQueue.push(obj);
        localObj.averagedPlayerController.setInputList(localObj.game.inputQueue);
      }

    });

    this.websocket.addEventListener('close', function (event) {
      console.log("connection closed");
      
    });


    this.websocket.addEventListener('error', function (event) {
      console.log("connection error");
      
    });
  }

  init() { }
  

  preload() { 
       this.output;
    }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //this.flyCount = 0;
    this.devMode = false;
    this.playerStartX = 100;
    this.playerStartY = 300;

    this.baseSpeed = 30;
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
    this.averagedPlayerController.animations.play("walk", 17, true);

    this.game.world.setBounds(0,0,5000,800)
    this.game.camera.follow(this.averagedPlayerController, 2);

    this.placeMapTiles();

    // ******************************
    //         CREATING FLIES
    // ******************************
    this.flyGroup = game.add.physicsGroup();
    this.flyCoord = mapData['flies']
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

    // ****************************** 
    //          GO HOME
    // ****************************** 
    
    this.home = this.game.add.sprite(30, game.height/2+100, "house");
    this.home.scale.x = .5;
    this.home.scale.y = .5;
    
    this.game.add.existing(this.dirtGroup)
    this.game.add.existing(this.waterGroup)
    this.game.add.existing(this.flyGroup)
    this.game.add.existing(this.averagedPlayerController)

    this.game.physics.arcade.enable([this.averagedPlayerController, this.waterGroup, this.flyGroup, this.home]);
    this.home.body.immovable = true;
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
    game.physics.arcade.overlap(
      this.averagedPlayerController,
      this.waterGroup,
      this.playerWaterCollision,
      this.playerCanCollide
    );
    game.physics.arcade.overlap(this.averagedPlayerController, this.fly, this.playerFlyCollision, null)
    game.physics.arcade.overlap(this.averagedPlayerController, this.flyGroup, this.playerFlyCollision, null)
    game.physics.arcade.overlap(this.averagedPlayerController, this.waterGroup, this.playerWaterCollision, null)

    game.physics.arcade.collide(this.averagedPlayerController, this.home, this.playerHomeCollision, null);

    if (flyCount < 3){
      this.bmpText.setText(flyCount + " flies eaten, the night deadly.")
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

  placeMapTiles(){
    this.waterGroup = game.add.physicsGroup();
    this.dirtGroup = game.add.physicsGroup();
    this.mapTiles = mapData['maptiles'];

    for (var i = 0; i < this.mapTiles.length; i++){
      for (var j = 0; j < this.mapTiles[i].length; j++)
      {
        if (this.mapTiles[i][j] == 1){
          
        }
        else if (this.mapTiles[i][j] == 2){
          var w = this.waterGroup.create(j * 100, i * 100, 'water', 0);
        }
      }
    }
      // ******************************
  }

  playerWaterCollision(playerSprite, water){
    console.log("Water collision.");
    playerSprite.stopAllMovement();
    playerSprite.disableCollision();
    var stateManager = playerSprite.game.state;
    var currentStateName = stateManager.current;
    var currentState = stateManager.states[currentStateName];
    currentState.gameOver();
  }

  playerHomeCollision(playerSprite, home){
    console.log("Water collision.");
    playerSprite.stopAllMovement();
    var stateManager = playerSprite.game.state;
    var currentStateName = stateManager.current;
    var currentState = stateManager.states[currentStateName];
    currentState.gameWin();
  }


  gameOver(){
    var centerOfScreenX = this.game.camera.position.x + this.game.camera.width/2;
    var centerOfScreenY = this.game.camera.position.y + this.game.camera.height/2;
    this.gameOverText = this.add.text(
      centerOfScreenX, -10,
      "Game Over!",
      {
        font: "Major Mono Display",
        fontWeight: "bold",
        fontSize: "32px"
      }
    );
    this.gameOverText.anchor.set(0.5);
    var gameOverTween = game.add.tween(
      this.gameOverText
    ).to(
        { x: centerOfScreenX, y: centerOfScreenY }, 1000, "Sine.easeInOut", false, 0, 0);
    gameOverTween.onComplete.add(this.gameOverComplete, this);
    gameOverTween.start();
  }

   gameWin(){
    var text = "";

    if (flyCount < 3){
      text = "You have let down your chameleon children,\r\n and they will hunger"
    }
    else if (flyCount < 6){
      text = "Your family shall sustain, barely"
    }
    else if (flyCount < 8){
      text = "Peace and prosperity shall rise tonight"
    }
    else{
      text = "Your family shall grow fat with flys\r\n joy shall overflow!"
    }
    var centerOfScreenX = this.game.camera.position + this.game.camera.width/2;
    var centerOfScreenY = this.game.camera.height/2;
    var gameOverText = this.add.text(
      400, this.game.height+100,
      text
    );
    gameOverText.anchor.set(0.5);
    var gameOverTween = game.add.tween(gameOverText).to( { x:400 , y: this.game.height/2 }, 3000, "Sine.easeInOut", false, 0, 0);
    gameOverTween.onComplete.add(this.gameOverComplete, this)
    gameOverTween.start();
  }

  gameOverComplete(){
    flyCount = 0;
    this.state.start(this.state.current);
    this.gameOverText.destroy()
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

  playerCanCollide(playerSprite){
    return playerSprite.collideEnabled;
  }

}
