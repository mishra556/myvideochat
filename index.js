var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var upload = require('express-fileupload');
const { request } = require("https");



app.use(express.static(__dirname + '/public'));
app.use(upload());

app.get('/', function (req, res) {
   res.sendfile('welcome.html');

}); 

app.get('/login', function (req, res) {
   res.sendfile('login.html');

}); 

app.get('/chat', function (req, res) {
   res.sendfile('index.html');
});
var internetAvailable = require("internet-available");

internetAvailable().then(function () {
   console.log("Internet available");
}).catch(function () {
   console.log("No internet");
});




var users = [];
var left = [];
var client = 0;

io.on('connection', (socket) => {

   console.log('user connected' + ':' + socket.id);





   socket.on('new-user-join', data => {

      socket.emit('message', 'welcome' + ':' + data.name);
      socket.emit('heading', 'welcome' + ':' + data.name);


      io.emit('auser', data.name);

      client++;
      console.log(data.name + ':' + client + ':' + 'connected');




      users[data.name] = socket.id;
      left[socket.id] = data.name;

      io.emit('user-join', data.name);

   });









   socket.on('chatm', data => {
      var socketid = users[data.receiver];

      io.to(socketid).emit('pmsg', data);



   });
   socket.on('chatp', data => {
      socket.broadcast.emit('pumsg', data);

   });

   socket.on('disconnect', message => {
      socket.broadcast.emit('left', left[socket.id]);
      socket.broadcast.emit('leftli', left[socket.id]);



      console.log(left[socket.id] + ':' + 'disconnected');
      delete left[socket.id];
   });




   socket.on('upload', name => {




      app.post('/', (req, res) => {

         if (req.files) {
            console.log(req.files);
            var file = req.files.file;
            console.log(file);
            var filename = file.name;
            console.log(filename);

            file.mv('./public/img/' + filename, function (err) {
               if (err) {
                  res.send(err);
               }
               else {


                  io.emit('ufname', { name, filename });

               }
            });
         }



      });








   });




   socket.on('touser', data => {

      var socketid = users[data.receiver];
      send = data.sender;

      app.post('/', (req, res) => {

         if (req.files) {
            console.log(req.files);
            var file = req.files.file;
            console.log(file);
            var filename = file.name;
            console.log(filename);

            file.mv('./public/img/' + filename, function (err) {
               if (err) {
                  res.send(err);
               }

               else {


                  io.to(socketid).emit('upname', { send, filename });
               }
            });
         }








      });








   });


   socket.on('stream', (image) => {


      socket.broadcast.emit('recimg', image);
   });







});













var port = process.env.PORT || 3000

http.listen(port, () => {
   console.log('listening on :' + port);
});
