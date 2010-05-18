
document.onload = loadPage(location.href+".json");

function loadPage(url){
    $.getJSON(url,function(json) {
	    display(json.text);
	    return;
	});
};

function display(text){
    $('#edit').html(text);
}
