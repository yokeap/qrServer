const express = require('express')
      , path = require('path')
      , app = express()
      , http = require('http').Server(app)
      , io = require('socket.io')(http, {pingTimeout: 60000});

http.listen(9010, function() {
  console.log('listening on localhost:9010');
});

var qrClient = io.of('/qrClient');
var adminClient = io.of('/adminClient');
var luckydrawClient = io.of('/LuckydrawClient');

var Promise = require('promise');
var mongojs = require('mongojs');
var myiotdb = mongojs('testdb');

var myCollection = myiotdb.collection('dhl');
myCollection.count({},(err, data) => {
 console.log('err ', err, 'data ', data);
})


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "./")));
app.use(express.static(path.join(__dirname, "./public/")));
app.use(express.static(path.join(__dirname, "./public/bower_components")));
app.use(express.static(path.join(__dirname, "./public/webcomponents")));


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
    //res.send("Hello World");
});

app.get('/admin.html', function(req, res) {
    res.sendfile(__dirname + '/public/admin.html');
    //res.send("Hello World");
});

app.get('/getdb', function(req, res) {
    //res.sendfile(__dirname + '/public/index.html');
    //res.send("Hello World");
    console.log(queryDataOneFromMongo(2));
    //res.send(queryDataOneFromMongo(2));
});

qrClient.on('connection', function(socket){
  console.log('qrClient connected');

  socket.on('registedDB', function(msg){
    registedDataToMongo(msg.id,msg.registed);
  });

  socket.on('queryOne', function(msg){
    queryDataOneFromMongo(msg, socket);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

adminClient.on('connection', function(socket){
  console.log('adminClient connected');
  readCollectionFromMongo(socket);

  socket.on('editDB', function(msg){
    editDataToMongo(msg.id, msg.registed, socket);
  });

  socket.on('queryOne', function(msg){
    queryDataOneFromMongo(msg, socket);
  });
});

luckydrawClient.on('connection', function(socket){
  console.log('adminClient connected');
  readCollectionFromMongo(socket);
});


function queryDataOneFromMongo(_id, _socket){
  myCollection.findOne({
    id: _id
  }, function(err, doc) {
    // doc._id.toString() === '523209c4561c640000000001'
    //console.log(retVal);
    if(err == null){
      _socket.emit('resultOne', doc);
    }
  });
}

function readCollectionFromMongo(_socket){
  myCollection.find({}).sort({"id": 1}, function(err, docs){
    //console.log(JSON.stringify(docs));
    //res.jsonp(docs);
    _socket.emit('dbResultQuery',docs);
    myCollection.count({},function(err, data){
     console.log('err ', err, 'data ', data);
     _socket.emit('collection length', data);
   });
  });
}

function editDataToMongo(_id, _registed, _socket){
  // find one named 'mathias', tag him as a contributor and return the modified doc
  myCollection.findAndModify({
    query: { id: _id },
    update: { $set: { registed: _registed } },
    new: true
  }, function (err, doc, lastErrorObject) {
    // doc.tag === 'maintainer'
    console.log(_registed);
    if(err == null){
      _socket.emit('data update', {id: _id, registed: _registed});
    }
  });
}

function registedDataToMongo(_id, _registed){
  // find one named 'mathias', tag him as a contributor and return the modified doc
  myCollection.findAndModify({
    query: { id: _id },
    update: { $set: { registed: _registed } },
    new: true
  }, function (err, doc, lastErrorObject) {
    // doc.tag === 'maintainer'
    if(err == null){
      console.log("emit");
      adminClient.emit('data update',{id: _id, registed: _registed});
    }
  });
}

//var myCollection = myiotdb.collection('testcol');
