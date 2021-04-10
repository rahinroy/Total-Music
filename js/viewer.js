// const serverURL = "http://localhost:8080"
const serverURL = 'https://twitchmusic.app'


var latestVidTime = -1;
var channelID = -1;
var userID = -1;
var isMuted = false;
var lastVol = 0;


$(async function() {


	window.Twitch.ext.onAuthorized(function(auth) {
		console.log(auth.channelId)
		resolve(auth.channelId)
	})

	$(".btn-block").click(function() {
		setTimeout(hider, 250);
	})

	function hider() {
		$(".btn-block").hide();
	}


	initializeSlider();
	let extInfo = await initializeValues();
	channelID = extInfo[0]
	userID = extInfo[1]
	getCurrentSong();

	//testing pubsub stuff
    window.Twitch.ext.listen("global", (target, contentType, message) => {
		console.log(message)
	})

	
});



function initializeValues(){
	return new Promise(function(resolve, reject) {
		window.Twitch.ext.onAuthorized(function(auth) {
			console.log(auth.channelId)
			resolve([auth.channelId, window.Twitch.ext.viewer.id])
		})
	})
}


function updatePlayer(url, title){
	//title scrolling animation
	$("#url").html(title);
	if ($('#url')[0].scrollWidth >=  $(document).width()) {
		$("#url").addClass('temp');
	} else {
		$("#url").removeClass('temp');
	}

	//audio update
	$("#vid").attr("src", url);
	$("#vid")[0].play();
}

async function getCurrentSong(){
	var intervalId = window.setInterval(async function(){
		let data = await getCurrentSongFromServer()
		let receivedTimestamp = parseInt(data[2]);
		let isPlaying = (parseInt(data[3]) == 1)
		console.log(isPlaying)
		if (data[0] !== $("#vid").attr("src") && receivedTimestamp > parseInt(latestVidTime)){
			latestVidTime = parseInt(receivedTimestamp)
			let link = data[0]
			let title = data[1]
			await updatePlayer(link, title)
		}
		if (isPlaying){
			$("#vid")[0].play();
		} else {
			$("#vid")[0].pause();
		}
	}, 5000);
}

async function getCurrentSongFromServer(){
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	var urlencoded = new URLSearchParams();
	urlencoded.append("channelID", channelID);
	urlencoded.append("userID", userID);


	var requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: urlencoded,
	redirect: 'follow'
	};

	let data;
	await fetch(serverURL + "/get", requestOptions)
	.then(response => response.json())
	.then(info => data = info);

	console.log(data)
	data = data.split(",")
	return data
}


function initializeSlider(){
	$("#flat-slider").slider()
	.slider({
	    max: 20,
	    min: 0,
	    range: "min",
	    value: 0,
	    change: function (event, ui){
	    	$("#vid").prop('volume', ui.value/20);
	    	if (isMuted && ui.value != 0){
	    		isMuted = false;
				$("#down").html("volume_down")
	    	}
	    	if (!isMuted && ui.value < 11){
	    		$("#down").html("volume_down")
	    	}
	    	if (!isMuted && ui.value == 0){
	    		$("#down").html("volume_mute")
	    	}
	    	if (!isMuted && ui.value > 10){
	    		$("#down").html("volume_up")
	    	}

	    }
	})
	.slider("pips", {
	    first: "pip",
	    last: "pip"
	});

	$("#vid").prop('volume', $("#flat-slider").slider("value")/20)

	$("#down").on('click', function(){
		if (!isMuted){
			isMuted = true;
			lastVol = $("#flat-slider").slider("value");
			$("#flat-slider").slider("value", 0);
			$("#down").prop('volume', 0);
			$("#down").html("volume_off")
		} else {
			$("#down").prop('volume', lastVol)
			if (lastVol > 10){
				$("#down").html("volume_up")
			} else if (lastVol > 0){
				$("#down").html("volume_down")
			} else {
				$("#down").html("volume_mute")
			}
			$("#flat-slider").slider("value", lastVol);
			isMuted = false;
		}
	})
}


function initializeTheme(){
	$("body").addClass("sun")
// $("#flat-slider.ui-slider").css("background", "#d5cebc");
	// $("#flat-slider.ui-slider .ui-slider-line").css("background", "#d5cebc");
	$(".themeWrap").on('click', function() {
		if (isLight) {
			isLight = false;
			$("body").addClass("moon")
			$("body").removeClass("sun")
			$("#theme").html("brightness_3")
//#d5cebc
			$("#flat-slider.ui-slider").css("background", "#d5cebc");
			$("#flat-slider.ui-slider .ui-slider-line").css("background", "#d5cebc");

		} else {
			isLight = true;
			$("body").addClass("sun")
			$("body").removeClass("moon")
			$("#theme").html("brightness_5")
		}
	})
}