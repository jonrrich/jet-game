//Defines the level screens and the level loading screens.

function renderLoading (ctx, time) {

     var radius = 35
     var thickness = 5
     var length = 2 * Math.PI / 3
     var speed = 3.5


     ctx.fillStyle = "#6699CC"
     ctx.fillRect(0, 0, 800, 600)

     ctx.lineWidth = thickness

     var startAngle = (time / 1000 * speed) % (2 * Math.PI)
     var endAngle = startAngle + length

     ctx.beginPath()
     ctx.strokeStyle = "rgba(255, 255, 255, 1)"
     ctx.arc(400, 300, radius, startAngle, endAngle)
     ctx.stroke()

     ctx.beginPath()
     ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
     ctx.arc(400, 300, radius, startAngle, endAngle, true)
     ctx.stroke()


}


var levelData = [
     {
          map: {
               image: "assets/map1.png",
               maskRule: [ [97, 60, 39], [57, 35, 23], [0, 62, 0], [0, 79, 0], [18, 12, 7] ]
          },
          viewport: {
               x: 0,
               y: 60
          },
          jet: {
               maskRule: [ [0, 0, 0] ],
               x: 100,
               y: 245
          }
     },

     {
          map: {
               image: "assets/map2.png",
               maskRule: [ [0, 0, 0] ]
          },
          viewport: {
               x: 0,
               y: 50
          },
          jet: {
               maskRule: [ [0, 0, 0] ],
               x: 70,
               y: 340
          }
     },

     {
          map: {
               image: "assets/map3.png",
               maskRule: [ [0, 0, 0] ]
          },
          viewport: {
               x: 0,
               y: 50
          },
          jet: {
               maskRule: [ [0, 0, 0] ],
               x: 70,
               y: 340
          }
     }

]


var jet = new Displayable({
     image: "assets/jet.png",
     hooks: [

               {
                    condition: function (time) {

                         if(ScrManager.currentScr.name.substring(0, 2) !== "L-") return false

                         return ScrManager.currentScr.map.image.width - (jet.x + jet.image.width) <= 30
                    },
                    run: function (time) {
                         alert("level " + ScrManager.currentScr.level + " complete!")
                         ScrManager.setScr("level_select")
                    }
               },

               {

                    condition: function (time) {

                         if(ScrManager.currentScr.name.substring(0, 2) !== "L-") return false

                         return ScrManager.currentScr.jetState === "flying" && jet.collidesWith(ScrManager.currentScr.map)
                    },
                    run: function (time) {
                         alert("bang")
                         ScrManager.setScr(ScrManager.currentScr)
                    }
               }
          ]
})


var viewport = {x: 0, y: 0}

