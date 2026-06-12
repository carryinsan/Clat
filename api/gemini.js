// Vercel Serverless Function for Gemini
// Filepath: api/gemini.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    // Securely access the API key from Vercel Environment Variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server Error: GEMINI_API_KEY environment variable is missing.' });
    }

    // Extract the prompt and schema sent by your frontend
    const { prompt, schema } = req.body;

    if (!prompt || !schema) {
        return res.status(400).json({ error: 'Bad Request: Missing prompt or schema in the request body.' });
    }

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            responseMimeType: "application/json", 
            responseSchema: schema 
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Clean up the response to ensure it parses correctly on the frontend
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        text = text.trim();
        
        // Strip markdown backticks if the model accidentally included them
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        
        const jsonResult = JSON.parse(text.trim());
        
        // Send the clean AI JSON data back to your frontend
        return res.status(200).json(jsonResult);

    } catch (error) {
        console.error("Gemini API Server Error:", error);
        return res.status(500).json({ error: 'Failed to process AI request on the server.' });
    }
}

