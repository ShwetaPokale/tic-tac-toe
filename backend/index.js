const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./tic-tac-toe.db');

// Initialize the database
db.serialize(() => {
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0
    )`);

    // Create games table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        opponent_type TEXT,
        result TEXT,
        FOREIGN KEY(player_id) REFERENCES users(id)
    )`);
});

// API to register or fetch a user
app.post('/api/register', (req, res) => {
    const { name, email } = req.body;

    // Check if the user already exists by email
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (row) {
            // User already exists, return their information
            return res.json(row);
        } else {
            // Register a new user
            db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, [name, email], function(err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.status(201).json({
                    id: this.lastID,
                    name,
                    email,
                    wins: 0,
                    losses: 0,
                    draws: 0
                });
            });
        }
    });
});

// API to start a new game
app.post('/api/new-game', (req, res) => {
    const { playerId } = req.body;

    // Initialize a new game
    // Add additional game logic (e.g., opponent selection, board initialization) here
    res.status(200).json({
        message: "Game started",
        board: Array(9).fill(null), // 3x3 Tic-Tac-Toe board initialized with null
        playerId
    });
});

// API to make a move
app.post('/api/move', (req, res) => {
    const { playerId, move } = req.body;

    // Validate and process the move
    // Add move logic (e.g., checking for win, updating board) here
    res.status(200).json({
        message: "Move accepted",
        move // Assuming move is an object containing the position and player symbol (X or O)
    });
});

// API to fetch the leaderboard
app.get('/api/leaderboard', (req, res) => {
    db.all(`SELECT name, email, wins, losses, draws FROM users ORDER BY wins DESC LIMIT 10`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
