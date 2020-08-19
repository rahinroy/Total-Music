var url = "";
var ret = [];
var nextUrl = "";
var playlistUrlList = []; 
var pos = 0;
var title = "";
var isPlaylist = false;
var isPaused = true;
var isShuffle = false;
var isLoop = false;
var lastInfo = ["",""];
var sliderVal = 0;
var currLink = "";
var currUrl = "";
var currTitle = "";
var isCorrect = true;
var currNextUrl = "";
var isMuted = false;
var lastVol = 0;
var isLight = false;
var hasEnded = false;
var counter = 0;
var isLoop = false;

$(function() {

	// (function(i, s, o, g, r, a, m) {
	//     i['GoogleAnalyticsObject'] = r;
	//     i[r] = i[r] || function() {
	//         (i[r].q = i[r].q || []).push(arguments)
	//     }, i[r].l = 1 * new Date();
	//     a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	//     a.async = 1;
	//     a.src = g;
	//     m.parentNode.insertBefore(a, m)
	// })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
	// ga('create', 'UA12345678', 'auto');
	// ga('set', 'anonymizeIp', true);

 //    ga('send', 'event', 'Load', 'Load_'+$("#now").text(), 'PageLoaded');



	document.getElementById('vid').addEventListener("ended", function(){
		hasEnded = true;
	})

	$(".btn-block").click(function() {
		setTimeout(hider, 250);
	})

	function hider() {
		$(".btn-block").hide();
	}
	$("#flat-slider").slider()
	.slider({
	    max: 20,
	    min: 0,
	    range: "min",
	    value: 0,
	    change: function (event, ui){
	    	console.log(ui.value);
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

	window.Twitch.ext.listen("broadcast", (x,y,data) => {
		var dataF = JSON.parse(JSON.parse(JSON.stringify(data)))
		if (dataF.length == 2){
			if ((!isLoop && !(dataF[0] === currUrl)) || (isLoop && hasEnded)){
				ga('send', 'pageview');
				isPaused = false
				// $(".temp:hover").css("animation-play-state", "paused");
				// $(".temp:hover").css("animation-play-state", "running");
				$("#url").removeClass('temp');

				hasEnded = false;
				currUrl = dataF[0]
				console.log(dataF[0])
				console.log(dataF[1]);
				$("#url").html(dataF[1]);
				if ($('#url')[0].scrollWidth >=  $(document).width()) {
					console.log($('#url')[0].scrollWidth)
					console.log($(document).width())
					console.log("big");
					$("#url").addClass('temp');
				} else {
					console.log($('#url')[0].scrollWidth)
					console.log($(document).width())
					$("#url").removeClass('temp');
				}
				$('.play').html("pause");
				$("#vid").attr("src", dataF[0]);
				$("#vid").load();
				if (!isPaused){
					$("#vid").play();
				}
			}
		} else if (dataF.length == 1){
			var event = dataF[0];
			console.log(event);
			if (event.localeCompare("pause") == 0){
				console.log("wefefe")
				document.getElementById("vid").pause();
				isPaused = true;
			}
			if (event.localeCompare("play") == 0){
				document.getElementById("vid").play();
				isPaused = false;
			}
			if (event === "loop1"){
				isLoop = true
			}
			if (event === "loop0"){
				isLoop = false;
			}
		}
	});

	$("#down").click(function(){
		if (!isMuted){
			console.log("efefe")
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

	$("body").addClass("sun")

	// $("#flat-slider.ui-slider").css("background", "#d5cebc");
	// $("#flat-slider.ui-slider .ui-slider-line").css("background", "#d5cebc");
	$(".themeWrap").click(function() {
		if (isLight) {
			console.log("ooakokaoa")
			isLight = false;
			$("body").addClass("moon")
			$("body").removeClass("sun")
			$("#theme").html("brightness_3")
//#d5cebc
			$("#flat-slider.ui-slider").css("background", "#d5cebc");
			$("#flat-slider.ui-slider .ui-slider-line").css("background", "#d5cebc");

		} else {
			console.log("Fefe")
			isLight = true;
			$("body").addClass("sun")
			$("body").removeClass("moon")
			$("#theme").html("brightness_5")
		}
	})
});