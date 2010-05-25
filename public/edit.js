var data;
var currentline = null;
var timer_save, timer_sync;

var KC = {tab:9, enter:13, left:37, up:38, right:39, down:40, n:78, p:80};
var last_edit_at = new Date();
var last_input_clicked_at = null;

$(function(){
  load_page();
  sync_start();
  $('body').click(function(e){
	  if(currentline == null) return;
	  if(last_input_clicked_at && new Date()-last_input_clicked_at < 100) return;
	  save_currentline();
	  currentline = null;
	  sync_start();
	  display();
      });
    });

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
    $.getJSON(env.api_uri, function(res){
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
    $('#status').fadeIn('slow', function(){
      $(this).fadeOut(1000);
    });
};

function save_page(){
    clearTimeout(timer_save);
    timer_save = setTimeout(function(){
	    if(currentline != null){
		val = $('input#line'+currentline).val();
		if(val != null) data.lines[currentline] = val;
	    }
	    $.post(env.api_uri, data, function(res){
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
    	$('#edit').append('<li class="line" id="li' + i + '"><span class="line" id="text' +i+ '">' + line.match(/^ *(.*)/)[1] + '</span></li>');
    	$('li#li'+i).css('padding-left', line.indent()*30);
    	$('span#text'+i).die('dblclick');
    	new function(i){
    	    $('span#text'+i).live('dblclick', function(e){
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

function highlight_current_block(color){
  if(currentline == null) return false;
  if(color == null) color = '#fecccc';
  current_block = get_block_indexes(currentline);
  if(current_block.length < 2) return;
  $.each(current_block, function(){ 
    var line_elm = $('li#li'+this);
    line_elm.css({'background-color' : color });
    setTimeout(function(){
     line_elm.animate({'background-color' :'rgb(255, 255, 255)'},
       1000);
    }, 400);
 });
}

function editline(num){
    if(num < 0 || data.lines.length-1 < num) return false;
    sync_stop();
    currentline = num;
    line = $('li#li'+num);
    line.html('<input type="text" id="line'+num+'" size="140" value="'+data.lines[num]+'">');
    
    $('input#line'+num).focus();
    line.die('click');
    $('input#line'+num).click(function(e){
	    last_input_clicked_at = new Date();
	});
    var indent = data.lines[currentline].indent();
    $('input#line'+num).caret({start:indent, end:indent});
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
	    if([KC.up, KC.down].contains(e.keyCode)) e.preventDefault();
	    switch(e.keyCode){
	    case KC.down:
		if(e.ctrlKey){ // swap currentline with downside
		    save_currentline();
		    indent = data.lines[currentline].indent();
		    var target;
		    for(var i = currentline+1; i < data.lines.length; i++){
			indent_down = data.lines[i].indent();
			if(indent_down < indent) break;
			if(indent_down == indent){
			    target = i;
			    break;
			}
		    }
		    if(target != null){
			line_blocks = [data.lines.slice(0,currentline), 
				       get_block_lines(currentline),
				       get_block_lines(target),
				       []];
			line_blocks[3] = data.lines.slice(target+line_blocks[2].length, data.lines.length);
			data.lines = [line_blocks[0], line_blocks[2], line_blocks[1], line_blocks[3]].flatten();
			save_page();
			display();
			editline(line_blocks[0].length+line_blocks[2].length);
			highlight_current_block();
		    }
		}
		else if(e.shiftKey){
		    if(currentline != null && currentline < data.lines.length-1){
			save_currentline();
			var tmp = data.lines[currentline];
			data.lines[currentline] = data.lines[currentline+1];
			data.lines[currentline+1] = tmp;
			display();
			editline(currentline+1);
		    }
		}
		else if(currentline < data.lines.length-1){
		    save_currentline();
		    display();
		    editline(currentline+1);
		}
		break;
	    case KC.up:
		if(e.ctrlKey){ // swap currentline with upside
		    save_currentline();
		    indent = data.lines[currentline].indent();
		    var target;
		    for(var i = currentline-1; 0 <= i; i--){
			indent_up = data.lines[i].indent();
			if(indent_up < indent) break;
			if(indent_up == indent){
			    target = i;
			    break;
			}
		    }
		    if(target != null){
			line_blocks = [data.lines.slice(0, target),
				       get_block_lines(target),
				       get_block_lines(currentline),
				       []];
			line_blocks[3] = data.lines.slice(currentline+line_blocks[2].length, data.lines.length);
			data.lines = [line_blocks[0], line_blocks[2], line_blocks[1], line_blocks[3]].flatten();
			save_page();
			display();
			editline(line_blocks[0].length);
			highlight_current_block();
		    }
		}
		else if(e.shiftKey){
		    if(currentline != null && currentline > 0){
			save_currentline();
			var tmp = data.lines[currentline];
			data.lines[currentline] = data.lines[currentline-1];
			data.lines[currentline-1] = tmp;
			display();
			editline(currentline-1);
		    }
		}
		else if(currentline > 0){
		    save_currentline();
		    display();
		    editline(currentline-1);
		}		
		    break;
	    case KC.right:
		if(e.shiftKey){ // indent right
		    $('input#line'+num).val(' '+$('input#line'+num).val());
		    save_currentline();
		    display();
		    editline(num);
		}
		else if(e.ctrlKey){
		    indexes = get_block_indexes(num);
		    save_currentline();
		    for(var i = 0; i < indexes.length; i++){
			var index = indexes[i];
			data.lines[index] = data.lines[index].replace(/^(.*)$/, " $1");
		    }
		    display();
		    editline(num);
		    highlight_current_block();
		}
		break;
	    case KC.left:
		if(e.shiftKey){ // indent left
		    var val = $('input#line'+num).val();
		    if(val.indent() > 0){
			$('input#line'+num).val(val.replace(/^ (.*)$/, "$1"));
			save_currentline();
			display();
			editline(num);
		    }
		}
		else if(e.ctrlKey){ // block indent
		    var val = $('input#line'+num).val();
		    if(val.indent() > 0){
			indexes = get_block_indexes(num);
			save_currentline();
			for(var i = 0; i < indexes.length; i++){
			    var index = indexes[i];
			    data.lines[index] = data.lines[index].replace(/^ (.*)$/, "$1");
			}
			display();
			editline(num);
			highlight_current_block();
		    }
		}
		break;
	    }
	});
    $('input#line'+num).keyup(function(e){
	    switch(e.keyCode){
	    case KC.n:
		if(e.ctrlKey){
		    if(currentline < data.lines.length-1){
			save_currentline();
			display();
			editline(currentline+1);
		    }
		}
		break;
	    case KC.p:
		if(e.ctrlKey){
		    if(currentline > 0){
			save_currentline();
			display();
			editline(currentline-1);
		    }
		}
		break;
	    }
	});
};


// 指定行から辿ってインデント的に1かたまりになっている列のindexリストを返す
function get_block_indexes(num){
    if(typeof(num) != 'number' || num < 0 || data.lines.length <= num) return false;
    indent = data.lines[num].indent();
    block = [num];
    for(var i = num+1; i < data.lines.length; i++){
	if(indent >= data.lines[i].indent()) break;
	block.push(i);
    }
    return block;
};

// 指定行から、インデント的にひとかたまりの列の本文を配列で返す
function get_block_lines(num){
    indexes = get_block_indexes(num);
    if(!indexes) return false;
    lines = new Array();
    for(var i = 0; i < indexes.length; i++){
	lines.push(data.lines[indexes[i]]);
    }
    return lines;
};

function insert_newline(num, indent){
    if(typeof(num) != 'number' || num > data.lines.length || num < 0) return false;
    data.lines = [data.lines.slice(0, num),
		' '.repeat(indent),
		data.lines.slice(num, data.lines.length)].flatten();
};

function delete_line(num){
    if(typeof(num) != 'number' || num > data.lines.length-1 || num < 0) return false;
    data.lines = [data.lines.slice(0, num), 
		  data.lines.slice(num+1, data.lines.length)].flatten();
    if(data.lines.length < 1) data.lines.push("(empty)");
};

