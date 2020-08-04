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


$(function() {

  
  // UI loaded
  $("#flat-slider").slider()
    .slider({
        max: 20,
        min: 0,
        range: "min",
        change: function (event, ui){
        	console.log(ui.value);
        	$("#vid").prop('volume', ui.value/20);
        }
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    });

    $("#vid").prop('volume', $("#flat-slider").slider("value")/20)



	document.getElementById('vid').addEventListener('ended', hadEnded ,false);
	
	//update config player
	window.Twitch.ext.listen("broadcast", (x,y,data) => {
		var dataF = JSON.parse(JSON.parse(JSON.stringify(data)))
		if (dataF.length == 2){
			console.log(dataF[0])
			isPaused = false;
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
	    	isPaused = false;
			$("#vid").attr("src", dataF[0]);
			$("#vid").load();
			$("#vid").play();
		} else if (dataF.length == 1){
			var event = dataF[0];
			console.log(event);
			if (event.localeCompare("pause") == 0){
				console.log("wefefe")
				document.getElementById("vid").pause();
			}
			if (event.localeCompare("play") == 0){
				document.getElementById("vid").play();
			}
		}
	});



//submit vid
	$('#submit').click(async function() {
		const youLink = $('#link')[0].value.toString();
		isPlaylist = false;
		await getLink(youLink);
		if (isCorrect){
			if (isPlaylist){
				$('#prev').removeClass('disabled')
			} else {
				$('#prev').addClass('disabled')
			}
			$('#play').removeClass('disabled')
			$('#next').removeClass('disabled')
			console.log(isPlaylist);
			currUrl = url;
			currTitle = title;
			currNextUrl = nextUrl;
			window.Twitch.ext.send("broadcast", "array", [url, title]);
			await getLink(nextUrl);
		} else {
			$("#link").addClass("invalid left-alert");
			$('#modal').modal();
    		$('#modal').modal('open');
		}
	});

	$('#next').click(async () => {
		lastInfo = [currUrl, currTitle]
		if (isLoop){
			window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);
		} else {
			window.Twitch.ext.send("broadcast", "array", [url, title]);
			currUrl = url;
			currTitle = title;
			await getLink(nextUrl);
		}
	})

  	$('#prev').click(async function() {
  		console.log(document.getElementById("vid").currentTime);
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
		  			window.Twitch.ext.send("broadcast", "array", [url, title]);	
		  			await getLink(nextUrl);  				
	  			}
				console.log(currNextUrl);
			} else {
				window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);	
			}
  		} else {
	  		window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);	
  		}
  	})

  	$('#play').click(async function() {
  		if (isPaused){
    		$('.play').html("pause");
    		window.Twitch.ext.send("broadcast", "array", ["play"]);
    		isPaused = false;
    	} else {
    		$('.play').html("play_arrow");
    		window.Twitch.ext.send("broadcast", "array", ["pause"]);
    		isPaused = true;
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
		} else {
  			$('.loop').css('color', "#6441A4");
  			isLoop = true;
		}
  	})

});


//check if ended
async function hadEnded(e) {
	lastInfo = [currUrl, currTitle]
	if (isLoop){
		window.Twitch.ext.send("broadcast", "array", [currUrl, currTitle]);
	} else {
		// await getLink(nextUrl);
		window.Twitch.ext.send("broadcast", "array", [url, title]);
		currUrl = url;
		currTitle = title;
		currNextUrl = nextUrl;
		await getLink(nextUrl);
	}

}

//link getting function and logic
async function getLink(link){

	AWS.config.update({accessKeyId: 'AKIAJPACPXZ5WGQRB3MQ', secretAccessKey: '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'});
	if (!AWS.config.region) {
	  AWS.config.update({
	    region: 'us-east-2'
	  });
	}
	var lambda = new AWS.Lambda();
	var params = {

	  FunctionName: 'testFunc', /* required */

	  Payload: JSON.stringify(link),

	};

	await lambda.invoke(params, function(err, data) {

	  if (err) console.log(err, err.stack);

	}).promise().then(async data => {
		ret = JSON.parse(JSON.parse(JSON.stringify(data.Payload)))
		if (!(ret === "na")){
			isCorrect = true;
			if (ret.join().includes("googlevideo") && !isPlaylist){
				console.log("single")
				//single vid
				url = ret[0]
				nextUrl = ret[1]
				title = ret[2]
			} else if (isPlaylist) {
				//playlist vids
				console.log("midthing")
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
				console.log("playslisititin")
				isPlaylist = true;
				playlistUrlList = ret;
				if (link.split("index=").length == 2){
					pos = link.split("&t=")[0].split("index=")[1] - 1;
				} else {
					pos = 0;
				}
				console.log(playlistUrlList.length)
				if (isShuffle){
					pos = Math.floor(Math.random() * (playlistUrlList.length));
				}
				console.log(pos);
				await getLink(playlistUrlList[pos]);
			}
		} else {
			isCorrect = false;
		}
	});
}