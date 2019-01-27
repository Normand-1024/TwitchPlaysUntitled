/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import averagedPlayerController from '../sprites/averagedPlayerController.js'

export default class extends Phaser.State {
  

  testWebSocket()
  {
    this.websocket = new WebSocket("ws://tpg45.herokuapp.com/game_receive");
    var webLocal = this.websocket;
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

    this.devMode = false;
    this.baseSpeed = 100;
    this.game.inputQueue = [];
    let websocket_url="ws://tpg45.herokuapp.com/game_receive";

    if(this.devMode){
      this.cursors = game.input.keyboard.createCursorKeys();
    }
    const bannerText = lang.text('welcome')
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText, {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })


    banner.padding.set(10, 16)
    banner.anchor.setTo(0.5)
    
    this.averagedPlayerController = new averagedPlayerController({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'mushroom',
      baseSpeed: this.baseSpeed
    })

    // ******************************
    //        CREATING WATER TILES
    // EDIT this.waterCoord TO PLACE WATERS
    // ******************************
    this.waterGroup = game.add.physicsGroup();
    this.waterCoord = [ [50, 50], [0, 0]]

    for (var i = 0; i < this.waterCoord.length; i++)
      {
        var c = this.waterGroup.create(this.waterCoord[i][0], this.waterCoord[i][1], 'water', 0)
        c.scale.setTo(1, 1);
      }
    // ******************************

    this.game.add.existing(this.waterGroup)
    this.game.add.existing(this.averagedPlayerController)

    this.game.physics.arcade.enable([this.averagedPlayerController, this.waterGroup]);
    this.testWebSocket();
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
      if(obj!=null);
      this.game.inputQueue.push(obj);
      // this.averagedPlayerController.setInputList(this.game.inputQueue);
    // Collision Detection
      game.physics.arcade.overlap(this.averagedPlayerController, this.waterGroup, this.playerWaterCollision, null)
  } 

  restartGame(){
    this.restart()
  }

  playerWaterCollision(){
    console.log('WaterCollision')
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
    if(sideTable == null) {alert("fuck you")};
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
