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
var hasStarted = false;
var isMuted = false;
var lastVol = 0;
var loop;
var nowPlaying = "";
var url  = ""
var hasEnded = false;



$(function() {

	document.getElementById('vid').addEventListener("ended", function(){
		hasEnded = true;
	})
  
  // UI loaded
  $("#flat-slider").slider()
    .slider({
        max: 20,
        min: 0,
        value: 0,
        range: "min",
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


	document.getElementById('vid').addEventListener('ended', hadEnded ,false);

	$("#down").click(function(){
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

//submit vid
	$('#submit').click(async function() {
		hasStarted = false;
		clearInterval(loop);


		const youLink = $('#link')[0].value.toString();
		isPlaylist = false;
		// window.Twitch.ext.rig.log(youLink);
		await getLink(youLink);
		// console.log([url, title])

		if (isCorrect){
			if (isPlaylist){
				$('#prev').removeClass('disabled')
			} else {
				$('#prev').addClass('disabled')
			}
			$('#play').removeClass('disabled')
			$('#next').removeClass('disabled')
			currUrl = url;
			currTitle = title;
			currNextUrl = nextUrl;
			looper([url, title]);
			// window.Twitch.ext.send("broadcast", "array", [url, title]);
			await getLink(nextUrl);
			//4caf50
			$(".input-field input:focus").css("border-bottom-color", "#4caf50 !important")
			$(".input-field input:focus").css("box-shadow", "0 1px 0 0 #4caf50 !important")
		} else {
			$("#link").addClass("invalid left-alert");
			$('#modal').modal();
    		$('#modal').modal('open');
		}
	});

	$('#next').click(async () => {
		hasStarted = false;
		clearInterval(loop);

		lastInfo = [currUrl, currTitle]
		if (isLoop){
			looper([currUrl, currTitle]);
		} else {
			looper([url, title]);
			currUrl = url;
			currTitle = title;
			await getLink(nextUrl);
		}
	})

  	$('#prev').click(async function() {
		hasStarted = false;
		clearInterval(loop);

  		if (document.getElementById("vid").currentTime <= 5){
  			if (!isLoop){
	  			currUrl = lastInfo[0];
				currTitle = lastInfo[1];
				pos--;
	  			if (isPlaylist){
	  				if (pos != 0){
		  				pos = pos - 2;
		  			} else {
		  				pos = playlistUrlList.length - 2;
		  			}
		  			await getLink(playlistUrlList[pos])
					looper([url, title]);

		  			// window.Twitch.ext.send("broadcast", "array", [url, title]);	
		  			await getLink(nextUrl);  				
	  			}
			} else {
				looper([currUrl, currTitle]);
				// window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);	
			}
  		} else {
			looper([currUrl, currTitle]);
	  		// window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);	
  		}
  	})

  	$('#play').click(async function() {
  		if (isPaused){
    		$('.play').html("pause");
    		window.Twitch.ext.send("broadcast", "array", ["play"]);
    		isPaused = false;
    		document.getElementById("vid").play();

    	} else {
    		// clearInterval(loop);
    		$('.play').html("play_arrow");
    		window.Twitch.ext.send("broadcast", "array", ["pause"]);
    		isPaused = true;
    		document.getElementById("vid").pause();

    	}
  	});


  	$('#shuffle').click(function() {
  		if (isShuffle){
  			$('.shuffle').css('color', "#9e9e9e");
  			isShuffle = false;
		} else {
  			$('.shuffle').css('color', "#6441A4");
  			isShuffle = true;
		}
  	})


  	$('#loop').click(function() {
  		if (isLoop){
  			$('.loop').css('color', "#9e9e9e");
  			isLoop = false;
  			window.Twitch.ext.send("broadcast", "array", ["loop0"]);
  			$('.loop').addClass("disabled")

		} else {
  			$('.loop').css('color', "#6441A4");
  			isLoop = true;
  			window.Twitch.ext.send("broadcast", "array", ["loop1"]);
  			$('.loop').removeClass("disabled")


		}
  	})

});



//update config player
function updatePlayer(data) {
	console.log(data)
	var dataF = data
	if (dataF.length == 2){
		if ((!isLoop && !(dataF[0] === nowPlaying)) || (isLoop && hasEnded)){
			isPaused = false;
			$('.play').html("pause");

			nowPlaying = dataF[0];
			hasStarted = true;
			hasEnded = false;

			$("#url").html(dataF[1]);
			if ($('#url')[0].scrollWidth >=  $(document).width()) {
				$("#url").addClass('temp');
			} else {
				$("#url").removeClass('temp');
			}
			$("#vid").attr("src", dataF[0]);
			$("#vid").load();
			
			isPaused = false;
			$('.play').html("pause");
			if (!isPaused){
				$("#vid").play();
			}			
		}
	} else if (dataF.length == 1){
		var event = dataF[0];
	}
};


//check if ended
async function hadEnded(e) {
	hasStarted = false;
	clearInterval(loop);
	lastInfo = [currUrl, currTitle]
	if (isLoop){
		looper([currUrl, currTitle]);
		// window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);
	} else {
		// await getLink(nextUrl);
		looper([url, title])
		// window.Twitch.ext.send("broadcast", "array", [url, title]);
		currUrl = url;
		currTitle = title;
		currNextUrl = nextUrl;
		await getLink(nextUrl);
	}

}


function looper(array){
	window.Twitch.ext.rig.log(array);
	console.log("reached looper")
	window.Twitch.ext.send("broadcast", "array", array);
	updatePlayer(array)
	// loop = setInterval(function() {
	// 	window.Twitch.ext.send("broadcast", "array", array);
	// }, 2500)
}


//link getting function and logic
async function getLink(link){
	// console.log(link)

	// url = encodeURIComponent(link)
	// url = "https://od8y9rrew7.execute-api.us-east-2.amazonaws.com/default/testFunc?url=" + url

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	var urlencoded = new URLSearchParams();
	urlencoded.append("link", link);

	var requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: urlencoded,
	redirect: 'follow'
	};

	let data;
	await fetch("http://localhost:3000", requestOptions)
	.then(response => response.json())
	.then(info => data = info);
  
	// data = await data.json()
	// console.log(JSON.stringify(data))
	data = data.substring(2, data.length - 1).split(",")
	// console.log(data)


	// window.Twitch.ext.rig.log(response.json())
      // Examine the text in the response
    
	// window.Twitch.ext.rig.log(data);
	ret = data;
	if (!(ret === "na")){
		isCorrect = true;
		if (ret.join().includes("googlevideo") && !isPlaylist){
			//single vid
			url = ret[0]
			nextUrl = ret[1]
			title = ret[2]
		} else if (isPlaylist) {
			//playlist vids
			url = ret[0]
			if (isShuffle){
				pos = Math.floor(Math.random() * Math.floor(playlistUrlList.length));
				while (playlistUrlList[pos] === url){
					pos = Math.floor(Math.random() * Math.floor(playlistUrlList.length));
				}
			} else {
				pos++;				
			}
			if (pos < playlistUrlList.length){
				nextUrl = playlistUrlList[pos]
			} else {
				nextUrl = playlistUrlList[0]
			}
			title = ret[2]
		} else {
			//is a playlist
			isPlaylist = true;
			playlistUrlList = ret;
			if (link.split("index=").length == 2){
				pos = link.split("&t=")[0].split("index=")[1] - 1;
			} else {
				pos = 0;
			}
			if (isShuffle){
				pos = Math.floor(Math.random() * (playlistUrlList.length));
			}
			await getLink(playlistUrlList[pos]);
		}
	} else {
		isCorrect = false;
	}
}