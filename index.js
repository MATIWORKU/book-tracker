import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

// Initialize Express app
const app = express();
const port = 3000;

// Configure database connection
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Your database name",
    password: "Your Password",
    port: 5432
});

// Initialize variables for pagination and filtering
let key;
let offset = 0;
let start = 0; 
let numFound = 0;
let filter = 'title'; 

// connect to the database
db.connect(err => {
    if(err){
        console.error("Connection error", err.stack);
    }else{
        console.log("Connected to database!");
    }
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to add a book to the database
async function addBook(book){
    try{
        try{
            const result =  await db.query(
                "INSERT INTO books (title, author_name, cover_i) VALUES ($1, $2, $3) returning *;",
                [book.title, book.author_name, book.cover_i]
            );
            const book_id = result.rows[0].id;
            try{
                await db.query(
                    "INSERT INTO read_books (book_id, rating, summary, date_read) VALUES ($1, $2, $3, $4)",
                    [book_id, book.rating, book.summary, book.date_read]
                );
                console.log("Book added successfully.");
            }catch (err){
                console.log("OPPS something happened", err.message);
            }
        }catch (err){
            console.log("Book has already been added. Try Again", err.message);
        }  
    }catch (err){
        console.log(err.message);
    }
}

// Function to edit a book in the database
async function editBook(book){
    try{
        const result = await db.query(
            "SELECT * FROM books WHERE title = $1 AND author_name = $2", 
            [book.title, book.author_name]
        );
        const data = result.rows[0];
        const editedBook = {
            title : book.title || data.title,
            author_name : book.author_name || data.author_name,
            date_read : book.date_read,
            summary : book.summary,
            rating : book.rating,
        }
        try{
            await db.query(
                "UPDATE books SET title = $1, author_name = $2 WHERE id = $3",
                [editedBook.title, editedBook.author_name, data.id]
            );
            try{
                await db.query(
                    "UPDATE read_books SET rating = $1, summary = $2, date_read = $3 WHERE book_id = $4",
                    [editedBook.rating, editedBook.summary, editedBook.date_read, data.id]
                )
            }catch (err){
                console.error("Error updating Book Info", err.message);
            }
        }catch (err){
            console.error("Error updating Book", err.message);
        }
    }catch (err){
        console.error("Error!! No Book Found!", err.message);
    }
}

// Function to delete a book from the database
async function deleteBook(book){
    try{
        const result = await db.query(
            "SELECT * FROM books WHERE title = $1 AND author_name = $2", 
            [book.title, book.author_name]
        );
        const data = result.rows[0];
        try{
            await db.query(
                "DELETE FROM read_books WHERE book_id = $1;",
                [data.id]
            );
            try{
                await db.query(
                    "DELETE FROM books WHERE id = $1;",
                    [data.id]
                );
            }catch (err){
                console.error("Error Deleting book", err.message);
            }
        }catch (err){
            console.error("Error Deleting book Info", err.message);
        }
    }catch (err){
        console.error("Error!! No Book Found!", err.message);
    }
    console.log("BOOK Deleted!");
}

// Function to determine cover image key
function getImg(book){
    if(book.cover_i){
        key = 'id';
        book.key = key;
    }else{
        key = 'olid';
        book.key = key;
    }

}

// Function to format date
function formateDate(date, book){ 
     const formatedDate = new Date(date).toISOString().slice(0, 10);
     book.date = formatedDate;
}

// Function to search books with pagination
async function searchBook(title, offset){
    try{
        const params = {
            q: title,
            offset: offset,
        }
        const result = await axios.get("https://openlibrary.org/search.json?fields=cover_edition_key,cover_i,title,author_name&limit=10", { params });
        const data = result.data.docs;
        start = result.data.start;
        numFound = result.data.numFound;
        return data;
        
    }catch (err){
        console.error("Connection Refused.", err.stack);
    } 
}

// Route to render homepage with filtered books
app.get("/", async (req, res) => {
    let orderClause = ''
    if(filter === 'title'){
        orderClause = 'ORDER BY title';
    } else if(filter === 'date_read') {
        orderClause = 'ORDER BY date_read DESC';
    }else{
        orderClause = 'ORDER BY rating DESC';
    }
    const result = await db.query(
        `SELECT title, author_name, cover_i, rating, summary, date_read 
        FROM books 
        JOIN read_books ON read_books.book_id = books.id 
        ${orderClause};`,
    );
    const books = result.rows;
    books.forEach(book => {
        getImg(book);
        formateDate(book.date_read, book)
    });
    
    res.render("index.ejs", {
        books: books,
    });
})

// Route to handle filtering on the homepage
app.post("/", (req, res) => {
    filter = req.body.filter;
    res.redirect("/");
})

// Route to render the new book form
app.post("/new", (req, res) => {
    const title = req.body.title;
    const author_name = req.body.author_name;
    const cover_i = req.body.cover_i;

    res.render("new.ejs", {
        title: title,
        author_name: author_name,
        cover_i: cover_i,
    })
})

// Route to add a new book to the database
app.post("/add", async (req, res) => {
    const book = {
        title : req.body.title,
        author_name : req.body.author_name,
        cover_i: req.body.cover_i,
        date_read : req.body.date_read,
        summary : req.body.summary,
        rating : req.body.rating,
    }
    await addBook(book)
    res.redirect("/");
})

// Route to render the edit book form
app.post("/edit", (req, res) => {
    const book = {
        title : req.body.title,
        author_name : req.body.author_name,
        date_read : req.body.date_read,
        summary : req.body.summary,
        rating : req.body.rating,
    }

    res.render("new.ejs", {
        book: book
    })
})

// Route to update a book in the database
app.post("/edit/book", async (req, res) => {
    
    const book = {
        title : req.body.title,
        author_name : req.body.author_name,
        date_read : req.body.date_read,
        summary : req.body.summary,
        rating : req.body.rating,
    }

    await editBook(book);
    res.redirect("/");
})

// Route to delete a book from the database
app.post("/delete", async (req, res) => {
    const book = {
        title : req.body.title,
        author_name: req.body.author_name
    }
    await deleteBook(book);
    res.redirect("/");
})

// Route to handle search with pagination
app.post("/search", async (req, res) => {
    const title = req.body.title;
    offset = parseInt(req.body.offset) || 0; // Update offset based on form submission
    const books = await searchBook(title, offset);
    if(books){
        books.forEach(book => {
            getImg(book);
            if(!book.cover_i){
                book.cover_i = book.cover_edition_key;
            }
        });
    }
    res.render("search.ejs", {
        books: books,
        offset: offset,
        start: start,
        numFound: numFound,
        query: req.body.title
    })
})

// Start the server
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
})