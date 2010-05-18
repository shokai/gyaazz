
document.onload = loadPage(location.href+".json");

var data;

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
    var edit_html = '';
    for(var i = 0; i < data.lines.length; i++){
	var line = data.lines[i];
	edit_html += '<li class="line" id="'+i+'">' + line + '</li>'
    }
    $('#edit').html('<ul>'+edit_html+'</ul>');
};
