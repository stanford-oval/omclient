var LDGetPokemonMapResponse = require('./LDGetPokemonMapResponse');
var LDJSONLoggable = require('./LDJSONLoggable');

function O(e){
	LDJSONLoggable.call(this,e);
	if(!e)return;
	var $=this;
}
O.prototype=new LDJSONLoggable();
O.prototype.constructor = O;
var _=O.prototype;
_.__type="LDGetPokemonMapRequest";
_.__rt=LDGetPokemonMapResponse;
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	LDJSONLoggable.prototype.encode.call($,o);
	return o;
}
O.prototype.makeClusterRpc=function(id){
	var o=this.encode(),t=null;
	t={"pm":o};o=t;
	t={"#":id,"M":o};o=t;
	t={"q":o};o=t;
	return o;
}

module.exports=O;
