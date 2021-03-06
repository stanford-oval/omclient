var LDListFlaggedUsersResponse = require('./LDListFlaggedUsersResponse');
var LDJSONLoggable = require('./LDJSONLoggable');

function O(e){
	LDJSONLoggable.call(this,e);
	if(!e)return;
	var $=this;
	$.End=e['e'];
	$.Start=e['s'];
	if(e['k']!=null)$.ContinuationKey=new Buffer(e['k'],'base64');
	$.AdminAccount=e['a'];
}
O.prototype=new LDJSONLoggable();
O.prototype.constructor = O;
var _=O.prototype;
_.__type="LDListFlaggedUsersRequest";
_.__rt=LDListFlaggedUsersResponse;
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	LDJSONLoggable.prototype.encode.call($,o);
	if($.End!=null)o['e']=$.End;
	if($.Start!=null)o['s']=$.Start;
	if($.ContinuationKey!=null)o['k']=$.ContinuationKey.toString('base64');
	if($.AdminAccount!=null)o['a']=$.AdminAccount;
	return o;
}
_.End=null;
_.Start=null;
_.ContinuationKey=null;
_.AdminAccount=null;
O.prototype.makeIdpRpc=function(id){
	var o=this.encode(),t=null;
	t={"f":o};o=t;
	t={"#":id,"A":o};o=t;
	t={"q":o};o=t;
	return o;
}

module.exports=O;
