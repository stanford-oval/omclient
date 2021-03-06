var LDSimpleResponse = require('./LDSimpleResponse');
var LDJSONLoggable = require('./LDJSONLoggable');

function O(e){
	LDJSONLoggable.call(this,e);
	if(!e)return;
	var $=this;
	$.AdminAccount=e['a'];
	$.Account=e['A'];
	$.BlobLinkString=e['p'];
	if(e['d']!=null)$.DecryptedHash=new Buffer(e['d'],'base64');
}
O.prototype=new LDJSONLoggable();
O.prototype.constructor = O;
var _=O.prototype;
_.__type="LDChangeUserProfilePictureRequest";
_.__rt=LDSimpleResponse;
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	LDJSONLoggable.prototype.encode.call($,o);
	if($.AdminAccount!=null)o['a']=$.AdminAccount;
	if($.Account!=null)o['A']=$.Account;
	if($.BlobLinkString!=null)o['p']=$.BlobLinkString;
	if($.DecryptedHash!=null)o['d']=$.DecryptedHash.toString('base64');
	return o;
}
_.AdminAccount=null;
_.Account=null;
_.BlobLinkString=null;
_.DecryptedHash=null;
O.prototype.makeIdpRpc=function(id){
	var o=this.encode(),t=null;
	t={"p":o};o=t;
	t={"#":id,"A":o};o=t;
	t={"q":o};o=t;
	return o;
}

module.exports=O;
