const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return username && username.length >= 3;
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ Error: "Username und password müssen eingegeben werden" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ Error: "Ungültige Anmeldedaten" });
    }

    let accessToken = jwt.sign({
        data: password
    }, 'secret_key', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({ 
        message: "Login erfolgreich", 
        token: accessToken, 
        username: username 
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
     const isbn = req.params.isbn;
    const review = req.body.review; // Body'den al
    const username = req.session.authorization.username; // Session'dan al, body'den DEĞİL

    console.log("ISBN:", isbn);
    console.log("Review from body:", review);
    console.log("Username from session:", username);

    if (!isbn || !review) {
        return res.status(400).json({ 
            Error: "ISBN und review müssen angegeben werden",
            received: { isbn, review }
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({ Error: "Buch konnte nicht gefunden werden" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Review'ı ekle veya güncelle (username session'dan geliyor)
    books[isbn].reviews[username] = review;

    return res.status(200).json({ 
        message: "Review wurde erfolgreich hinzugefügt/aktualisiert",
        book: books[isbn]
    });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    
    if (!isbn) {
        return res.status(400).json({ 
            Error:  "ISBN must be provided" ,
            received: { isbn }
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({ Error: "Book not found" });
    }
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Yorumu sil
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
    } else {
        // Yorum bulunamazsa bu mesajı dön
        return res.status(404).json({ message: "Review not found for this user and book." });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;