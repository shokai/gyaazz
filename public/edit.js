
document.onload = loadPage();

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
	edit_html += '<li class="line" id="line' + i + '">' + line + '</li>';
    }
    $('#edit').html('<ul>' + edit_html + '</ul>');
    for(var i = 0; i < data.lines.length; i++){
	new function(i){
	    $('#line'+i).click(function(e){
		    alert("click"+i);
		});
	}(i);
    }
    
};

function editline(num){
    $('#line'+i)
};
