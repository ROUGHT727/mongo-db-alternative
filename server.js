// --- Bot Data Storage API: server.js ---
// This code is a self-contained Node.js Express server that connects to a 
// PostgreSQL database using the 'pg' library.
// It uses a single table ('bot_data') with a 'key' and a 'data' (JSONB) column
// to provide simple CRUD operations for bot configurations.

const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// --- Database Configuration ---
// The connection string is automatically provided by the hosting platform 
// (like Render) as the DATABASE_URL environment variable.
if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    // For deployment on Render, ensure the database is linked correctly.
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Recommended for production deployments on services like Render
    ssl: {
        rejectUnauthorized: false 
    }
});

// --- Database Initialization ---
// Ensures the required table exists when the server starts.
const INIT_DB = async () => {
    try {
        const client = await pool.connect();
        // The table 'bot_data' is created with:
        // 1. A unique text 'key' (the primary identifier for the bot data, e.g., guild-id).
        // 2. A 'data' column of type JSONB for flexible, schemaless storage.
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS bot_data (
                key TEXT PRIMARY KEY,
                data JSONB NOT NULL
            );
        `;
        await client.query(createTableQuery);
        console.log("Database initialized: 'bot_data' table verified/created.");
        client.release();
    } catch (err) {
        console.error("Error during database initialization:", err.message);
        // The server cannot start without a database connection.
        process.exit(1); 
    }
};

// --- API Endpoints ---

/**
 * Endpoint: GET /data/:key
 * Retrieves the JSON data associated with a specific key.
 */
app.get('/data/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const result = await pool.query('SELECT data FROM bot_data WHERE key = $1', [key]);
        
        if (result.rows.length > 0) {
            // Success: Return the 'data' field (which is the JSONB object)
            res.status(200).json(result.rows[0].data);
        } else {
            // Not Found: The key does not exist
            res.status(404).json({ message: `Data not found for key: ${key}` });
        }
    } catch (err) {
        console.error(`Error retrieving data for key ${key}:`, err.message);
        res.status(500).json({ message: 'Internal server error during data retrieval' });
    }
});

/**
 * Endpoint: POST /data/:key
 * Inserts a new document or updates an existing one (UPSERT operation).
 * The request body MUST be a valid JSON object.
 */
app.post('/data/:key', async (req, res) => {
    const { key } = req.params;
    const data = req.body;
    
    // Simple validation for the body content
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'Request body must contain a non-empty JSON object.' });
    }

    try {
        // SQL UPSERT: Inserts the new row. If the 'key' already exists, it updates 
        // the 'data' column with the new JSON payload.
        const upsertQuery = `
            INSERT INTO bot_data (key, data) 
            VALUES ($1, $2) 
            ON CONFLICT (key) 
            DO UPDATE SET data = $2;
        `;
        
        // Data is passed as a string because JSONB works best when the JS object 
        // is stringified for insertion.
        await pool.query(upsertQuery, [key, JSON.stringify(data)]);
        
        res.status(200).json({ message: `Data successfully saved for key: ${key}` });
    } catch (err) {
        console.error(`Error saving data for key ${key}:`, err.message);
        res.status(500).json({ message: 'Internal server error during data saving' });
    }
});

/**
 * Endpoint: DELETE /data/:key
 * Deletes the data document associated with a specific key.
 */
app.delete('/data/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const result = await pool.query('DELETE FROM bot_data WHERE key = $1 RETURNING key', [key]);

        if (result.rows.length > 0) {
            // Success: A row was actually deleted
            res.status(200).json({ message: `Data successfully deleted for key: ${key}` });
        } else {
            // Not Found: No row matched the key
            res.status(404).json({ message: `Data not found for key: ${key}` });
        }
    } catch (err) {
        console.error(`Error deleting data for key ${key}:`, err.message);
        res.status(500).json({ message: 'Internal server error during data deletion' });
    }
});

// --- Server Startup ---

// Initialize the database connection and table before starting the Express server
INIT_DB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
