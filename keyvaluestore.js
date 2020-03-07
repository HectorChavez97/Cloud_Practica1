  var AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  var db = new AWS.DynamoDB();

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = new this.LRU({ max: 500 });
    this.tableName = table;
  };

  /* Initialize the tables */
  keyvaluestore.prototype.init = function(whendone) {
    var tableName = this.tableName;
    var self = this;
    
    var param = {
      TableName: this.tableName
    }

    db.describeTable(param, (err, data) => {
      if(err) console.log(err.message)
      else{
        console.log(data)
        whendone(); //Call Callback function.
      }
    })

  };

  /**Get result(s) by key
   * @param search
   * Callback returns a list of objects with keys "inx" and "value"
   */
keyvaluestore.prototype.get = function(search, callback) {
  var self = this;
    
  if (self.cache.get(search))
        callback(null, self.cache.get(search));
  else {
    if(this.tableName == "images") {

      var params = {
        TableName: this.tableName,
        ExpressionAttributeNames: {
          '#keyw': 'keyword',
          '#urll': 'url'
        },
        ExpressionAttributeValues:{
          ":keyword" : {S: search}
        },
        KeyConditionExpression: '#keyw = :keyword',
        ProjectionExpression: '#urll,#keyw'
      };

      db.query(params, (err, data) => {
        if(err) callback(err, null)
        else {
          var items = [];

          data.Items.forEach(i => {
            items.push({"keyword": i.keyword, "url": i.url.S});
          });

          self.cache.set(search, items);

          if(items.length > 0) callback(null, items);
          else callback(null, null)
        };
      }
    )} 

    else if (this.tableName == "labels") {

      var params = {
        TableName: this.tableName,
        ExpressionAttributeNames: {
          '#keyw': 'keyword',
          '#cat': 'category'
        },
        ExpressionAttributeValues:{
          ":keyword" : {S: search}
        },
        KeyConditionExpression: '#keyw = :keyword',
        ProjectionExpression: 'inx,#cat,#keyw'
      };

      db.query(params, (err, data) => {
        if(err) callback(err, null)
        else {
          var items = [];

          data.Items.forEach(i => {
            items.push({"keyword": i.keyword,"inx": i.inx.N,"category": i.category.S});
          });

          self.cache.set(search, items);
          
          if(items.length > 0) callback(null, items);
          else callback(null, null)
          };
        }
      )}

      else{
        callback(new Error("IDK why but an error happend"), null)
      }
    }
}

module.exports = keyvaluestore;