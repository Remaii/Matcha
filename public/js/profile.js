function ajax(name) {
	var xhr = new XMLHttpRequest();
	var div = document.getElementById('div');

	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			console.log('res=');
			console.log(xhr.responseText);
			console.log(xhr.responseXML);
			// div.innerHTML = xhr.responseText;
		}
	};
	xhr.open("POST", "/profile");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("name="+name);
}