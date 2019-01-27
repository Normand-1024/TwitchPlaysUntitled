/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import fly from "../sprites/fly.js"
import smartfly from "../sprites/smartfly.js"
import lang from '../lang'
import mapData from '../map.js'
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
    this.devMode = true;
    this.playerStartX = 300;
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

    this.smartflyGroup = game.add.physicsGroup();
    this.smartflyCoord = mapData['smartflies'];
    for (var i = 0; i < this.smartflyCoord.length; i++)
      {
        var f = new smartfly({game: this.game,
                             x : this.smartflyCoord[i][0],
                             y : this.smartflyCoord[i][1],
                             asset: 'fly',
                             radius: this.smartflyCoord[i][2]})
        this.smartflyGroup.add(f);
      }
    // ******************************

    // ****************************** 
    //          GO HOME
    // ****************************** 
    
    this.home = this.game.add.sprite(30, 300, "house");
    this.home.scale.x = .5;
    this.home.scale.y = .5;
    
    this.game.add.existing(this.dirtGroup)
    this.game.add.existing(this.waterGroup)
    this.game.add.existing(this.flyGroup)
    this.game.add.existing(this.smartflyGroup)
    this.game.add.existing(this.averagedPlayerController)

    this.game.physics.arcade.enable([this.averagedPlayerController, this.waterGroup, this.flyGroup, this.smartflyGroup,this.home]);
    this.home.body.immovable = true;
    this.testWebSocket();

    // Put Text
    this.bmpTextBlack = game.add.bitmapText(12, 12, 'gem', flyCount + " / 10 Flies", 30);
    this.bmpTextBlack.tint = '0x111111'
    this.bmpText = game.add.bitmapText(10, 10, 'gem', flyCount + " / 10 Flies", 30);
    this.setupGameTimer();

    this.startMusic()
    this.attachSounds();
  }

  update() {
    if (this.devMode) {
      var obj = obj = {
          "right" : 0,
          "left" : 0,
          "down" : 0,
          "up" : 0
        }
      if (this.cursors.right.isDown) {

        obj.right = 1;
        
      }
      if (this.cursors.left.isDown) {

        obj.left = 1;
      }

      if (this.cursors.down.isDown) {

        obj.down = 1;
      }
      if (this.cursors.up.isDown)

        obj.up = 1;

      if (obj != null) {
        this.game.inputQueue.push(obj);
      }

    }

    this.smartflyGroup.setAll('player_x', this.averagedPlayerController.x);
    this.smartflyGroup.setAll('player_y', this.averagedPlayerController.y);

    // this.averagedPlayerController.setInputList(this.game.inputQueue);
    // Collision Detection
    game.physics.arcade.overlap(
      this.averagedPlayerController,
      this.waterGroup,
      this.playerWaterCollision,
      this.playerCanCollide
    );
    game.physics.arcade.overlap(this.averagedPlayerController, this.flyGroup, this.playerFlyCollision, null)
    game.physics.arcade.overlap(this.averagedPlayerController, this.smartflyGroup, this.playerFlyCollision, null)
    game.physics.arcade.collide(this.averagedPlayerController, this.home, this.playerHomeCollision, null)

    if (flyCount < 3){
      this.bmpText.setText(flyCount + " flies eaten, the night will be deadly.")
      this.bmpTextBlack.setText(flyCount + " flies eaten, the night will be deadly.")
    }
    else if (flyCount < 6){
      this.bmpText.setText(flyCount + " flies eaten, the night will be harsh.")
      this.bmpTextBlack.setText(flyCount + " flies eaten, the night will be harsh.")
    }
    else if (flyCount < 8){
      this.bmpText.setText(flyCount + " flies eaten, the night will be bearable.")
      this.bmpTextBlack.setText(flyCount + " flies eaten, the night will be bearable.")
    }
    else{
      this.bmpText.setText(flyCount + " flies eaten, the dawn will come.")
      this.bmpTextBlack.setText(flyCount + " flies eaten, the dawn will come.")
    }
    
    this.bmpText.x = this.game.camera.position.x + 10; //+ this.bmpText_relative_x;
    this.bmpText.y = this.game.camera.position.y + 10; //+ this.bmpText_relative_y;
    this.bmpTextBlack.x = this.game.camera.position.x + 12; //+ this.bmpText_relative_x;
    this.bmpTextBlack.y = this.game.camera.position.y + 12; //+ this.bmpText_relative_y;

  }

  render(){
    game.debug.body(this.averagedPlayerController);
    game.debug.text('Time until nightfall: ' + this.gameTimer.duration.toFixed(0), 32, 72);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


  startMusic(){
    this.music = game.add.audio('music');

    this.music.play();
  }


  placeMapTiles(){
    this.waterGroup = game.add.physicsGroup();
    this.dirtGroup = game.add.physicsGroup();
    this.mapTiles = mapData['maptiles'];

    for (var i = 0; i < this.mapTiles.length; i++){
      for (var j = 0; j < this.mapTiles[i].length; j++)
      {
        if (this.mapTiles[i][j] == 0) {
          var w = this.game.add.sprite(j * 100, i * 100, 'grass', 0);
        } else if (this.mapTiles[i][j] == 2) {
          if (this.getRandomInt(2) == 0) {
            var w = this.waterGroup.create(j * 100, i * 100, 'water1', 0);
          } else {
            var w = this.waterGroup.create(j * 100, i * 100, 'water2', 0);
          }
        } else if (this.mapTiles[i][j] == 5) {
          var w = this.game.add.sprite(j * 100, i * 100, 'flowers', 0);
        } else if (this.mapTiles[i][j] == 6) {
          var w = this.game.add.sprite(j * 100, i * 100, 'stump', 0);
        }
        w.scale.setTo(3.13, 3.13);
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
    var gameOverTween = game.add.tween(gameOverText).to( { x:400 , y: this.game.height/2 }, 2000, "Sine.easeInOut", false, 0, 0);

    gameOverTween.onComplete.add(this.gameOverComplete, this)
    gameOverTween.start();
  }

  gameOverComplete(){
    flyCount = 0;
    this.music.stop();
    this.state.start(this.state.current);
    this.gameOverText.destroy()
  }

  playerFlyCollision(player, fly){
    //fly.center_x = -1000000;
    fly.destroy();
    player.game.slurpSound.play();
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

  setupGameTimer(){
    this.gameTimer = game.time.create(false);
    this.gameTimer.loop(20000, this.gameOver, this);
    this.gameTimer.start();
  }

  attachSounds(){
    this.game.slurpSound = this.game.add.audio("slurp");
  }
}
