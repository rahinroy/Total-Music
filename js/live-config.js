
//server stuff
// const localURL = "http://localhost:8080"
const serverURL = 'https://twitchmusic.app'

//playlist control
var isPlaylist = false;
var playlistURLs = []
var currentPlaylistIndex = 0;

//shuffle
var isShuffle = false;

//loop
var isLoop = false;

//pause/play
var isPaused = true;

//buffers
var nextURL = ""
var pastSongInfo = [] //contains [url, nextURL, title], latest index is newest
var lastSongInfo = []



//twitch auth info
var channelID = -1;


$(function() {
    initializeValues();
    initializeButtons();
    initializeListeners();
});


function initializeValues(){
    window.Twitch.ext.onAuthorized(function(auth) {
        channelID = auth.channelId
    })
}

function initializeButtons(){
    submitButton();
    shuffleButton();
    loopButton();
    pausePlayButton();
    forwardButton();
}

function initializeListeners(){
    document.getElementById('vid').addEventListener('ended', nextVid ,false);
}

//TODO: figure out how pubsub of different exts work
function pubsub(){
    window.Twitch.ext.listen("global", (target, contentType, message) => {
        try {
            console.log(message)
        } catch (e) {
            console.log(e);
        }
    })
}

//https://www.youtube.com/watch?v=pS9y3W10GME
function submitButton(){
    $("#submit").on('click', async function() {
        isPlaylist = false;
        let vidURL = $('#link')[0].value.toString();
        let data = await getVidInfo(vidURL)
        // console.log(data)
        updatePlayer(data)
    })    
}

function shuffleButton(){
    $('#shuffle').on('click', function() {
        if (isShuffle){
            $('.shuffle').css('color', "#9e9e9e");
            isShuffle = false;
      } else {
            $('.shuffle').css('color', "#6441A4");
            isShuffle = true;
      }
    })
}

function loopButton(){
    $('#loop').on('click', function() {
        if (isLoop){
            $('.loop').css('color', "#9e9e9e");
            isLoop = false;
            $('.loop').addClass("disabled")
      } else {
            $('.loop').css('color', "#6441A4");
            isLoop = true;
            $('.loop').removeClass("disabled")
      }
    })
}

function pausePlayButton(){
    $('#play').on('click', function() {
        console.log("clicked")
        let url = $("#vid").attr("src")
        console.log(url)
        let title = $("#url").html();
        console.log(title)
        if (isPaused){
            $('.play').html("pause");
            isPaused = false;
            $("#vid")[0].play();
            updateSongInServer(url, title, true)
        } else {
            $('.play').html("play_arrow");
            isPaused = true;
            $("#vid")[0].pause();
            updateSongInServer(url, title, false)
        }
    });
}

function forwardButton(){
    $('#next').on('click', () => {
        nextVid()
    })
}

//TODO: figure out algo/storage for previous vids
// function previousButton(){
//     $('#prev').on('click', async function() {

//         // let vidURL = nextURL;
//         // let data = 
//         // updatePlayer(data)
//     })
// }


async function nextVid(){
    if (isLoop){
        updatePlayer(pastSongInfo[pastSongInfo.length - 1])
    } else {
        let vidURL = nextURL;
        let data = await getVidInfo(vidURL)
        updatePlayer(data)
    }
} 

//update config player
function updatePlayer(data) {
    let url = data[0]
    nextURL = data[1]
    let title = data[2]

    updateSongInServer(url, title, true)

    $('#play').removeClass('disabled')
    $('#next').removeClass('disabled')
    // $('#prev').removeClass('disabled')

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
    if (isPaused){
        $('#play').click();
    }
};


//add song info to backend so users can sync up
async function updateSongInServer(url, title, isPlaying){
    var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	var urlencoded = new URLSearchParams();
    urlencoded.append("channelID", channelID);
    urlencoded.append("link", url);
    urlencoded.append("title", title);
    urlencoded.append("isPlaying", isPlaying);


	var requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: urlencoded,
	redirect: 'follow'
	};

	let data;
	await fetch(serverURL + "/update", requestOptions)
	.then(response => response.json())
	.then(info => data = info);
}

function invalidLink(){
    return "bees"
}




//link getting function and logic
//@return: [url, nextURL, title]
async function getVidInfo(link){
    let data = await makeVidInfoRequest(link)
    console.log(data)
    data = data.split(",")
    data[0] = parseInt(data[0])
    if (data[0] == 0){ //playlist
        isPlaylist = true;
        for (let i = 1; i < data.length; i++){
            playlistURLs.push(data[i])
        }
        if (isShuffle){
            currentPlaylistIndex = Math.floor(Math.random() * playlistURLs.length)
            await getVidInfo(playlistURLs[currentPlaylistIndex])
        } else {
            currentPlaylistIndex = 0
            await getVidInfo(playlistURLs[currentPlaylistIndex])
        }
    } else if (data[0] == 1 && isPlaylist){ //playing vids in a playlist
        console.log("playlist time")
        let vidInfoToReturn = [] //[url, nextURL, title]
        vidInfoToReturn.push(data[1])
        if (isShuffle){
            currentPlaylistIndex = Math.floor(Math.random() * playlistURLs.length)
        } else {
            if (currentPlaylistIndex + 1 == playlistURLs.length){
                currentPlaylistIndex = 0
            } else {
                currentPlaylistIndex++;
            }
        }
        vidInfoToReturn.push(playlistURLs[currentPlaylistIndex])
        vidInfoToReturn.push(data[3])
        pastSongInfo.push(vidInfoToReturn)
        console.log(vidInfoToReturn)
        updatePlayer(vidInfoToReturn)
        // return vidInfoToReturn;
    } else if (data[0] == 1 && !isPlaylist){ //playing indiv songs
        let vidInfoToReturn = [data[1], data[2], data[3]] //[url, nextURL, title]
        pastSongInfo.push(vidInfoToReturn)
        // return vidInfoToReturn;
        updatePlayer(vidInfoToReturn)
    } else if (data[0] == 2){
        return -1
    }
}

//get info about youtube link
async function makeVidInfoRequest(link){
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
    await fetch(serverURL, requestOptions)
    .then(response => response.json())
    .then(response => data = response)

    console.log(data)
    return await data

}