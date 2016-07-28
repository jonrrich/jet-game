//Defines 'Displayable', representing something that can be displayed to the screen


var offCanv = document.createElement("canvas")
var offCtx = offCanv.getContext("2d")


var displayables = []


function Displayable (config) {
     this.config = config
     this.isLoaded = false
     this.isLoading = false
     this.loadCallbacks = []  //functions to call on load
     this.maskRule = this.config.maskRule || []
     this.hooks = config.hooks || []

     displayables.push(this)
}

Displayable.load = function (displayable, callback) {
     Displayable.loadAll([displayable], callback)
}

Displayable.loadAll = function (displayables, callback) {
     var count = 0
     displayables.forEach(function (d) {

          d.load(function () {
               count++
               if(callback && count === displayables.length) callback()
          })
     })
}

Displayable.updateHooks = function (time) {

     displayables.forEach(function (displayable) {

          displayable.hooks.forEach(function (hook) {

               if(hook.condition(time))
                    hook.run(time)
          })
     })
}

Displayable.prototype = {
     load: function (callback) {

          if(callback) this.loadCallbacks.push(callback)

          if(this.isLoading) return   //don't load twice

          if(this.isLoaded) {
               callback()
               return
          }

          this.isLoading = true

          var img = new Image()
          img.src = this.config.image

          var thisDisplayable = this

          img.onload = function () {

               thisDisplayable.image = img

               //thisDisplayable.maskRule = (thisDisplayable.config.maskRule || []).map(function (rule) {  //normalize rule string
               //     return rule.replace(/[^\d,]/g, "")
               //})


               //get data from image by drawing to offscreen canvas

               offCanv.width = img.width
               offCanv.height = img.height

               offCtx.fillStyle = "white"
               offCtx.fillRect(0, 0, img.width, img.height)

               offCtx.drawImage(img, 0, 0, img.width, img.height)

               thisDisplayable.imageData = offCtx.getImageData(0, 0, img.width, img.height).data

               thisDisplayable.isLoaded = true
               thisDisplayable.isLoading = false
               thisDisplayable.loadCallbacks.forEach(function (cb) {
                    cb()
               })

          }
     },
     init: function () {           
          this.cache(this.defaults(this.config))
     },
     defaults: function (config) {
          if(!config) config = {}
          return {
               x: config.x || 0,
               y: config.y || 0,
               v: config.v || 0,
               a: config.a || 0,
               j: config.j || 0,
               theta: config.theta || 0,
               vtheta: config.vtheta || 0,
               atheta: config.atheta || 0,
               jtheta: config.jtheta || 0,
               time: ScrManager.currentTime
          }
     },


     //rudimentary physics engine
     get x () {
          return this.lastCache.x + (1/6 * this.lastCache.j * Math.cos(this.lastCache.theta) * Math.pow(this.timeSecondsSinceCache, 3)) + (1/2 * this.lastCache.a * Math.cos(this.lastCache.theta) * Math.pow(this.timeSecondsSinceCache, 2)) + (this.lastCache.v * Math.cos(this.lastCache.theta) * this.timeSecondsSinceCache)
     },
     set x (x) {
          this.cache({x: x})
     },
     get y () {
          return this.lastCache.y + (1/6 * this.lastCache.j * Math.sin(this.lastCache.theta) * Math.pow(this.timeSecondsSinceCache, 3)) + (1/2 * this.lastCache.a * Math.sin(this.lastCache.theta) * Math.pow(this.timeSecondsSinceCache, 2)) + (this.lastCache.v * Math.sin(this.lastCache.theta) * this.timeSecondsSinceCache)
     
     },
     set y (y) {
          this.cache({y: y})
     },
     get v () {
          return this.lastCache.v + (this.lastCache.a * this.timeSecondsSinceCache) + (1/2 * this.lastCache.j * Math.pow(this.timeSecondsSinceCache, 2))
     },
     set v (v) {
          this.cache({v: v})
     },
     get a () {
          return this.lastCache.a + (this.j * this.timeSecondsSinceCache)
     },
     set a (a) {
          this.cache({a: a})
     },
     get j () {
          return this.lastCache.j
     },
     set j (j) {
          this.cache({j: j})
     },
     get theta () {
          return this.lastCache.theta + (1/6 * this.lastCache.jtheta * Math.pow(this.timeSecondsSinceCache, 3)) + (1/2 * this.lastCache.atheta * Math.pow(this.timeSecondsSinceCache, 2)) + (this.lastCache.vtheta * this.timeSecondsSinceCache)
     },
     set theta (theta) {
          this.cache({theta: theta})
     },
     get vx () {
          return this.v * Math.cos(this.theta)
     },
     get vy () {
          return this.v * Math.sin(this.theta)
     },
     get ax () {
          return this.a * Math.cos(this.theta)
     },
     get ay () {
          return this.a * Math.sin(this.theta)
     },
     get jx () {
          return this.j * Math.cos(theta)
     },
     get jy () {
          return this.j * Math.sin(theta)
     },
     get vtheta () {
          return this.lastCache.vtheta + (this.lastCache.atheta * this.timeSecondsSinceCache) + (1/2 * this.lastCache.jtheta * Math.pow(this.timeSecondsSinceCache, 2))
     },
     set vtheta (vtheta) {
          this.cache({vtheta: vtheta})
     },
     get atheta () {
          return this.lastCache.atheta + (this.jtheta * this.timeSecondsSinceCache)
     },
     set atheta (atheta) {
          this.cache({atheta: atheta})
     },
     get jtheta () {
          return this.lastCache.jtheta
     },
     set jtheta (jtheta) {
          this.cache({jtheta: jtheta})
     },
     get width () {
          return this.config.width || this.image.width
     },
     get height () {
          return this.config.height || this.image.height
     },
     get screenX () {
          return this.x - viewport.x
     },
     get screenY () {
          return this.y - viewport.y
     },
     get timeSinceCache () {
          return ScrManager.currentTime - this.lastCache.time
     },
     get timeSecondsSinceCache () {
          return this.timeSinceCache / 1000
     },

     //stores the last known values for the displayable, from which future values can be calculated. Must be updated in the case of manual value changes.
     cache: function (params) {

          if(typeof params === "undefined") params = {}

          var x = typeof params.x !== "undefined" ? params.x : this.x,
              y = typeof params.y !== "undefined" ? params.y : this.y,
              v = typeof params.v !== "undefined" ? params.v : this.v,
              a = typeof params.a !== "undefined" ? params.a : this.a,
              j = typeof params.j !== "undefined" ? params.j : this.j,
              theta = typeof params.theta !== "undefined" ? params.theta : this.theta,
              vtheta = typeof params.vtheta !== "undefined" ? params.vtheta : this.vtheta,
              atheta = typeof params.atheta !== "undefined" ? params.atheta : this.atheta,
              jtheta = typeof params.jtheta !== "undefined" ? params.jtheta : this.jtheta,
              time = typeof params.time !== "undefined" ? params.time : ScrManager.currentTime

          this.lastCache = {
               x: x,
               y: y,
               v: v,
               a: a,
               j: j,
               theta: theta,
               vtheta: vtheta,
               atheta: atheta,
               jtheta: jtheta,
               time: time
          }

          if(this.cacheTimer && this.lastCache.vtheta === 0 && this.lastCache.atheta === 0 && this.lastCache.jtheta === 0)
               this.stopCacheTimer()
          
          else if(!this.cacheTimer) this.startCacheTimer(15)

     },

     //a 'cacheTimer' is required when theta is changing, since I don't know how to simulate simultaneous change in theta and speed
     startCacheTimer: function (delay) {
          if(this.cacheTimer)
               this.stopCacheTimer()

          var thisDisplayable = this

          this.cacheTimer = setInterval(function () {
               thisDisplayable.cache()
          }, delay)
     },
     stopCacheTimer: function () {
          if(this.cacheTimer) {
               clearInterval(this.cacheTimer)
               this.cacheTimer = undefined
          }
     },

     maskAt: function (x, y) {

          if(x < 0 || x > this.image.width || y < 0 || y > this.image.height) return true

          var index = (y * this.image.width + x) * 4
          //var colorString = this.imageData[index] + "," + this.imageData[index + 1] + "," + this.imageData[index + 2]

          //return this.maskRule.indexOf(colorString) >= 0

          var idata = this.imageData

          return this.maskRule.some(function (rule) {
               return (idata[index] === rule[0] && idata[index + 1] === rule[1] && idata[index + 2] === rule[2])
          })
     },

     collidesWith: function(other) {

          var smaller, larger

          if(this.width * this.height < other.width * other.height) {
               smaller = this
               larger = other
          }
          else {
               smaller = other
               larger = this
          }


          //"for each coordinate (i,j) in 'smaller' that is solid:"
          for(var i = 0; i < smaller.width; i++) {
               for(var j = 0; j < smaller.height; j++) {
                    if(smaller.maskAt(i, j)) {


                         //'i' and 'j' are coordinates relative to the top-left of 'smaller'

                         //'pixelX' and 'pixelY' are the absolute coordinates of the screen (relative to the top-left of the screen)
                         var pixelX = smaller.x + i * Math.cos(smaller.theta) - j * Math.sin(smaller.theta)
                         var pixelY = smaller.y + i * Math.sin(smaller.theta) + j * Math.cos(smaller.theta)

                         //'largerI' and 'largerJ' are coordinates relative to the top-left of 'larger'
                         var largerI = Math.round(larger.x + pixelX / Math.cos(larger.theta) + (pixelY - pixelX * Math.tan(larger.theta)) * Math.sin(larger.theta))
                         var largerJ = Math.round(larger.y + (pixelY - pixelX * Math.tan(larger.theta)) * Math.cos(larger.theta))




                         //"if the coordinate relative to the top-left of 'larger' is also solid, collision."
                         if(larger.maskAt(largerI, largerJ)) return true
                    }
               }
          }

          //if we got down here, no collision.
          return false
     }
}