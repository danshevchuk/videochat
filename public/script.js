const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '4001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
var STREAM = undefined;
var MY_ID = undefined;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    
    socket.on('user-connected', userId => {
        console.log(`User connected: ${userId}`)
        connectToNewUser(userId, stream)
    }, err => {console.log(err)})

    socket.on('user-disconnected', userId => {
        if(peers[userId]){
            peers[userId].close()
        }
    })
    
    myPeer.on('call', call => {
        call.answer(stream)
        var video = document.createElement('video')
        call.on('stream', userStream =>{
            addVideoStream(video, userStream)
        })
    }, err => {console.log(err)})

    addVideoStream(myVideo, stream)

    socket.emit('join-room', ROOM_ID, MY_ID)
})



function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    }, err => {console.log(err)})
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

myPeer.on('open', id => {
    console.log(`my id: ${id}`)
    MY_ID = id;
})

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}