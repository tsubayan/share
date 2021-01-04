 /*
  
 #line1,
 #line3 {
     position: absolute;
     background: red;
     width: 100%;
     height: 1px;
     top: 10px;
     left: 0;
 }

 #line2,
 #line4 {
     position: absolute;
     background: red;
     width: 1px;
     height: 100%;
     top: 0;
     left: 10px;
 }

 #line5 {
     position: absolute;
     background: green;
     width: 100%;
     height: 1px;
     top: 10px;
     left: 0;
 }

 #line6 {
     position: absolute;
     background: green;
     width: 1px;
     height: 100%;
     top: 0;
     left: 10px;
 }
  */
 const tatecss = {
     position: "absolute",
     background: "green",
     width: "1px",
     height: "100%",
     top: "0",
     left: "10px"
 }
 const yokocss = {
     position: "absolute",
     background: "green",
     width: "100%",
     height: "1px",
     top: "10px",
     left: "0"
 }

 function xy(x, y) {
     $("#line1").css({
         top: y
     })
     $("#line2").css({
         left: x
     })
 }

 function xy2(x, y) {
     $("#line3").css({
         top: y
     })
     $("#line4").css({
         left: x
     })
 }

 function xy3(x, y) {
     $("#line5").css({
         top: y
     })
     $("#line6").css({
         left: x
     })
 }

 $(function() {
     const html =
         '<div id="line1"></div>' +
         '<div id="line2"></div>' +
         '<div id="line3"></div>' +
         '<div id="line4"></div>' +
         '<div id="line5"></div>' +
         '<div id="line6"></div>'
     $("body").append(html)
 })