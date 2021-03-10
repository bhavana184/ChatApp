//FRONT END JS
const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');


//Get username and room from URL
const {username, room} =Qs.parse(location.search,{
	ignoreQueryPrefix:true //ignore =,& etc symbols in url
});

console.log(username, room);
//access enabled due to inclusion of socket.io.js script
const socket=io();

//join chatroom
socket.emit('joinRoom',{ username, room});

//Get room and Users
socket.on('roomUsers',({room,users})=>{
	outputRoomName(room);
	outputUsers(users);

});

//message is the event created in server.js
//message from server
socket.on('message',message=>{
	console.log(message);
	outputMessage(message);

	//Scroll down, highlight that message
	chatMessages.scrollTop=chatMessages.scrollHeight;
});

//Message submit
//when we submit a form it automatically submit to a file
//-->default behaviour of form
chatForm.addEventListener('submit',(e)=>{
	e.preventDefault();//prevent the default behaviour of the form

	//get message text
	const msg=e.target.elements.msg.value;
	//extracts value of element with id="msg"
	// console.log(msg);
	//emitting a message to the server
	socket.emit('chatMessage',msg);

	//clear input of message field
	e.target.elements.msg.value="";
	e.target.elements.msg.focus();//to have cursor pointer in message box
});

//output message to DOM
function outputMessage(message){
	const div=document.createElement('div');
	div.classList.add('message');//accessing message div
	div.innerHTML=`<p class="meta">${message.username+'   '}  <span>${message.time}</span></p>
	<p class="text">
		${message.text}
	</p>`;
	document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
	console.log('room: '+room);
	roomName.innerText=room;
}

//Add users to DOM
function outputUsers(users) {
	userList.innerHTML=`
	${users.map(user =>`<li>${user.username}</li>`).join('')}
	`;
}
