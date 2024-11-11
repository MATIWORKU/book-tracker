# Book Tracker

Book Tracker is a web application that allows users to keep track of the books they have read, including the date finished, personal summaries, and ratings. It's perfect for book lovers who want to organize their reading journey and reflect on their literary adventures.

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [License](#license)
- [Author](#author)

## Features
- Add new books with title, author, date read, summary, and rating.
- Edit existing books.
- Delete books.
- Search for books by title.
- Pagination for search results.
- Filter books by title, date read, or rating.

## Screenshots
![image](https://github.com/user-attachments/assets/c74a1273-6934-43c1-8400-ce84f5f6d704)
![image](https://github.com/user-attachments/assets/421befe8-68b8-4383-82b6-e33381534abf)

## Installation

### Prerequisites
- **Node.js and npm**: Make sure you have Node.js and npm installed. [Download Node.js here](https://nodejs.org/).
- **PostgreSQL**: Install and configure PostgreSQL. This app connects to a PostgreSQL database to store data.

### Steps
1. **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/book-tracker.git
    cd book-tracker
    ```
2. **Install Dependencies:**
    ```bash
    npm install
    ```
3. **Configure Database:**
    Create a PostgreSQL database, and add tables for books and read_books. Update the database configuration in `server.js` to match your local PostgreSQL setup:
    ```javascript
    const db = new pg.Client({
        user: "your_pg_user",
        host: "localhost",
        database: "book_tracker",
        password: "your_pg_password",
        port: 5432
    });
    ```
4. **Run Database Migrations:**
    Set up the tables for the books and read_books:
    ```sql
    CREATE TABLE books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        cover_i VARCHAR(255),
        UNIQUE(title, author_name)
    );

    CREATE TABLE read_books (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        summary TEXT,
        date_read DATE
    );
    ```
5. **Start the Server:**
    ```bash
    nodemon index.js
    ```
6. **Access the Application:**
    Open your web browser and navigate to `http://localhost:3000`.

## Usage

### Add a Book
1. Use the search bar to search for a book.
2. Look for the book and Click on the "Add Book" button.
3. Fill in the book details (date read, summary, rating).
4. Click "Add Book".

### Edit a Book
1. Click the "Edit" button next to a book.
2. Update the book details as needed.
3. Click "Edit Book".

### Delete a Book
1. Click the "Delete" button next to a book.

### Search for a Book
1. Use the search bar at the top to find books by title.

### Filter Books
1. Use the filter buttons (Title, Newest, Best) to organize books.

## Endpoints

- `GET /`: Main endpoint to display books with filtering options.
- `POST /`: Sets the current filter and redirects to the main endpoint.
- `POST /new`: Renders the form to add a new book.
- `POST /add`: Adds a new book to the database.
- `POST /edit`: Renders the form to edit an existing book.
- `POST /edit/book`: Updates an existing book in the database.
- `POST /delete`: Deletes a book from the database.
- `POST /search`: Searches for books by title with pagination.

## Folder Structure
```plaintext
book-tracker
│
├── views
│   ├── index.ejs              # Main template
│   ├── new.ejs                # New book form template
│   ├── search.ejs             # Search results template
│   └── partials
│       ├── header.ejs         # Header partial
│       └── footer.ejs         # Footer partial
│
├── public
│   ├── styles
│   │   └── main.css           # Main stylesheet
│   └── images                 # Image assets
│
├── index.js                   # Main server file
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Technologies Used
- Node.js: JavaScript runtime.

- Express.js: Web application framework.

- EJS: Templating engine.

- PostgreSQL: Relational database.

- CSS: Styling for the front-end.

## License
This project is licensed under the MIT License.

## Author 
Mathewos Worku
