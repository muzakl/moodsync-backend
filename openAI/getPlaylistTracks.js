// import dotenv from 'dotenv';
// dotenv.config();
// import axios from 'axios';
//
// const AI_API_KEY = process.env.AI_API_KEY;
// //
// // const playlist = [
// //     { id: 1, artist: "Artist 1", track: "Song A", duration: '2:30' },
// //     { id: 2, artist: "Artist 2", track: "Song B", duration: '2:30' },
// //     { id: 3, artist: "Artist 3", track: "Song C", duration: '2:30' },
// //     { id: 4, artist: "Artist 4", track: "Song D", duration: '2:30' },
// //     { id: 5, artist: "Artist 5", track: "Song E", duration: '2:30' },
// // ];
// //
// //
// // async function getPlaylistTracks(description) {
// //     const prompt = `
// // User description: "${description}"
// //
// // Select exactly 3 songs that best match the description.
// // Return a JSON array of objects with "artist", "track", and "duration" fields (format duration as mm:ss).
// // If duration is unknown, use "2:30".
// //
// // Songs:
// // ${playlist.map(s => `- ${s.track} by ${s.artist}`).join('\n')}
// //
// // Answer:
// // `;
// import {fetchSpotifyTracks} from "../utils/fetchSpotifyTracks.js";
//
// async function getPlaylistTracks(description) {
// const playlist = (await fetchSpotifyTracks("lofi chill beats")).slice(0, 80);
//
//     const prompt = `
// User description: "${description}"
//
// Select exactly 50 songs that best match the description.
// Return a JSON array of objects with "artist", "track", and "duration" fields (format duration as mm:ss).
// If duration is unknown, use "2:30".
//
// Songs:
// ${playlist.map(s => `- ${s.track} by ${s.artist}`).join('\n')}
//
// Answer:
// `;
//
//
//     try {
//         const response = await axios.post(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`,
//             {
//                 contents: [
//                     {
//                         role: "user",
//                         parts: [{ text: prompt }],
//                     }
//                 ]
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 }
//             }
//         );
//
//         const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
//
//         if (!text) throw new Error("No response from AI");
//
//         const jsonStart = text.indexOf('[');
//         const jsonEnd = text.lastIndexOf(']') + 1;
//
//         if (jsonStart === -1 || jsonEnd === -1) {
//             throw new Error('No valid JSON array found in AI response');
//         }
//
//         const jsonString = text.substring(jsonStart, jsonEnd);
//
//         let selectedSongs;
//         try {
//             selectedSongs = JSON.parse(jsonString);
//         } catch (parseError) {
//             console.error('Failed to parse AI JSON:', parseError.message);
//             throw new Error('AI returned malformed JSON');
//         }
//
//         return selectedSongs;
//
//     } catch (err) {
//         console.error('Gemini API error:', err.response?.data || err.message);
//
//         if (process.env.NODE_ENV === 'development') {
//             return playlist.slice(0, 50);
//         }
//
//         throw new Error('Failed to get AI matches');
//     }
// }
//
// export default getPlaylistTracks;
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { fetchSpotifyTracks } from '../utils/fetchSpotifyTracks.js';

const AI_API_KEY = process.env.AI_API_KEY;

async function getPlaylistTracks(description) {
    // Get up to 80 Spotify tracks
    const playlist = (await fetchSpotifyTracks("lofi chill beats")).slice(0, 80);

    const prompt = `
User description: "${description}"

From the list below, select exactly 50 songs that best match the description.
Return a JSON array of objects with the following fields:
- "artist"
- "track"
- "duration" (formatted as mm:ss, use "2:30" if unknown)

Songs:
${playlist.map((s, i) => `${i + 1}. ${s.track} by ${s.artist}`).join('\n')}

Answer:
`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No response from AI");

        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('No valid JSON array found in AI response');
        }

        const jsonString = text.substring(jsonStart, jsonEnd);

        let selectedSongs;
        try {
            selectedSongs = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Failed to parse AI JSON:', parseError.message);
            throw new Error('AI returned malformed JSON');
        }

        return selectedSongs;

    } catch (err) {
        console.error('Gemini API error:', err.response?.data || err.message);

        if (process.env.NODE_ENV === 'development') {
            return playlist.slice(0, 50); // fallback to first 50
        }

        throw new Error('Failed to get AI matches');
    }
}

export default getPlaylistTracks;
