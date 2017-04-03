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

function toAvatar(path) {
	var xhr = new XMLHttpRequest();

	if (confirm('Vous désirez vraiment faire de cette photo votre avatar ?')) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				refreshMyPic();
			}
		}
		xhr.open("POST", "/compte/info", true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("path=" + path + "&submit=toAvatar");
	}
}

function deleteImg(path) {
	var xhr = new XMLHttpRequest();

	if (confirm("Vous désirez vraiment supprimée la photo?")) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				refreshMyPic();
			}
		}
		xhr.open("POST", "/compte/info", true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("path=" + path + "&submit=SuppPic");
	}
}


(function() {
	var onSuccess = function(geoipResponse) {
		var xhr = new XMLHttpRequest();

		console.log(geoipResponse.city)
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {

			}
		}
		xhr.open("POST", "/compte/info/loc");
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("city=" + geoipResponse.city.names['en'] + "&ip=" + geoipResponse.traits['ip_address'] + "&geoname=" + geoipResponse.city['geoname_id']);
	};
	var onError = function(error) {
		console.log(error);
	};
	return geoip2.insights(onSuccess, onError);
})();

var submit = document.querySelector('#Upload');

submit.addEventListener('click', function(ev){
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
		console.log(file)
	} else {
		alert('tu n\'a rien upload...');
	}
});

var dist = document.querySelector('#distance');

dist.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();
	var city1;
	var city2 = '2996944';//Lyon

	// xhr.onreadystatechange = function() {
	// 	if (xhr.readyState == 4) {
	// 		console.log(xhr.responseText)
	// 	}
	// }
	// xhr.open("get", "http://fr.thetimenow.com/distance-calculator.php?city1=" + city1 + "&city2=" + city2, true);
	// xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// xhr.send(null);
});