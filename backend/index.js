const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json())

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"79511xyz",
    database:"test"
})

app.get("/",(req,res)=>{
    res.json("Hello from backend")
})

app.get("/books", (req, res) => {
    const query = "SELECT * FROM books";

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query error" }); // Use return to stop execution
        }

        return res.json(results); // Use return to prevent further execution
    });
});
app.post("/books", (req, res) => {
    const { title, description, cover } = req.body;

    if (!title || !description || !cover) {
        return res.status(400).json({ error: "All fields (title, description, cover) are required" });
    }

    const query = "INSERT INTO books (title, description, cover) VALUES (?, ?, ?)";
    db.query(query, [title, description, cover], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database insert error" });
        }
        return res.json({ message: "Book added successfully", bookId: result.insertId });
    });
});

app.patch("/books/:id", (req, res) => {
    console.log("Incoming PATCH request:", req.body); // Debugging

    // Check if req.body exists
    if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
    }

    const { id } = req.params;
    const { title, description, cover } = req.body;

    // Validation: Ensure at least one field is provided for update
    if (!title && !description && !cover) {
        return res.status(400).json({ error: "At least one field (title, description, cover) is required" });
    }

    let query = "UPDATE books SET ";
    const updates = [];
    const values = [];

    if (title) {
        updates.push("title = ?");
        values.push(title);
    }
    if (description) {
        updates.push("description = ?");
        values.push(description);
    }
    if (cover) {
        updates.push("cover = ?");
        values.push(cover);
    }

    query += updates.join(", ") + " WHERE id = ?";
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ error: "Database update error", details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        return res.json({ message: "Book updated successfully" });
    });
});


app.listen(8000, () => {
    console.log("Connected to backend server")
})