// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stemmer = require('porter-stemmer').stemmer;
var async = require('asyncawait/async');
var PORT = 3000

//Own Modules
var dynamoDbTable = require('./keyvaluestore.js');

// Express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache must-revalidate");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/search/:word', function(req, res) {
  var stemmedword = stemmer(req.params.word).toLowerCase(); //stem the word
  console.log("Stemmed word: " + stemmedword);
  
  var imageurls = new Array(); 
  
  var processData = function(callback) {
      labels.get(stemmedword, function(err, data) {
      if (err) {
        console.log("getAttributes() failed: "+err);
        callback(err.toString(), imageurls, 400);
      } 

      else if (data == null) {
        console.log("getAttributes() returned no results");
        callback(undefined, imageurls, 204);
      } 

      else {
  	    async.forEach(data, function(attribute, callback) { 
                images.get(attribute.category, function(err, data){
                    if (err) console.log(err);
                    
                    imageurls.push(data[0].url);
                    callback();
                });
          }, function() {
            callback(undefined, imageurls, 200);
          });
      }
    });
  };

  processData(function(err, queryresults, st) {
    if (err) {
      res.status(st).send(JSON.stringify({results: 400, num_results: 0, error: err}));
    } 
    
    else {
      res.status(st).send(JSON.stringify({results: queryresults, num_results: queryresults.length, error: undefined}));
    }
  });
});

//INIT Logic
var images = new dynamoDbTable('images');
var labels = new dynamoDbTable('labels');

images.init(
  function(){
    console.log("Images Storage Starter")
  }
)

labels.init(
  function(){
    console.log("Labels Storage Starter")
  }
)

app.listen(PORT, function(){
  console.log(`Listening on port: http://localhost/${PORT}`)
})

module.exports = app;