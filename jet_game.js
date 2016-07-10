//Main js file.

(function () {


     new Scr({

          name: "load_menus",
          render: renderLoading,
          init: function () {
               Scr.loadAll( ["title", "level_select"],
                    function () {
                         ScrManager.setScr("title")
                    }
               )

               Scr.loadAll(["L-1", "L-2"])
          }
     })


     new Scr({
          name: "title",
          render: function (ctx, time) {

               ctx.drawImage(this.bg.image, 0, 0, 800, 600)
          },
          oninput: function (input, evt) {

               var keyCode = evt.keyCode

               if(input === "keyup") {

                    if(keyCode === 80) {
                         //PLAY

                         ScrManager.setScr("level_select")
                    }

                    else if(keyCode === 83) {
                         //todo STATS

                         alert("stats")
                    }

                    else if(keyCode === 79) {
                         //todo OPTIONS

                         alert("options")
                    }

                    else if(keyCode === 65) {
                         //todo ABOUT

                         alert("about")
                    }
               }
               
          },
          load: function (onloaded) {

               this.bg = new Displayable({
                    image: "assets/title.png"
               })
               
               //call onloaded to notify ScrManager that we have loaded once bg image is loaded
               Displayable.load(this.bg, onloaded)
          }
     })

     new Scr({
          name: "level_select",
          render: function (ctx, time) {
               ctx.drawImage(this.bg.image, 0, 0, 800, 600)
          },
          oninput: function (input, evt) {
               if(input == "keyup") {
                    var keyCode = evt.keyCode
                    if(keyCode >= 49 && keyCode <= 57) {
                         //LVL 1-9

                         ScrManager.setScr("load_L-" + (keyCode - 48))
                    }

                    else if(keyCode === 88) {
                         //EXIT

                         ScrManager.setScr("title")
                    }
               }

          },
          load: function (onloaded) {
               this.bg = new Displayable({
                    image: "assets/level_select.png"
               })
               Displayable.load(this.bg, onloaded)
          }
     })



     ScrManager.setScr("load_menus")

     ScrManager.init()


})()