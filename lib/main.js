var tabs = require('sdk/tabs');
var data = require('sdk/self').data;
var dropbox = require('./dropbox.js');
var panel = require('./panelControl.js');
var timer = require('sdk/timers');

var thisPanel;

var dropboxData = new Object();

function hidePanel(){
	thisPanel.hide();
	console.log("MAIN AFTER HIDE = " + thisPanel.showing);

}

function handleAuth(authDatas){
	console.log('Auth completed!');
	dropboxData.token = authDatas.access_token;
	dropboxData.token_type = authDatas.token_type;
	dropboxData.uid = authDatas.uid;
	thisPanel.write({'msg':'Signed in correctly!','type':'correct'});
	thisPanel.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds
	dropboxData.fileName = 'tabs.json';
	dropbox.getFileData(dropboxData);
	
}

function handleGetFileData(getDatas){
	console.log("Get data completed!");
	getDatas.dataToSave = [{'title':'New Tab','url':'http://www.urjc.es','id':'1'}];
	if (getDatas.exists){
		console.log("File exists!!!!");
		console.log("DATAS GOT " + JSON.stringify(getDatas.content));
		for each(var data in getDatas.dataToSave){
			getDatas.content.push(data);
		}
		getDatas.dataToSave = getDatas.content;
	}
	dropbox.writeInFile(getDatas);

}

function handleWriteInFile(writtenResults){
	if (writtenResults.success){
		console.log("Written successfull");
	}
	else{
		console.log("Error writing!!");
	}


}
var panelWithWidget;
exports.main = function(options,callback){

	thisPanel = panel.Panel();
	
	
	thisPanel.write({'msg':'Signed in correctly!','type':'error'});
	timer.setTimeout(hidePanel, 10000);
	
	thisPanel.show();
	console.log("MAIN AFTER SHOW " + thisPanel.showing);
	
	
	thisPanel.write({'msg':'Another message!','type':'info'});
	timer.setTimeout(hidePanel, 5000);
	thisPanel.show();
	
	/*
	panelWithWidget = panel.Panel(true);
	panelWithWidget.write({'msg':'New Panel','type':'info'});
	panelWithWidget.show();
	
	
	//var datas ={};
	//datas.token = "30";
	//datas.fileName = 'file.txt';
	//dropbox.getFileData(datas);
	/*
	dropbox.auth();
	dropbox.on('authComplete',handleAuth);
	dropbox.on('getFileData',handleGetFileData);
	dropbox.on('writeInFile',handleWriteInFile);*/
}

