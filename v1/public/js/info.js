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

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			}
		}
		xhr.open("POST", "/compte/info/loc");
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("city=" + geoipResponse.city.names['en'] + "&la=" + geoipResponse.location['latitude'] + "&lo=" + geoipResponse.location['longitude']);
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
	function convertRad(input){
	        return (Math.PI * input)/180;
	}
	 
	function Distance(lat_a_degre, lon_a_degre, lat_b_degre, lon_b_degre){
	     
	        R = 6378000; //Rayon de la terre en mètre
	 
	    lat_a = convertRad(lat_a_degre);
	    lon_a = convertRad(lon_a_degre);
	    lat_b = convertRad(lat_b_degre);
	    lon_b = convertRad(lon_b_degre);
	     
	    d = R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)))
	    return d;
	}

	function getMyPos(callback) {
		var longitude = 0.00;
		var latitude = 0.00;
		var onSuccess = function(geoipResponse) {
			longitude = geoipResponse.location.longitude;
			latitude = geoipResponse.location.latitude;
			callback(longitude, latitude);
		};
		var onError = function(error) {
			console.log(error);
		};
		return geoip2.insights(onSuccess, onError);
	}

	var lo_lyon = 4.85;
	var la_lyon = 45.75;
	var my_la;
	var my_lo;
	getMyPos(function(longitude, latitude) {
		var d = Distance(latitude, longitude, la_lyon, lo_lyon);
		d = d / 1000;
		alert('tu es å ' + d + ' km de Lyon!');
	});
});