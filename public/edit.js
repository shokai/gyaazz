document.onload = load_page();

var data;
var currentline = null;
var timer_save;

var KC = { tab:9, enter:13, left:37, up:38, right:39, down:40};

function load_page(){
    console.log("load_page");
    var url = location.href+".json";
    $.getJSON(url, function(json) {
	    data = json
	    display();
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
		data.lines[currentline] = $('input#line'+currentline).val();
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
    edit_html = ''
    for(var i = 0; i < data.lines.length; i++){
	var line = data.lines[i];
	edit_html += '<li class="line" id="line' + i + '">' + line + '</li>';
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
    $('#edit').html('<ul>'+edit_html+'</ul>');
};

function save_currentline(){
    if(currentline == null) return;
    var tmp = $('input#line'+currentline).val();
    if(tmp.length < 1){
	delete_line(currentline);
	save_page();
    }
    else{
	if(data.lines[currentline] == tmp) return;
	else data.lines[currentline] = tmp;
	save_page();
    }
};

function editline(num){
    currentline = num;
    line = $('li#line'+num);
    line.html('<input type="text" id="line'+num+'" size="30" value="'+line.html()+'">');
    $('input#line'+num).focus();
    line.die('click');
    $('input#line'+num).keypress(function(e){
	    switch(e.keyCode){
	    case KC.enter:
		save_currentline();
		insert_newline(currentline+1);
		display();
		editline(currentline+1);
		break;
	    }
	});
    $('input#line'+num).keydown(function(e){
	    switch(e.keyCode){
	    case KC.down:
		if(currentline < data.lines.length-1){
		    save_currentline();
		    display();
		    editline(currentline+1);
		}
		break;
	    case KC.up:
		if(currentline > 0){
		    save_currentline();
		    display();
		    editline(currentline-1);
		}		
		break;
	    }
	});
    $('body').click(function(e){
	    if(currentline == null) return;
	    save_currentline();
	    currentline = null;
	    display();
	});
};

function insert_newline(num){
    if(num > data.lines.length || num < 0) return false;
    newlines = new Array();
    for(var i = 0; i < num; i++){
	newlines.push(data.lines[i]);
    }
    newlines.push('');
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