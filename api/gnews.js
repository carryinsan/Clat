// Vercel Serverless Function for GNews
// Filepath: api/gnews.js

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
    }

    // Securely access the API key from Vercel Environment Variables
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
    
    if (!GNEWS_API_KEY) {
        return res.status(500).json({ error: 'Server Error: GNEWS_API_KEY environment variable is missing.' });
    }

    const query = encodeURIComponent("Supreme Court OR High Court OR Law OR Constitution OR India Policy");
    const url = `https://gnews.io/api/v4/search?q=${query}&country=in&lang=en&max=10&apikey=${GNEWS_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Handle GNews API errors
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        // Send successful data back to your frontend
        return res.status(200).json(data);
    } catch (error) {
        console.error("GNews API Error:", error);
        return res.status(500).json({ error: 'Failed to fetch news from the upstream server.' });
    }
}


