const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')
var ExpressPeerServer = require('peer').ExpressPeerServer;

//const cors = require('cors');

//const corsOption = {
//    origin: ['https://choodo.io:4001'],
//};
//app.use(cors(corsOption));

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
//app.set('views', __dirname + '/views')
//console.log(__dirname + '/views')

app.get('/', (req, res)=>{
    res.redirect(`/${ uuidV4() }`)
})

app.get('/:room', (req, res)=>{
    res.render('room.ejs', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        console.log(`new user (${userId}) joined room (${roomId})`)
        socket.on('disconnect', ()=>{
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })

    
})


var options = {
    debug: true
}
app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(4000)