// utils/fetchSpotifyTracks.js
import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';
dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = null;

const getSpotifyAccessToken = async () => {
    if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    const token = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        qs.stringify({ grant_type: 'client_credentials' }),
        {
            headers: {
                Authorization: `Basic ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000;

    return accessToken;
};

export const fetchSpotifyTracks = async (query = "lofi chill beats") => {
    const token = await getSpotifyAccessToken();
    const allTracks = [];

    for (let offset = 0; offset < 200; offset += 50) {
        const res = await axios.get("https://api.spotify.com/v1/search", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                q: query,
                type: "track",
                limit: 50,
                offset,
            },
        });

        const items = res.data.tracks.items;

        const simplified = items.map((track, index) => ({
            id: offset + index + 1,
            artist: track.artists.map(a => a.name).join(', '),
            name: track.name,
            duration: "2:30",
            url: track.external_urls?.spotify || '',
            preview_url: track.preview_url || '',
            album_image: track.album.images[0]?.url || null
        }));


        allTracks.push(...simplified);

        if (items.length < 50) break; // last page
    }

    return allTracks;
};
