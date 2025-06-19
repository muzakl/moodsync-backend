import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getPlaylistTracks(description) {
    const prompt = `
Suggest 5 popular Spotify tracks (artist and track name) that fit this description: "${description}". 
Format the output as a JSON array like:
[
  {"artist": "Artist1", "track": "Track1"},
  {"artist": "Artist2", "track": "Track2"},
  ...
]
`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const content = response.data.choices[0].message.content;

        const jsonStart = content.indexOf('[');
        const jsonEnd = content.lastIndexOf(']') + 1;
        const jsonString = content.substring(jsonStart, jsonEnd);

        return JSON.parse(jsonString);

    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        throw new Error('Failed to get data from OpenAI');
    }
}

export default getPlaylistTracks;
