const express = require('express')
      , path = require('path')
      , app = express()
      , http = require('http').Server(app);

http.listen(9010, function() {
  console.log('listening on localhost:9010');
});

var mongojs = require('mongojs');
var mydb = mongojs('testcol');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "./")));
app.use(express.static(path.join(__dirname, "./public/")));
app.use(express.static(path.join(__dirname, "./public/bower_components")));
app.use(express.static(path.join(__dirname, "./public/webcomponents")));


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
    //res.send("Hello World");
});


/* -- ASYNC / AWAIT function -- */

async function writedata(_data, res){
  await writeDataToMongo(_data, res);
}

function writeDataToMongo(_savedata, res){
  return new Promise(function(resolve, reject){
    var mywritecollection = myiotdb.collection('mycollection');
    mywritecollection.insert({
      data: Number(_savedata),
      recordTime: new Date().getTime()
    }, function(err){
      if(err){
        console.log(err);
        res.send(String(err));
      }else {
        console.log('record data ok');
        res.send('record data ok');
      }
    });
  });
}

async function readdata(_datasize, res){
  await readDataFromMongo(_datasize, res);
}

function readDataFromMongo(_readdatasize, res){
  return new Promise(function(resolve,reject){
    var myreadcollection = myiotdb.collection('mycollection');
    myreadcollection.find({}).limit(Number(_readdatasize)).sort({recordTime: -1}, function(err, docs){
      //console.log(JSON.stringify(docs));
      res.jsonp(docs);
    });
  });
}
