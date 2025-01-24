// "use client";
// import React, { useEffect } from "react";
// import Head from "next/head";
// // import Image from "next/image";
// declare global {
//   interface Window {
//     playSong?: (songSrc: string, songimg: string) => void;
//   }
// }

// function Tranim() {
//   useEffect(() => {
//     window.playSong = playSong;
//     return () => {
//       delete window.playSong;
//     };
//   }, []);

//   return (
//     <div className="container">
//       <Head>
//         <title>Music Player</title>
//         <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
//       </Head>
//       <div className="player">
//         {/* <Image
//           style={{ width: "250px", height: "250px" }}
//           src="https://media.geeksforgeeks.org/wp-content/uploads/20231213162352/music.png"
//           alt="audio player"
//           id="audioPlayerimg"
//         /> */}
//         <br />
//         <audio id="audioPlayer" className="w-100" controls>
//           Your browser does not support the audio element.
//         </audio>
//       </div>
//       <div id="search_song">
//         <label htmlFor="Search">Search Song:</label>
//         <input type="text" id="Search" onInput={SearchSongs} placeholder="Enter song name" />
//         <button onClick={SearchSongs}>Search</button>
//       </div>

//       <ul id="playlist" className="list-group"></ul>
//       <style jsx>{`
//         .container {
//           font-family: "Arial", sans-serif;
//           margin: 50px;
//         }
//         #search_song {
//           text-align: center;
//         }
//         .player {
//           text-align: center;
//           width: 100%;
//           max-width: 400px;
//           margin: 20px auto;
//         }
//         #playlist {
//           list-style: none;
//           padding: 0;
//         }
//         #playlist li {
//           margin: 5px;
//           cursor: pointer;
//           transition: transform 0.3s ease-in-out;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }
//         #playlist li:hover {
//           transform: scale(1.1);
//         }
//       `}</style>
//     </div>
//   );
// }

// function playSong(songSrc: string, songimg: string) {
//   const audioPlayer = document.getElementById("audioPlayer") as HTMLAudioElement;
//   const audioPlayerimg = document.getElementById("audioPlayerimg") as HTMLImageElement;

//   document.querySelectorAll("#playlist li").forEach((item) => {
//     (item as HTMLElement).style.transform = "scale(1)";
//   });

//   if (audioPlayerimg) audioPlayerimg.src = songimg;

//   if (audioPlayer) audioPlayer.src = songSrc;

//   audioPlayer.play();
// }

// function SearchSongs() {
//   const searchElement = document.getElementById("Search") as HTMLInputElement | null;
//   const SearchSong = searchElement ? searchElement.value.toLowerCase() : "";
//   // Saavn API endpoint for searching songs
//   const saavnSearchUrl = "https://saavn.dev/search/songs";

//   // Query parameters for the search
//   const params = {
//     query: SearchSong,
//   };

//   // Request headers
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   // Make the GET request to search for songs
//   fetch(`${saavnSearchUrl}?${new URLSearchParams(params)}`, {
//     method: "GET",
//     headers: headers,
//   })
//     .then((response) => response.json())
//     .then((songData) => {
//       const playlist = document.getElementById("playlist");
//       if (playlist) {
//         playlist.innerHTML = "";
//       }
//       if (playlist) {
//         for (const song of songData.data.results) {
//           const songName = song.name;
//           const artistName = song.primaryArtists;
//           const highestQualityDownloadUrl = song.downloadUrl.find((downloadUrl: { quality: string }) => downloadUrl.quality === "320kbps");
//           const image150x150 = song.image.find((image: { quality: string }) => image.quality === "500x500");
//           playlist.innerHTML += `<li class="list-group-item"
//                   onclick="playSong('${highestQualityDownloadUrl.link}',
//                   '${image150x150.link}')"><span>
//               <img src="${image150x150.link}" style="width:50px; height:50px;">
//               ${songName} by ${artistName}</span>
//               </li>`;
//         }
//       }
//     })
//     .catch((error) => console.error("Error:", error));
// }


function Tranim() {
  return (
    <div>
      <h1>Tranim</h1>
    </div>
  );
}

export default Tranim;
