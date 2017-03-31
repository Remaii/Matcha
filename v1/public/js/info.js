function refreshMyPic() {
	var div = document.querySelector('#galinfo');
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			div.innerHTML = xhr.responseText;
		}
	}
	xhr.open("get", "/compte/info/mypic", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(null);
}

function deleteImg(path) {
	var xhr = new XMLHttpRequest();

	if (confirm("Vous désirez vraiment supprimée la photo?")) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				// alert('Suppression effectuer')
				refreshMyPic();
			}
		}
		xhr.open("POST", "/compte/info", true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("path=" + path + "&submit=SuppPic");
	}
}

var submit = document.querySelector('#Upload');

submit.addEventListener('click', function(){
	var file = document.querySelector('input[type=file]').files[0];
	var reader = new FileReader();
	var xhr = new XMLHttpRequest();
	var data = null;

	reader.onloadend = function () {
		var data = reader.result;
		data = encodeURIComponent(data);
		if (data) {
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					alert('Upload success');
					refreshMyPic();
				}
			}
			xhr.open("POST", "/compte/info", true);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send("photo=" + data + "&submit=Upload");
		}
	}
	if (file) {
		reader.readAsDataURL(file);
	} else {
		alert('tu n\'a rien upload...');
	}
});