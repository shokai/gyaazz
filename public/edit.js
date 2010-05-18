
document.onload = loadPage();

var data;
var editline_now = null;

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
    if(editline_now != null){
	data.lines[editline_now] = $('input#line'+editline_now).val();
    }
    edit_html = ''
    for(var i = 0; i < data.lines.length; i++){
	var line = data.lines[i];
	edit_html += '<li class="line" id="line' + i + '">' + line + '</li>';
	$('li#line'+i).die('click');
	//$('li#line'+i).die('keypress');
	new function(i){
	    $('li#line'+i).live('click', function(){
		    editline(i);
		});
	}(i);
    }
    $('#edit').html('<ul>'+edit_html+'</ul>');
};

function editline(num){
    display();
    line = $('li#line'+num);
    line.html('<input type="text" id="line'+num+'" size="30" value="'+line.html()+'">');
    $('input#line'+num).focus();
    line.die('click');
    $('input#line'+num).keypress(function(e){
	if(e.keyCode == KC.enter){
	    display();
	}
	});
    editline_now = num;
};
