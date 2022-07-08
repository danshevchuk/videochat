const socket = io()
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(null, {
//host: 'choodo.io',
//path: '/peerjs',
        //port: '4000',
debug: 2
})

console.log('peer:')
console.log(myPeer)
console.log('\nsocket:')
console.log(socket)

const myVideo = document.createElement('video')
myVideo.muted = true
var STREAM = undefined;
var MY_ID = undefined;
const peers = {}

async function openPeer(){
    myPeer.on('open', id => {
        console.log(`my id: ${id}`)
        MY_ID = id;
    }, err => {console.log(err)})
}

openPeer()


setTimeout(()=>{
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
        
        console.log(`emitting join-room. room id: (${ROOM_ID}), MY_ID: (${MY_ID})`)
        socket.emit('join-room', ROOM_ID, MY_ID)
    })
},2000);



function connectToNewUser(userId, stream){
    if(userId == null){
        console.log("User id is null :(")
    }
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



function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}