for(var i = 0; i < levelData.length; i++) {

     (function (i) {
          
          var startTime, //time this screen began 
              currentTime, //most recent render cycle
              lastTime //last completed render cycle


          //create level screen
          var thisScr = new Scr({
               name: "L-" + (i + 1),

               render: function (ctx, time, lTime) {

                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, 800, 600)

                    if(thisScr.jetState === "takeoff" && jet.v >= 600) {
                         thisScr.jetState = "leveloff"
                         jet.v = 600
                         jet.a = 0
                         jet.atheta = Math.PI / 16
                    }

                    if(thisScr.jetState === "leveloff" && Math.sin(jet.theta) >= 0) { //jet level or slightly tilted down
                         thisScr.jetState = "flying"
                         jet.atheta = 0
                         jet.vtheta = 0
                         jet.theta = 0
                    }

                    currentTime = time
                    lastTime = lTime

                    //move viewport with jet
                    var targetViewportX = jet.x - 100

                    var targetViewportY
                    if(jet.y < 300)
                         targetViewportY = 0
                    else if(jet.y > thisScr.map.height - 300)
                         targetViewportY = thisScr.map.height - 600
                    else
                         targetViewportY = jet.y - 300


                    if(thisScr.jetState !== "runway") {

                         var shiftViewportX = (Math.abs(jet.v * Math.cos(jet.theta)) + 50) * (currentTime - lastTime) / 1000
                         var shiftViewportY = (Math.abs(jet.v * Math.sin(jet.theta)) + 50) * (currentTime - lastTime) / 1000

                         if(viewport.x < targetViewportX) {
                              viewport.x = Math.min(targetViewportX, viewport.x + shiftViewportX)
                         }
                         else if(viewport.x > targetViewportX) {
                              viewport.x = Math.max(targetViewportX, viewport.x - shiftViewportX)
                         }

                         if(viewport.y < targetViewportY) {
                              viewport.y = Math.min(targetViewportY, viewport.y + shiftViewportY)
                         }
                         else if(viewport.y > targetViewportY) {
                              viewport.y = Math.max(targetViewportY, viewport.y - shiftViewportY)
                         }

                    }
                    else {

                         viewport.x = thisScr.levelData.viewport.x
                         viewport.y = thisScr.levelData.viewport.y
                    }



                    var downState = ScrManager.keyStates["40"]
                    var upState = ScrManager.keyStates["38"]


                    //if jet is flying (controllable, not taking off) and there has been a recent key event
                    
                    if(thisScr.jetState === "flying" && (downState.lastChange >= lastTime || upState.lastChange >= lastTime) ) {

                         if(downState.state === "down" && upState.state === "up") {
                              jet.vtheta = 0
                              jet.atheta = 2 * Math.PI
                              jet.jtheta = 1 * Math.PI
                         }
                         else if(downState.state === "up" && upState.state === "down") {
                              jet.vtheta = 0
                              jet.atheta = -2 * Math.PI
                              jet.jtheta = -1 * Math.PI
                         }
                         else {
                              jet.vtheta = 0
                              jet.atheta = 0
                              jet.jtheta = 0
                         }
                    }



                    [thisScr.map, jet].forEach(function (element) {
                         ctx.save()
                         ctx.translate(element.screenX, element.screenY)
                         ctx.rotate(element.theta)
                         ctx.drawImage(element.image, 0, 0, element.width, element.height)
                         ctx.restore()
                    })

               },

               oninput: function (type, e) {
                    
                    //on <space> keydown, takeoff if haven't already done so
                    if(type === "keydown" && e.keyCode === 32 && thisScr.jetState === "runway") {

                         thisScr.jetState = "takeoff"
                         jet.a = 200
                         jet.vtheta = -Math.PI / 64

                    }
                    //on <X> keyup, exit to level select
                    else if(type === "keyup" && e.keyCode === 88) {
                         ScrManager.setScr("level_select")
                    }

               },

               init: function (sTime) {

                    startTime = sTime

                    thisScr.jetState = "runway"
                    
                    jet.init()     //reset to defaults
                    thisScr.map.init()


                    var jetData = thisScr.levelData.jet
                    jet.x = jetData.x
                    jet.y = jetData.y
                    jet.maskRule = jetData.maskRule



                    var levelsToPreload = 2  //preload next two levels when this level begins

                    var nextLevels = []
                    for(var i = 1; i <= levelsToPreload; i++) {
                         var scr = Scr.getScr("L-" + i)
                         if(scr) nextLevels.push(scr)
                    }

                    Displayable.loadAll(nextLevels)

               },

               load: function (onLoaded) {

                    var resources = [thisScr.map, jet]

                    Displayable.loadAll(resources, onLoaded)

               }

          })

          thisScr.levelData = levelData[i]
          thisScr.level = i + 1
          thisScr.map = new Displayable(levelData[i].map)





          //create loading screen
          var thisLScr = new Scr({
               name: "load_L-" + (i + 1),

               render: renderLoading,

               init: function () {
                    Scr.getScr("L-" + (i + 1)).load(function () {
                         ScrManager.setScr("L-" + (i + 1))
                    })
               }
          })

     })(i)

}
