
document.onload = loadPage();

var data;
var editline_now;

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
    line.die('click');
    editline_now = num;
};
