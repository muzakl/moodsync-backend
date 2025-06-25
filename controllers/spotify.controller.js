import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import qs from 'qs';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = null;

const getSpotifyAccessToken = async () => {
    if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        qs.stringify({ grant_type: 'client_credentials' }),
        {
            headers: {
                Authorization: `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000; // 1 min early
    return accessToken;
};

export const searchSpotifyTracks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Missing query param ?q=' });

        const token = await getSpotifyAccessToken();

        const allTracks = [];

        // Spotify max limit per request is 50
        for (let offset = 0; offset < 200; offset += 50) {
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    q,
                    type: 'track',
                    limit: 50,
                    offset,
                },
            });

            const tracks = response.data.tracks.items.map((track) => ({
                name: track.name,
                artist: track.artists.map((a) => a.name).join(', '),
                url: track.external_urls?.spotify || '',
                preview_url: track.preview_url || '',
                album_image: track.album.images[0]?.url,
            }));


            allTracks.push(...tracks);

            // Stop if fewer than 50 tracks returned
            if (response.data.tracks.items.length < 50) break;
        }

        res.json({ tracks: allTracks });
    } catch (err) {
        console.error('❌ Spotify Error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
        });
        res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
    }
};
