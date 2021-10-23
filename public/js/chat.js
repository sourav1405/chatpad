
const socket=io()
//Elements
const messageform=document.querySelector('#message-form')
const messageinput=messageform.querySelector('input')
const sendbutton=messageform.querySelector('button')
const locationbtn=document.querySelector(".btn")
const messages=document.querySelector("#messages")

//Templates
const msgtemplate=document.querySelector("#msg-template").innerHTML
const locationmsgtrmplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML
//options
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

   // if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
     //}
}
socket.on('msg',(s)=>{
  //  console.log(s);
    const html=Mustache.render(msgtemplate,{
        username:s.username,
        s:s.text,
        createdAt:moment(s.createdAt).format('h:mm a ')
    })
    messages.insertAdjacentHTML('beforeend',html)
   // socket.emit()
   autoscroll()
})

socket.on('location-msg',(message)=>{
    console.log(message.url); 
    const html=Mustache.render(locationmsgtrmplate,{
        username:message.username,
       url:message.url,
       createdAt:moment(message.createdAt).format('h:mm a ')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
 })
 socket.on('roomData',({room,users})=>{
    const html=Mustache.render (sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
 })
document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable
   sendbutton.setAttribute('disabled','disabled')
   
    const message=e.target.elements.msgg.value
    socket.emit('send-msg',message,(error)=>{
        //enable
      sendbutton.removeAttribute('disabled')
      
    sendbutton.removeAttribute('disabled')
    messageinput.value = ''
    messageinput.focus()
        if(error){
           return console.log(error);
        }
        console.log('The message was delivered!');
    })
})

document.querySelector(".btn").addEventListener('click',()=>{
    if(! navigator.geolocation){
        return alert ('Geolocation is not supported by your browser')
    }
    locationbtn.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
       
        const a=[position.coords.latitude,position.coords.longitude]
        socket.emit('send-location',a,(msg)=>{
            console.log(msg);
            locationbtn.removeAttribute('disabled')
        })

    }) 
    
})
socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})