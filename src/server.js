
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        process.exit(1);
    }

    console.log("MySQL Database Connected!");
});

app.get("/", (req, res) => {
    res.send("Feedback Management System Backend is Running!");
});

// Submit feedback
app.post("/api/feedback", (req, res) => {

    const { name, email, category, rating, comments } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof category !== "string" || !category.trim() ||
        !Number.isInteger(rating) || rating < 1 || rating > 5 ||
        typeof comments !== "string" || !comments.trim()
    ) {
        return res.status(400).json({
            message: "Please enter valid feedback details."
        });
    }

    const sql = `
        INSERT INTO feedback
        (name, email, category, rating, comments)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name.trim(),
            email.trim(),
            category.trim(),
            rating,
            comments.trim()
        ],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to save feedback."
                });
            }

            res.status(201).json({
                message: "Feedback submitted successfully!",
                id: result.insertId
            });
        }
    );
});

// Get all feedback
app.get("/api/feedback", (req, res) => {

    const sql = `
        SELECT id, name, email, category, rating,
        comments, created_at
        FROM feedback
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to retrieve feedback."
            });
        }

        res.json(results);
    });
});

// Delete feedback
app.delete("/api/feedback/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid feedback ID."
        });
    }

    db.query(
        "DELETE FROM feedback WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Delete failed."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Feedback not found."
                });
            }

            res.json({
                message: "Feedback deleted successfully!"
            });
        }
    );
});

// Feedback statistics
app.get("/api/stats", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS total,
            COALESCE(ROUND(AVG(rating), 1), 0) AS average,
            COALESCE(SUM(
                CASE WHEN rating = 5 THEN 1 ELSE 0 END
            ), 0) AS fiveStar
        FROM feedback
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Statistics failed."
            });
        }

        res.json(results[0]);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
