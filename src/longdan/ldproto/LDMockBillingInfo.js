function O(e){
	if(!e)return;
	var $=this;
	if(e['j']!=null)$.Junk=new Buffer(e['j'],'base64');
}
var _=O.prototype;
_.__type="LDMockBillingInfo";
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	if($.Junk!=null)o['j']=$.Junk.toString('base64');
	return o;
}
_.Junk=null;

module.exports=O;
