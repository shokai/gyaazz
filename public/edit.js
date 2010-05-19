
document.onload = loadPage();

var data;
var currentline = null;

var KC = { tab:9, enter:13, left:37, up:38, right:39, down:40};

function loadPage(){
    var url = location.href+".json";
    $.getJSON(url, function(json) {
	    data = json
	    display();
	});
};

function savePage(){
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
		display();
		currentline = null;
		break;
	    case KC.down:
		alert("down");
		if(currentline < data.lines.length-1){
		    editline(currentline+1);
		}
		break;
	    case KC.up:
		if(currentline > 0){
		    editline(currentline-1);
		}
		break;
	    }
	});

};
