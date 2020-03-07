var stemmer = require('porter-stemmer').stemmer;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  console.log("Argumento: "+req.params.word);
  var stemmedword = stemmer(req.params.word).toLowerCase(); //stem the word
  console.log("Stemmed word: "+stemmedword);
  
  // define an array to store the final set of results returned from DynamoDB
  var imageurls = new Array(); 
  
  var processData = function(callback) {
    terms.get(stemmedword, function(err, data) {
      if (err) {
        console.log("getAttributes() failed: "+err);
        callback(err.toString(), imageurls);
      } else if (data == null) {
        console.log("getAttributes() returned no results");
        callback(undefined, imageurls);
      } else {
        console.log("getAttributes() returned");
  	    async.forEach(data, function(attribute, callback) { 
            console.log(attribute);
            images.get(attribute.value, function(err, data){
              if (err) {
                console.log(err);
              }
              imageurls.push(data[0].value);
              callback();
            });
          }, function(){
            callback(undefined, imageurls);
        });
     }
    });
  };

  processData(function(err, queryresults) {
    if (err) {
      res.send(JSON.stringify({results: undefined, num_results: 0, error: err}));
    } else {
      res.send(JSON.stringify({results: queryresults, num_results: queryresults.length, error: undefined}));
    }
  });
});

module.exports = router;
