$(function() {
	// window.Twitch.ext.listen("broadcast", (x,y,data) => {
	// 	var dataF = JSON.parse(JSON.parse(JSON.stringify(data)))
	// 	if (dataF.length == 2){
	// 		console.log(dataF);
	// 		$("#url").html(dataF[1]);
	// 		$("#vid").attr("src", dataF[0]);
	// 		$("#vid").load();
	// 		$("#vid").play();
	// 	} else if (dataF.length == 1){
	// 		var event = dataF[0];
	// 		console.log(event);
	// 		if (event.localeCompare("pause") == 0){
	// 			console.log("wefefe")
	// 			document.getElementById("vid").pause();
	// 		}
	// 		if (event.localeCompare("play") == 0){
	// 			document.getElementById("vid").play();
	// 		}
	// 	}
	// });
});