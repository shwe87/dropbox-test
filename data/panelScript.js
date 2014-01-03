var showing = false;
var hidden = true;

function write(messageToShow){
	var messageContainer = document.getElementById('messageContainer');
	if (messageContainer != null){
		var message = document.getElementById('message');
		message.innerHTML = messageToShow.msg;
		message.setAttribute('class',messageToShow.type);
		//message.setAttribute('class',messageInfo.messageType);
	}

}

self.port.on('write',function(messageInfo){
	console.log("Writing a message.....");
	if(showing){
	//Wait at least 3 seconds
		setTimeout(function(){
			write(messageInfo);		
		},3000);
	}
	else{
		write(messageInfo);
	}
	
	
	
	//self.port.emit('show','panel');


});

self.port.on('showing',function(show){
	showing = show;
	hidden = false;
});


self.port.on('hidden',function(hide){
	hidden = hide;
	showing = false;

});
