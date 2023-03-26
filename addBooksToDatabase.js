const db = require("./db");
const fs = require("fs");

const jsonData = fs.readFileSync("books_data.json", "utf-8");
const books = JSON.parse(jsonData);

const db = require("./db");
const fetch = require("node-fetch");

async function addBookToDatabaseFromISBN(isbn) {
  try {
    // Fetch book data from Open Library API
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
    );
    const data = await response.json();
    const book = data[`ISBN:${isbn}`];

    // Define the data types for each column based on the book data
    const columnDataTypes = {
      id: "SERIAL PRIMARY KEY",
      title: "TEXT NOT NULL",
      author: "TEXT NOT NULL",
      rating: "INTEGER",
      category: "TEXT",
      type: "TEXT",
      genre: "TEXT",
      description: "TEXT",
      image_url: "TEXT",
      rating_color: "TEXT",
      voters: "TEXT",
      isbn: "TEXT",
      subjects: "TEXT",
    };

    // Get the current columns in the "books" table
    const currentColumns = await db.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'books'
    `);
    const existingColumns = currentColumns.rows.map((row) => row.column_name);

    // Add any missing columns to the table
    const missingColumns = Object.keys(columnDataTypes).filter(
      (column) => !existingColumns.includes(column)
    );
    if (missingColumns.length > 0) {
      const alterTableSql = `
        ALTER TABLE books
        ${missingColumns
          .map((column) => `ADD COLUMN ${column} ${columnDataTypes[column]}`)
          .join(", ")}
      `;
      await db.query(alterTableSql);
    }

    if (!book) {
      console.log(`Book with ISBN ${isbn} not found.`);
      const columns = "isbn, title, author, genre";
      const values = [isbn, "unknown", "unknown", "unknown"];
      const updateValues = [isbn, "unknown", "unknown", "unknown"];
      const placeholders = "$1, $2, $3, $4";
      const updatePlaceholders = "title=$2, author=$3, genre=$4";
      await db.query(
        `INSERT INTO books (${columns}) VALUES (${placeholders})
         ON CONFLICT (isbn) DO UPDATE SET ${updatePlaceholders}`,
        values.concat(updateValues.slice(1))
      );
      console.log(`Inserted book with ISBN ${isbn}`);
    } else {
      // Generate the update query dynamically
      const columns = Object.keys(book).concat(["isbn", "subjects"]).join(", ");
      const placeholders = [...Array(Object.keys(book).length + 2)]
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const updateValues = Object.values(book).concat(
        isbn,
        book.subjects
          ? book.subjects.map((subject) => subject.name).join("; ")
          : null
      );
      const updatePlaceholders = Object.keys(book)
        .map((column, index) => `${column}=$${index + 1}`)
        .join(", ");

      // Update the book in the "books" table
      await db.query(
        `UPDATE books SET ${updatePlaceholders} WHERE isbn=$${
          Object.keys(book).length + 1
        }`,
        updateValues
      );
      console.log(`Updated book: ${book.title}`);
    }
  } catch (err) {
    console.error(`Failed to insert/update book with ISBN ${isbn}:`, err);
  }
}

async function addBooksToDatabase() {
  try {
    // Define the data types for each column based on the JSON data
    const columnDataTypes = {
      id: "SERIAL PRIMARY KEY",
      title: "TEXT NOT NULL",
      author: "TEXT NOT NULL",
      rating: "INTEGER",
      category: "TEXT",
      type: "TEXT",
      genre: "TEXT",
      description: "TEXT",
      image_url: "TEXT",
      rating_color: "TEXT",
      voters: "TEXT",
      isbn: "TEXT",
    };

    // Generate the create table query dynamically
    const createTableSql = `
      DROP TABLE IF EXISTS books;
      CREATE TABLE books (
        ${Object.entries(columnDataTypes)
          .map(([key, type]) => `${key} ${type}`)
          .join(", ")}
      )
    `;

    // Execute the create table query
    await db.query(createTableSql);
    console.log("Created books table");

    for (const book of books) {
      try {
        // Generate the insert query dynamically
        const columns = Object.keys(book).join(", ");
        const placeholders = Object.keys(book)
          .map((_, index) => `$${index + 1}`)
          .join(", ");
        const values = Object.values(book);

        await db.query(
          `INSERT INTO books (${columns}) VALUES (${placeholders})`,
          values
        );
        console.log(`Inserted book: ${book.title}`);
      } catch (err) {
        console.error(`Failed to insert book: ${book.title}`, err);
      }
    }
  } catch (err) {
    console.error("Failed to create books table", err);
  }
}

addBooksToDatabase();
