var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');

app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
var redisClient = redis.createClient(6379);
redisClient.on("error", function(error) {
    console.error(error);
});


redisClient.subscribe("peasy_database_message");

io.on('connection', function (socket) {
    //direct socket
    console.log("co nguoi ket noi");
    // io.emit('this', { will: 'be received by everyone'});
    socket.join('default');
    socket.on('send_message', function (from, msg, room='default') {
        console.log('I received a private message by ', from, ' saying ', msg);
        io.sockets.in(room).emit("receiver_data", {from: from, msg: msg});
    });
    socket.on('room', function(room){
       socket.join(room);
       io.sockets.in(room).emit("receiver_data", {from: "system", msg: "user" + socket.id + " join room"});
       console.log(socket.id );
    });
    socket.on("leave-room", function(room){
        socket.leave(room);
    });
    socket.on("my-room", function(){
        console.log(Object.keys(socket.rooms));
    });

    //socket with redis
    redisClient.on("message", function(channel, message){
        io.sockets.in('room1').emit("receiver_data", {from: 'admin', msg: message});
        console.log(Object.keys(socket.rooms));
        console.log(message);

    });

});