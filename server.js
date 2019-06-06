var path = require("path");
var express = require("express");

var DIST_DIR = __dirname
console.log(DIST_DIR)
var PORT = 3010;
var app = express();

//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

//Send index.html when the user access the web

app.get("*", function (req, res) {
  console.log("req", req.url)
});
app.listen(PORT);