
Array.prototype.to_s = function(){return this.join('');};
Array.prototype.flatten = function(nil){
    result = new Array();
    for(var i = 0; i < this.length; i++){
	item = this[i];
	if($.isArray(item)) for(var j = 0; j < item.length; j++) result.push(item[j]);
	else result.push(item);
    }
    return result;
};
Array.prototype.contains = function(obj){
    for(var i = 0; i < this.length; i++){
	if(this[i] == obj) return true;
    }
    return false;
};

String.prototype.replace_all = function(regex, replace_str, delimiter){
    if(!this.match(regex)) return this;
    tmp = this.split(delimiter);
    result = '';
    for(var i = 0; i < tmp.length; i++){
	var line;
	if(i < tmp.length-1) line = tmp[i]+delimiter;
	else line = tmp[i];
	result += line.replace(regex, replace_str);
    }
    return result;
};

String.prototype.indent = function(nil){
    return this.match(/^( *)/)[1].length;
};

String.prototype.repeat = function(num){
    if(typeof(num)!='number' || num < 0) return this;
    result = '';
    for(var i = 0; i < num; i++){
	result += this;
    }
    return result;
};

String.prototype.htmlEscape = function(){
    var span = document.createElement('span');
    var txt =  document.createTextNode('');
    span.appendChild(txt);
    txt.data = this;
    return span.innerHTML;
};
