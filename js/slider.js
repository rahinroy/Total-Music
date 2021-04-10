$(function() {
    let isMuted = false;
    let lastVol = 20;
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

    $("#down").on('click', function(){
        if (!isMuted){
            isMuted = true;
            lastVol = $("#flat-slider").slider("value");
            console.log("last vol is: " + lastVol)
            $("#flat-slider").slider("value", 0);
            $("#vid").prop('volume', 0);
            $("#down").html("volume_off")
        } else {
            isMuted = false;
            $("#down").prop('volume', lastVol)
            if (lastVol > 10){
                $("#down").html("volume_up")
            } else if (lastVol > 0){
                $("#down").html("volume_down")
            } else {
                $("#down").html("volume_mute")
            }
            $("#flat-slider").slider("value", lastVol);
        }
    })
    // $("#down").click();

    // document.getElementById('vid').addEventListener("play", function(){
    //     console.log($("#flat-slider").slider("value"))
    //     $("#vid").prop('volume', lastVol/20)
    // })

});
