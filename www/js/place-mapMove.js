function placeMapMove(locate){
	$.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + locate + "&sensor=false",
        data: {name: "long_name"},
        datatype: "json",
            success: function(data){
            	var returnData = data.results[0].geometry.location;
            	var datas = new plugin.google.maps.LatLng(returnData.lat, returnData.lng);
            	map.animateCamera({
			        "target": datas,
			        "zoom": 17,
			        "duration": 1000
			    });
            },
            error: function(data){
                alert("住所の読み込みに失敗しました。");
            }
    });  
}