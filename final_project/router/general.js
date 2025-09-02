const express = require('express');
//let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { getBooksPromise } = require("./booksdb.js");

public_users.post("/register", (req,res) => {
  const {username, password}=req.body;
  
  if(!username||!password)  return res.status(400).json({Error:"username oder password müssen eingegeben werden"});

  const user=users.find(user=>user.username===username);
  if(user) return res.status(400).json({Error:"Dieser Benutzername ist bereits vorhanden"});
    const newUser={username,password}
    users.push(newUser);
    return res.status(201).json({message:"Benutzer erfolgreich registriert "+ newUser.username})

});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const books = await getBooksPromise;
        return res.status(200).json(books);
      } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching books." });
      }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn=req.params.isbn;
    if(!isbn){
      return res.status(400).json({error:"Id not found!"});
    }
     try {
          const books = await getBooksPromise;
          const book=books[isbn];
           if(book){
               return res.status(200).json(book);
              
            }else{
               return res.status(400).json({error:"Book not found!"});
            }
          
      } catch (error) {
          return res.status(500).json({ message: "An error occurred while fetching books." });
      }
  
   });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author=req.params.author.toLowerCase();
  if(!author){
    return res.status(400).json({error:"Authot not found!"});
  }
  try {
    const books = await getBooksPromise;

    const bookListByAuthor=Object.values(books).filter(
             (book)=>book.author.toLowerCase()===author
    );
    
    if(bookListByAuthor.length>0){
        return res.status(200).json(bookListByAuthor);
    }
    else {
        return res.status(400).json({error:"Buch nicht gefunden!"});
    }
    
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching books." });
  }
  
  
});


// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title=req.params.title;
  if(!title){
    return res.status(400).json({error:"Title not found!"});
  }
  try {
    const books = await getBooksPromise;

    const booksBytitle=Object.values(books).filter((book)=>book.title===title);
    
    if(booksBytitle.length>0){
        return res.status(200).json(booksBytitle);
    }
    else {
        return res.status(400).json({error:"Buch nicht gefunden!"});
    }
    
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching books." });
  }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  if(!isbn){
    return res.status(400).json({error:"Id nicht gefunden!"});
  }
  const book=books[isbn];
  if(!book){
    return res.status(400).json({error:"Buch nicht gefunden!"});
  }
  const reviews=book.reviews;
  return res.status(200).json(reviews);
});

module.exports.general = public_users;
