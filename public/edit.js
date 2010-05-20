var data;
var currentline = null;
var timer_save, timer_sync;

var KC = { tab:9, enter:13, left:37, up:38, right:39, down:40};
var last_edit_at = new Date();

document.onload = load_page();
document.onload = sync_start();
document.onkeydown = function(e){
    last_edit_at = new Date();
};
document.onmousemove = function(e){
    last_edit_at = new Date();
};

setInterval(function(){
	if(new Date()-last_edit_at > 15000){ // 15秒間操作していない
	    save_currentline();
	    currentline = null;
	    display();
	}
    }, 1000);


function sync_start(){
    if(timer_sync == null){
	timer_sync = setInterval(function(){
		if(currentline == null){
		    load_page(function(){message('sync')});
		}
	    }, 10000);
    }
    return timer_sync;
};

function sync_stop(){
    clearInterval(timer_sync);
    timer_sync = null;
};

function load_page(on_load){
    var url = location.href+".json";
    $.getJSON(url, function(res){
	    changed = false;
	    if(data == null || data.lines.length != res.lines.length) changed = true;
	    if(!changed){
		for(var i = 0; i < data.lines.length; i++){
		    if(data.lines[i] != res.lines[i]){
			changed = true;
			break;
		    }
		}
	    }
	    if(changed){
		data = res;
		display();
		if(typeof(on_load)=='function') on_load();
	    }
	});
};

function message(str){
    $('#status').html(str);
    $('#status').show();
    $('#status').fadeOut(1000);    
};

function save_page(){
    clearTimeout(timer_save);
    timer_save = setTimeout(function(){
	    if(currentline != null){
		val = $('input#line'+currentline).val();
		if(val != null) data.lines[currentline] = val;
	    }
	    var url = location.href+'.json';
	    $.post(url, data, function(res){
		    if(res.error) message(res.message);
		    else if(res.success){
			message(res.message);
		    }
		},'json');
	}, 3000);
};

