const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers}=require('./utils/users');


const app= express();
const server=http.createServer(app);
const io=socketio(server);

//Accesing frontend by making them static
app.use(express.static(path.join(__dirname,'public')));

const botName='ChatCord Bot';
//run when a client connects
io.on('connection',socket=>{
	//whenever a client connects it should show this message
	console.log('New web socket connection...');

	socket.on('joinRoom',({username, room})=>{
		const user=userJoin(socket.id,username,room);
		socket.join(user.room);
		//welcome current user
		/*socket.emit('message','Welcome to chatApp');*/
		socket.emit('message',formatMessage(botName,'Welcome to chatApp'));
		//broadcast to all the user who is connect
		//except the client who is connecting when a user connects
		/*socket.broadcast.emit('message','A user has joined the chat.');*/
		socket.broadcast.to(user.room).emit(
			'message',formatMessage(botName,`${user.username} has joined the chat.`)
		);
		//broadcast to a specific room

		//Send users and room info
		io.to(user.room).emit('roomUsers',{
			room:user.room,
			users: getRoomUsers(user.room)
		});
	});

	//welcome current user
	/*socket.emit('message','Welcome to chatApp');*/
	///socket.emit('message',formatMessage(botName,'Welcome to chatApp'));
	//broadcast to all the user who is connect
	//except the client who is connecting when a user connects
	/*socket.broadcast.emit('message','A user has joined the chat.');*/
	///socket.broadcast.emit('message',formatMessage(botName,'A user has joined the chat.'));
	//io.emit(); broadcast to all the clients


	//Listen for chatMessage
	/*socket.on('chatMessage',(msg)=>{
		// console.log(msg);
		io.emit('message',formatMessage('USER',msg));//emit to everybody
	});*/
	socket.on('chatMessage',(msg)=>{
		const user=getCurrentUser(socket.id);
		console.log("user.id: "+user.id)
		console.log("user.name: "+user.username);
		console.log("user.room: "+user.room);
		// console.log(msg);
		io.to(user.room).emit('message',formatMessage(user.username,msg));//emit to everybody
	});
	//Runs when client diconnects
	socket.on('disconnect',()=>{
		const user=userLeave(socket.id);
		if(user){
			io.to(user.room).emit('message',formatMessage(botName,` ${user.username} has left the chat.`));

			//Send users and room info
			io.to(user.room).emit('roomUsers',{
				room:user.room,
				users: getRoomUsers(user.room)
			});
		}
	//	io.emit('message',formatMessage(botName,'A user has left the chat.'));

	});

});

const PORT= process.env.PORT || 3000;
// app.listen(PORT,()=>console.log(`server running on port ${PORT}`));
server.listen(PORT,()=>console.log(`server running on port ${PORT}`));
