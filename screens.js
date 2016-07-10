//Defines 'Scr' and 'ScrManager', which control "screens" of the program


var screens = {}

function Scr (config) {
     
     this.config = config

     this.isLoaded = !config.load  //EXISTENCE of config.load, not return value. load not called here.
                                   //if no load function, we assume loading not necessary, hence loaded.

     this.isLoading = false

     this.loadCallbacks = []  //functions to be called when Scr loads

     screens[config.name] = this
}

Scr.getScr = function (name) {

     return screens[name]
}

Scr.load = function (scr, callback) {

     Scr.loadAll([scr], callback)
}

Scr.loadAll = function (screens, callback) {
     
     var count = 0

     screens.forEach(function (scr) {

          if(typeof scr === "string") scr = Scr.getScr(scr)

          scr.load.call(scr, function () {
               count++
               if(callback && screens.length === count) callback()
          })
     })
}

Scr.prototype = {
     get name () {
          return this.config.name
     },
     get render () {

          if(!this.isLoaded || !this.config.render) return function () {}

          return this.config.render
     },
     get oninput () {
          if(!this.isLoaded || !this.config.oninput) return function () {}

          return this.config.oninput
     },
     get init () {
          if(!this.isLoaded || !this.config.init) return function () {}

          return this.config.init
     },
     get load () {
          
          var thisScr = this

          return function (callback) {

               if(callback) thisScr.loadCallbacks.push(callback)

               if(thisScr.isLoaded) {
                    
                    if(callback) callback()
               }
               else if (!thisScr.isLoading) {

                    thisScr.isLoading = true

                    this.config.load.call(thisScr, function () {

                         thisScr.isLoaded = true
                         thisScr.isLoading = false
                         
                         thisScr.loadCallbacks.forEach(function (cb) {
                              cb()
                         })
                    })
               }
          }
     },
     get exit () {
          if(!this.isLoaded || !this.config.exit) return function () {}

          return this.config.exit
     }
}




var ScrManager = {

     ctx: document.getElementById("canv").getContext("2d"),
     currentScr: null,
     currentTime: null,
     lastTime: null,
     keyStates: new Array(1000).fill(1).map(function () {

          return {
               state: "up",
               lastDown: -Infinity,
               lastUp: -Infinity,
               lastChange: -Infinity
          }
     }),
     
     init: function () {

          window.requestAnimationFrame(function render (time) {

               ScrManager.currentTime = time

               ScrManager.currentScr.render.call(ScrManager.currentScr, ScrManager.ctx, time, ScrManager.lastTime)

               ScrManager.lastTime = time

               window.requestAnimationFrame(render)
          })

          window.onkeyup = function (e) {

               var ks = ScrManager.keyStates[e.keyCode]

               if(ks.state == "down") {
                    ks.state = "up"
                    ks.lastChange = ScrManager.currentTime
                    ks.lastUp = ks.lastChange
               }

               ScrManager.currentScr.oninput.call(ScrManager.currentScr, "keyup", e)
          }

          window.onkeydown = function (e) {

               var ks = ScrManager.keyStates[e.keyCode]

               if(ks.state == "up") {
                    ks.state = "down"
                    ks.lastChange = ScrManager.currentTime
                    ks.lastDown = ks.lastChange
               }

               ScrManager.currentScr.oninput.call(ScrManager.currentScr, "keydown", e)
          }


     },

     setScr: function (scr) {


          ScrManager.keyStates.forEach(function (state) {

               if(state.state == "down") {
                    state.state = "up"
                    state.lastChange = ScrManager.currentTime
                    state.lastUp = state.lastChange
               }
          })

          var targetScr;

          if(typeof scr === "string")
               targetScr = screens[scr]
          else
               targetScr = scr


                    console.log('setting screen to ' + targetScr.name)



          //if first screen, no error
          if(ScrManager.currentScr)
               ScrManager.currentScr.exit.call(ScrManager.currentScr, ScrManager.currentTime)


          ScrManager.currentScr = targetScr

          ScrManager.currentScr.load(function () {
               ScrManager.currentScr.init.call(ScrManager.currentScr, ScrManager.currentTime)
          })
     }

}