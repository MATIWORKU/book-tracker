-- SQL Script for Database Setup (query.sql)
-- Here’s the `query.sql` for setting up your PostgreSQL database:

```sql 

-- Create books table 
CREATE TABLE books ( 
    id SERIAL PRIMARY KEY, 
    title VARCHAR(255) NOT NULL, 
    author_name VARCHAR(255) NOT NULL, 
    cover_i VARCHAR(255),
    UNIQUE(title, author_name) 
); 

-- Create read_books table 
CREATE TABLE read_books ( 
    id SERIAL PRIMARY KEY, 
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE, 
    rating INTEGER NOT NULL, 
    summary TEXT, 
    date_read DATE 
);

``` 