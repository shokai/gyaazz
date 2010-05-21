
Array.prototype.to_s = function(){return this.join('');};
Array.prototype.flatten = function(){
    result = new Array();
    for(var i = 0; i < this.length; i++){
	item = this[i];
	if($.isArray(item)) for(var j = 0; j < item.length; j++) result.push(item[j]);
	else result.push(item);
    }
    return result;
};

String.prototype.replace_all = function(regex, replace_str, delimiter){
    if(!this.match(regex)) return this;
    tmp = this.split(delimiter);
    result = '';
    for(var i = 0; i < tmp.length; i++){
	var line = '';
	if(i < tmp.length-1) line = tmp[i]+delimiter;
	else line = tmp[i];
	result += line.replace(regex, replace_str);
    }
    return result;
};

String.prototype.indent = function(){
    return this.match(/^( *)/)[1].length;
};