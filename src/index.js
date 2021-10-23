const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const port = process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public')
const {addUser, removeUser,getUser,getUserinRoom, removeUsser }=require('./utils/users')
app.use(express.static(publicDirectoryPath))
const s='Welcome!😊'
io.on('connection',(socket)=>{
    console.log('new websocket connection');
   
   socket.on('join',(names,callback)=>{
     
      const {error,user} = addUser({ id:socket.id, ...names})
        if(error){
           // console.log(error);
           return  callback(error)
        }else{
        
      socket.join(user.room)

        socket.emit('msg',generateMessage('Admin',s) )
        socket.broadcast.to(user.room).emit('msg',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserinRoom(user.room)
        })
        callback()
        }
   })
    socket.on('send-msg', (message,callback)=>{
        
        const user=getUser(socket.id)
        // const filter=new Filter()
        // if(filter.isProfane(message)){
        //     return callback('Profanity not allowed')
        // }
        io.to(user.room).emit('msg',generateMessage(user.username,message))
        callback()
    })
    socket.on('send-location',(a,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('location-msg',generateLocationMessage(user.username,`https://google.com/maps?q=${a[0]},${a[1]}`))
        callback()
    })
    socket.on('disconnect',()=>{

        const user= removeUser(socket.id)
        if(user){
        io.to(user.room).emit('msg',generateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserinRoom(user.room)
        })
    }
    })
})
server.listen(port,()=>{
    console.log("Server is up on port "+port);

})