function display(){
    $('#edit').html('');
    for(var i = 0; i < data.lines.length; i++){
	var line = data.lines[i];
	line = line.replace_all(/\[\[\[(.+)\]\]\]/, '<b>$1</b>', ']]]');
	line = line.replace_all(/\[\[(https?\:[\w\.\~\-\/\?\&\+\=\:\@\%\;\#\%]+)(.jpe?g|.gif|.png)\]\]/, '<img src="$1$2">', ']]');
	line = line.replace_all(/\[\[(https?\:[\w\.\~\-\/\?\&\+\=\:\@\%\;\#\%]+) (.+)\]\]/, '<a href="$1">$2</a>', ']]');
	line = line.replace_all(/\[\[(.+)\]\]/, '<a href="$1">$1</a>', ']]');
	$('#edit').append('<li class="line" id="line' + i + '">' + line.match(/^ *(.*)/)[1] + '</li>');
	$('li#line'+i).css('margin-left', line.match(/^( *)/)[1].length*30);
	$('li#line'+i).die('click');
	$('body').unbind('click');
	new function(i){
	    $('li#line'+i).live('click', function(e){
		    save_currentline();
		    display();
		    editline(i);
		});
	}(i);
    }
    $('#edit').html('<ul>'+$('#edit').html()+'</ul>');

};

function save_currentline(){
    if(currentline == null) return false;
    var tmp = $('input#line'+currentline).val();
    if(tmp == null) return false;
    if(tmp.match(/^[ 	　]*$/)){
	delete_line(currentline);
	save_page();
    }
    else{
	if(data.lines[currentline] == tmp) return false;
	else data.lines[currentline] = tmp;
	save_page();
    }
};

function editline(num){
    if(num < 0 || data.lines.length-1 < num) return false;
    sync_stop();
    currentline = num;
    line = $('li#line'+num);
    line.html('<input type="text" id="line'+num+'" size="140" value="'+data.lines[num]+'">');
    $('input#line'+num).focus();
    line.die('click');
    indent = data.lines[currentline].match(/^( *)/)[1].length;
    $('input#line'+num).caret({start:indent, end:data.lines[currentline].length});
    $('input#line'+num).keypress(function(e){
	    switch(e.keyCode){
	    case KC.enter:
		save_currentline();
		insert_newline(currentline+1, indent);
		display();
		editline(currentline+1);
		break;
	    }
	});
    $('input#line'+num).keydown(function(e){
	    switch(e.keyCode){
	    case KC.down:
		if(e.shiftKey){
		    save_currentline();
		    indent = data.lines[currentline].match(/^( *)/)[1].length;
		    var target;
		    for(var i = currentline+1; i < data.lines.length; i++){
			indent_down = data.lines[i].match(/^( *)/)[1].length;
			if(indent_down < indent) break;
			if(indent_down == indent){
			    target = i;
			    break;
			}
		    }
		    if(target != null){
			line_blocks = [[],[],[],[],[]];
			var i = 0;
			while(i < currentline) line_blocks[0].push(data.lines[i++]);
			line_blocks[1].push(data.lines[i++]);
			for(; i < target; i++){
			    if(indent >= data.lines[i].match(/^( *)/)[1].length) break;
			    line_blocks[1].push(data.lines[i]);
			}
			while(i < target) line_blocks[2].push(data.lines[i++]);
			line_blocks[3].push(data.lines[i++]);
			for(; i < data.lines.length; i++){
			    if(indent >= data.lines[i].match(/^( *)/)[1].length) break;
			    line_blocks[3].push(data.lines[i]);
			}
			while(i < data.lines.length) line_blocks[4].push(data.lines[i++]);
			console.log(line_blocks);
			data.lines = [line_blocks[0], line_blocks[3], line_blocks[2], line_blocks[1], line_blocks[4]].flatten();
			save_page();
			display();
			editline(line_blocks[0].length+line_blocks[3].length+line_blocks[2].length);
		    }
		}
		else if(currentline < data.lines.length-1){
		    save_currentline();
		    display();
		    editline(currentline+1);
		}
		break;
	    case KC.up:
		if(e.shiftKey){
		    save_currentline();
		    indent = data.lines[currentline].match(/^( *)/)[1].length;
		    var target;
		    for(var i = currentline-1; 0 <= i; i--){
			indent_up = data.lines[i].match(/^( *)/)[1].length;
			if(indent_up < indent) break;
			if(indent_up == indent){
			    target = i;
			    break;
			}
		    }
		    if(target != null){
			line_blocks = [[],[],[],[],[]];
			var i = 0;
			while(i < target) line_blocks[0].push(data.lines[i++]);
			line_blocks[1].push(data.lines[i++]);
			for(; i < currentline; i++){
			    if(indent >= data.lines[i].match(/^( *)/)[1].length) break;
			    line_blocks[1].push(data.lines[i]);
			}
			while(i < currentline) line_blocks[2].push(data.lines[i++]);
			line_blocks[3].push(data.lines[i++]);
			for(; i < data.lines.length; i++){
			    if(indent >= data.lines[i].match(/^( *)/)[1].length) break;
			    line_blocks[3].push(data.lines[i]);
			}
			while(i < data.lines.length) line_blocks[4].push(data.lines[i++]);
			data.lines = [line_blocks[0], line_blocks[3], line_blocks[2], line_blocks[1], line_blocks[4]].flatten();
			save_page();
			display();
			editline(line_blocks[0].length);
		    }
		}
		else if(currentline > 0){
		    save_currentline();
		    display();
		    editline(currentline-1);
		}		
		    break;
	    case KC.right:
		if(e.shiftKey){
		    $('input#line'+num).val(' '+$('input#line'+num).val());
		    save_currentline();
		    display();
		    editline(num);
		}
		break;
	    case KC.left:
		if(e.shiftKey){
		    val = $('input#line'+num).val();
		    if(val.match(/^ +/)){
			$('input#line'+num).val(val.replace(/^ (.*)$/, "$1"));
			save_currentline();
			display();
			editline(num);
		    }
		}
		break;
	    }
	});
    $('body').click(function(e){
	    if(currentline == null) return;
	    save_currentline();
	    currentline = null;
	    sync_start();
	    display();
	});
};

function insert_newline(num, indent){
    if(num > data.lines.length || num < 0) return false;
    newlines = new Array();
    for(var i = 0; i < num; i++){
	newlines.push(data.lines[i]);
    }
    var nl = '';
    if(indent){
	for(var j = 0; j < indent; j++){
	    nl += ' ';
	}
    }
    newlines.push(nl);
    for(var i = num; i < data.lines.length; i++){
	newlines.push(data.lines[i]);
    }
    data.lines = newlines;
};

function delete_line(num){
    if(num > data.lines.length-1 || num < 0) return false;
    newlines = new Array();
    for(var i = 0; i < data.lines.length; i++){
	if(i != num) newlines.push(data.lines[i]);
    }
    data.lines = newlines;
    if(data.lines.length < 1) data.lines.push("(empty)");
};

function swap_lines(a, b){
    if(a == b || a < 0 || data.lines.length-1 < a ||
       b < 0 || data.lines.length-1 < b ) return false;
    tmp = data.lines[a];
    data.lines[a] = data.lines[b];
    data.lines[b] = tmp;
    save_page();
    return true;
};
