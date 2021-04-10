# Total Music

An extension for Twitch.tv to play music from the audience end to avoid DMCA issues for streamers

Streamer View:
![streamer view](https://i.imgur.com/sBYI3I4.png)

Viewer Perspective:
![viewer POV 1](https://i.imgur.com/Oi0uCOm.png)
![viewer POV 2](https://i.imgur.com/wJvvVQY.png)


## Why?

Twitch is a popular website for livestreaming games and other forms of entertainment. The Digital Millennium Copyright Act (or DMCA) is a law that bans distrubition of copyrighted, unliscened media. As such, streamers have been facing takedown strikes when they play copyrighted music on their stream. Twitch also has a service called "extensions", which are basically just web apps that run on top of streams. This is an extension that effectively allows the streamer to select a youtube video and have the audio play out of the extension. Effectively, it just allows the user and the streamer to sync up youtube videos and listen to music together instead of the streamer illegally broadcasting the music. It hasn't been released (and probably will never be), but it works and was a fun project to work on

## Overall Structure/How it works:

The streamer/broadcaster has a unique panel they can interact with (shown above). When the submit a song, the youtube link gets sent to my server (built in express.js, hosted on Elastic Beanstalk/EC2). The server does some processing to determine the mp4 link of the youtube video, and returns that (as well as some other metadata about the video, like the title). The server also interacts with a SQLite database to store the songs each broadcaster has selected. On the user/viewer end, the extenion makes repeated calls to the server to check what song is playing, and loads/plays whatever song it receives. 

There's also a bunch of really fun and interesting shenanigans that make it work beyond that, but I won't be detailing those here. Message me if you're curious. 


## File Structure:

This repo only has front-end files. 
There's 2 main viewpoints, the streamer end and the viewer end
The streamer/broadcaster end is what the streamer interacts with when selecting songs
The viewer end is what a twitch viewer would see


#### broadcaster side:
live_config.html  
css/live.css  
js/live-config.js 
css/config.css (for slider CSS)
js/slider.js (for slider JS)
+some shared JS packages since twitch doesn't allow imports from CDNs

#### viewer side:
video_component.html  
css/viewer.css  
js/viewer.js  
+some shared JS packages since twitch doesn't allow imports from CDNs

#### other:
everything else is just helper/shared files


## License
[MIT](https://choosealicense.com/licenses/mit/)