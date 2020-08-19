var ytdl = require('ytdl-core');
var ytpl = require('ytpl');
var ret;

exports.handler = async function(event, context, callback) {

  const youLink = event.queryStringParameters.url;
  if (ytpl.validateURL(youLink)){
    var p = await ytpl(youLink)
    var arr = [];
    for (var x = 0; x < p.items.length; x++){
      arr.push(p.items[x].url_simple)
    }
    // return arr;
    ret = arr;
  } else if (ytdl.validateURL(youLink)){
    var x = await ytdl.getInfo(youLink);
    console.log("done!");
    var url = x.formats[0].url;
    console.log(x.formats[0].url);
    // return x;
    var y = 0;
    while (x.formats[y].qualityLabel != null){
      y++
    }
    url = x.formats[y].url;
    var title = x.playerResponse.videoDetails.title
    var nextUrl = "https://www.youtube.com/watch?v=" + x.related_videos[0].id;
    // return ([url, nextUrl, title]);
    ret = [url, nextUrl, title];
  } else {
    // return ("na");
    ret = "na";
  }
  
  
  
  const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(ret),
    };
    // callback(null, response)
  return response;

  // window.Twitch.ext.send("broadcast", "string", url);
}
