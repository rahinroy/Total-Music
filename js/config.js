$(function() {
  $("#flat-slider").slider()
    .slider({
        max: 100,
        min: 0,
        range: "min",
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    });





//   $('#submit').click(async function() {
//       const youLink = $('#link')[0].value.toString();
//     // console.log(youLink)
//     var url = ""
//     AWS.config.update({accessKeyId: 'AKIAJPACPXZ5WGQRB3MQ', secretAccessKey: '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'});
//     if (!AWS.config.region) {
//       AWS.config.update({
//         region: 'us-east-2'
//       });
// }
//     var lambda = new AWS.Lambda();
//     var params = {

//       FunctionName: 'testFunc', /* required */

//       Payload: JSON.stringify(youLink),

//     };

//     await lambda.invoke(params, function(err, data) {

//       if (err) console.log(err, err.stack); // an error occurred

//       else {        url = data.Payload.slice(1,-1);}
//     }).promise().then(data => {
//       // console.log(url);
//       $("#url").text(url);
//       window.Twitch.ext.send("broadcast", "string", url);
//     });
//   });
});