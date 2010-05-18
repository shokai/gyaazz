
document.onload = loadPage(location.href+".json");

function loadPage(){
    var url = location.href+".json";
    $.getJSON(url,function(json) {
	    display(json.text);
	    return;
	});
};

function savePage(){
};

function display(text){
    $('#edit').html(text);
};
