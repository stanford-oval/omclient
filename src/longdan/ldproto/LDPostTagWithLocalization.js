var LDPostTag = require('./LDPostTag');

function O(e){
	if(!e)return;
	var $=this;
	if(e['pt']!=null)$.PostTag=new LDPostTag(e['pt']);
	$.Localization=e['l'];
}
var _=O.prototype;
_.__type="LDPostTagWithLocalization";
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	if($.PostTag!=null)o['pt']=$.PostTag.encode();
	if($.Localization!=null)o['l']=$.Localization;
	return o;
}
_.PostTag=null;
_.Localization=null;

module.exports=O;
