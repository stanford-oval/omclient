var LDJSONLoggable = require('./LDJSONLoggable');
var LDFeed = require('./LDFeed');

function O(e){
	LDJSONLoggable.call(this,e);
	if(!e)return;
	var $=this;
	if(e['f']!=null)$.Feed=new LDFeed(e['f']);
}
O.prototype=new LDJSONLoggable();
O.prototype.constructor = O;
var _=O.prototype;
_.__type="LDMessageTerminatedPush";
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	LDJSONLoggable.prototype.encode.call($,o);
	if($.Feed!=null)o['f']=$.Feed.encode();
	return o;
}
_.Feed=null;

module.exports=O;