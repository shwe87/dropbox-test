var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;


var { emit, on, once, off } = require("sdk/event/core");

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


const CLIENT_ID = "b8x0vw45cljfefm";
const CLIENT_SECRET = "9df8u9c90prjo1o";

const AUTH_URL = 'https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id='+CLIENT_ID;
const TOKEN_URL = 'https://www.dropbox.com/1/oauth2/token';
/*const SEARCH_URL = 'https://api-content.dropbox.com/1/search/dropbox/Sync & Share/';*/
const GET_URL = 'https://api-content.dropbox.com/1/files/sandbox/';
const PUT_FILE_URL = 'https://api-content.dropbox.com/1/files_put/sandbox/';

exports.auth = function(){
	tabs.open({
		url: AUTH_URL,
		onReady: function onReady(tab){
			var tabWorker = tab.attach({
				contentScriptFile: data.url('dropbox-handler.js')
			
			});
			tabWorker.port.on('takeCode',function(myCode){
				try{//Lets try to close the tab.
					tabWorker.port.on('closeTab',function(msg){
						tab.close();	
					});
				}catch(e){
					console.log('ERROR!');
				}
				var getAccess = Request({		
					url: TOKEN_URL,
					contentType: 'application/x-www-form-urlencoded',
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'grant_type':'authorization_code'},
					onComplete: function(response){
						console.log("AUTH Status = " + response.status);
						console.log("AUTH STATUS TEXT = " + response.statusText);
						console.log("AUTH HEADERS = " + JSON.stringify(response.headers));
						console.log("AUTH JSON = " + JSON.stringify(response.json));
						if(response.statusText =='OK'){
							/*		
							{"access_token":A TOKEN,
							"token_type":"bearer",
							"uid":Client's ID}*/
							tabWorker.port.emit('signedIn','Signed in correctly');
							emit(exports, 'authComplete', response.json);
							
						}		
					}
				});
				getAccess.post();
				console.log('Posted!');
			});
		
		}
				
	});
		
}

/*exports.searchFile = function(datas){
	var fileName = datas.fileName;
	var token = datas.token;
	var getData = Request({		
		url: SEARCH_URL + fileName,
		//contentType: 'application/x-www-form-urlencoded',
		headers: {'Host':'www.dropbox.com','Authorization': 'Bearer '+ token},
		content: {'rev': ''},
		onComplete: function(response){
			console.log("SEARCH FILE Status = " + response.status);
			console.log("SEARCH FILE STATUS TEXT = " + response.statusText);
			console.log("SEARCH FILE HEADERS = " + JSON.stringify(response.headers));
			console.log("SEARCH FILE JSON = " + JSON.stringify(response.json));
			console.log("SEARCH FILE TEXT = " + response.text);
			if (response.status == '404'){
				datas.exists = false;
			}
			else if (response.status == '200'){
				datas.exists = true;
			}
			emit(exports,'searchFile',datas);
			
			
		}
	});
	getData.get();
				
}*/

exports.getFileData = function(datas){
	var fileName = datas.fileName;
	var token = datas.token;
	var getData = Request({		
		url: GET_URL + 'tabs.json',
		//contentType: 'application/x-www-form-urlencoded',
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization': 'Bearer '+ token},
		//content: {'rev': ''},
		onComplete: function(response){
			console.log("GET FILE Status = " + response.status);
			console.log("GET FILE STATUS TEXT = " + response.statusText);
			console.log("GET FILE HEADERS = " + JSON.stringify(response.headers));
			console.log("GET FILE JSON = " + response.json);
			console.log("GET FILE TEXT = " + response.text);
			console.log("ERRORS = " + response.error);
			if (response.status == '404'){
				datas.exists = false;
				datas.rev = null;
			}
			else if (response.status == '200'){
				datas.exists = true;
				var metadata = response.headers['x-dropbox-metadata'];
				console.log("METADATA rev = " + JSON.stringify(metadata));
				datas.metadata = metadata;
				datas.rev = metadata.rev;
				datas.content = response.json
			}
			emit(exports,'getFileData',datas);
			
		}
	});
	getData.get();
				
}

exports.writeInFile = function(datas){
	var fileName = datas.fileName;
	var token = datas.token;
	var rev = datas.rev;
	var saveDatas = JSON.stringify(datas.dataToSave);
	var URL = PUT_FILE_URL+fileName;
	if (rev != null ){
		URL = URL+'?parent_rev='+rev;
	}
	console.log(URL);
	var saveData = Request({
		url: URL,
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization':'Bearer ' + token,'Content-length':saveDatas.length,'Content-Type':'text/plain; charset=UTF-8'},
		content: saveDatas,
		onComplete: function(response){
			console.log("SAVE DATA Status = " + response.status);
			console.log("SAVE DATA STATUS TEXT = " + response.statusText);
			console.log("SAVE DATAE HEADERS = " + JSON.stringify(response.headers));
			console.log("SAVE DATA JSON = " + JSON.stringify(response.json));
			console.log("SAVE DATA TEXT = " + response.text);
				
			if (response.status == '200'){
				datas.success = true;			
			}
			else{	
				datas.success = false;				
			}
			emit(exports,'writeInFile',datas);	
		}	
	});
	saveData.post();


}	

