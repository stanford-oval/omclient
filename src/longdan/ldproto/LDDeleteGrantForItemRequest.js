var LDSimpleResponse = require('./LDSimpleResponse');
var LDItemId = require('./LDItemId');

function O(e){
	if(!e)return;
	var $=this;
	if(e['ii']!=null)$.ItemId=new LDItemId(e['ii']);
}
var _=O.prototype;
_.__type="LDDeleteGrantForItemRequest";
_.__rt=LDSimpleResponse;
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	if($.ItemId!=null)o['ii']=$.ItemId.encode();
	return o;
}
_.ItemId=null;
O.prototype.makeClusterRpc=function(id){
	var o=this.encode(),t=null;
	t={"dgfi":o};o=t;
	t={"#":id,"oas":o};o=t;
	t={"q":o};o=t;
	return o;
}

module.exports=O;
