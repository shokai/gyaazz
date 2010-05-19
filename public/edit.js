
document.onload = load_page();

var data;
var currentline = null;

var KC = { tab:9, enter:13, left:37, up:38, right:39, down:40};

function load_page(){
    var url = location.href+".json";
    $.getJSON(url, function(json) {
	    data = json
	    display();
	});
};

function save_page(){
};

function display(){
    edit_html = ''
    for(var i = 0; i < data.lines.length; i++){
	var line = data.lines[i];
	edit_html += '<li class="line" id="line' + i + '">' + line + '</li>';
	$('li#line'+i).die('click');
	new function(i){
	    $('li#line'+i).live('click', function(){
		    save_currentline();
		    display();
		    editline(i);
		});
	}(i);
    }
    $('#edit').html('<ul>'+edit_html+'</ul>');
};

function save_currentline(){
    if(currentline != null){
	data.lines[currentline] = $('input#line'+currentline).val();
    }
    // このタイミングて通信しよう
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

};

function insert_newline(num){
    if(num > data.lines.length || num < 0) return;
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