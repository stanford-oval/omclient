var LDRequestProtocolBase = require('./LDRequestProtocolBase');
var LDGetTopScoresRequest = require('./LDGetTopScoresRequest');
var LDReportScoreRequest = require('./LDReportScoreRequest');
var LDGetHighScoreRequest = require('./LDGetHighScoreRequest');

function O(e){
	LDRequestProtocolBase.call(this,e);
	if(!e)return;
	var $=this;
	if(e['hs']!=null)$.GetHighScoreRequest=new LDGetHighScoreRequest(e['hs']);
	if(e['rs']!=null)$.ReportScoreRequest=new LDReportScoreRequest(e['rs']);
	if(e['ts']!=null)$.GetTopScoresRequest=new LDGetTopScoresRequest(e['ts']);
}
O.prototype=new LDRequestProtocolBase();
O.prototype.constructor = O;
var _=O.prototype;
_.__type="LDDeviceToClusterHighScoreRequestProtocol";
_.encode=function(o){
	if(o===undefined)o={};
	var $=this;
	LDRequestProtocolBase.prototype.encode.call($,o);
	if($.GetHighScoreRequest!=null)o['hs']=$.GetHighScoreRequest.encode();
	if($.ReportScoreRequest!=null)o['rs']=$.ReportScoreRequest.encode();
	if($.GetTopScoresRequest!=null)o['ts']=$.GetTopScoresRequest.encode();
	return o;
}
_.GetHighScoreRequest=null;
_.ReportScoreRequest=null;
_.GetTopScoresRequest=null;

module.exports=O;
