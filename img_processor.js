//the webworker used to generate the masks for displayables, based on their image and their maskRule

self.addEventListener("message", function (e) {

     var args = e.data

     var maskRule = args.maskRule
     var imgData = args.imgData
     var imgWidth = args.imgWidth
     var imgHeight = args.imgHeight

     //generate an array of arrays of the correct size
     var mask = new Array(imgWidth)
                    .fill(1)                 //<-- make iterable
                    .map(function () {    
                         return new Array(imgHeight)
                     })


     for(var i = 0; i < imgData.length; i += 4) {

          var str = imgData[i] + "," + imgData[i+1] + "," + imgData[i+2]

          var y = Math.floor((i / 4) / imgWidth)
          var x = (i / 4) % imgWidth

          if(maskRule.indexOf(str) > -1) {

               mask[x][y] = 1
          }
          else mask[x][y] = 0
     }
     
     self.postMessage({
          mask: mask
     })


}, false)