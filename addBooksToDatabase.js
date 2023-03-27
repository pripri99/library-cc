const randomColor = require("randomcolor"); // Import random color generator library
const db = require("./db");
const fs = require("fs");
const axios = require("axios");
//const jsonData = fs.readFileSync("books_data.json", "utf-8");
//const books = JSON.parse(jsonData);

function getRandomHexColor() {
  return randomColor({ luminosity: "random", format: "hex" });
}

function getRandomRatingColor() {
  const colors = ["pink", "yellow", "blue", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getShortDescription(description) {
  if (!description) return "";
  const lines = description.split("\n");
  return lines.slice(0, 2).join("\n");
}
async function addBookToDatabaseFromISBN(isbn) {
  try {
    // Fetch book data from Open Library API

    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
    );
    const data = response.data;
    const book = data[`ISBN:${isbn}`];

    // Define the data types for each column based on the book data
    const columnDataTypes = {
      title: "TEXT NOT NULL",
      author: "TEXT NOT NULL",
      rating: "INTEGER",
      category: "TEXT",
      type: "TEXT",
      genre: "TEXT",
      description: "TEXT",
      synopsis: "TEXT",
      preview_content: "TEXT",
      image_url: "TEXT",
      image_url_small: "TEXT",
      rating_color: "TEXT",
      color: "TEXT",
      voters: "TEXT",
      isbn: "TEXT UNIQUE",
      subjects: "TEXT",
      publish_date: "TEXT",
    };

    // set image_url and image_url_small based on book cover data
    const image_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    const image_url_small = `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`;

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
      const columns = Object.keys(columnDataTypes).join(", ");
      const placeholders = [...Array(Object.keys(columnDataTypes).length)]
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const updateValues = [
        book.title,
        book.authors
          ? book.authors.map((author) => author.name).join(", ")
          : "",
        5, // rating
        book.category,
        book.type,
        book.genre,
        getShortDescription(book.description),
        book.synopsis,
        book.preview_content,
        book.cover ? book.cover.large : image_url,
        book.cover ? book.cover.small : image_url_small,
        getRandomRatingColor(),
        getRandomHexColor(),
        getRandomNumber(1, 5000),
        isbn,
        book.subjects
          ? book.subjects.map((subject) => subject.name).join("; ")
          : null,
        book.publish_date,
      ];
      const updatePlaceholders = Object.keys(columnDataTypes)
        .map((column, index) => `${column}=$${index + 1}`)
        .join(", ");

      // Update the book in the "books" table
      await db.query(
        `INSERT INTO books (${columns}) VALUES (${placeholders})
         ON CONFLICT (isbn) DO UPDATE SET ${updatePlaceholders}`,
        updateValues
      );
      console.log(`Updated book: ${book.title}`);
    }
  } catch (err) {
    console.error(`Failed to insert/update book with ISBN ${isbn}:`, err);
  }
}

async function addBooksFromJSONFile(jsonFilePath) {
  try {
    var newTable = false;
    // Check if the "books" table exists
    const tableCheckResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'books'
      );
    `);

    const tableExists = tableCheckResult.rows[0].exists;

    // If the "books" table does not exist, create it
    if (!tableExists) {
      await createOrUpdateBooksTable();
      newTable = true;
    }
    // Read the JSON file
    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");

    // Parse the JSON content to get the list of ISBNs
    const isbnList = JSON.parse(fileContent);

    // Iterate through the list and call addBookToDatabaseFromISBN for each ISBN
    for (const isbn of isbnList) {
      await addBookToDatabaseFromISBN(isbn);
    }
  } catch (err) {
    console.error(
      "Failed to read ISBNs from JSON file or add books to the database:",
      err
    );
  }
}

async function createOrUpdateBooksTable() {
  // Define the data types for each column based on the book data
  const columnDataTypes = {
    title: "TEXT NOT NULL",
    author: "TEXT NOT NULL",
    rating: "INTEGER",
    category: "TEXT",
    type: "TEXT",
    genre: "TEXT",
    description: "TEXT",
    synopsis: "TEXT",
    preview_content: "TEXT",
    image_url: "TEXT",
    image_url_small: "TEXT",
    rating_color: "TEXT",
    color: "TEXT",
    voters: "TEXT",
    isbn: "TEXT UNIQUE", // Add the UNIQUE constraint to the isbn column
    subjects: "TEXT",
    publish_date: "TEXT",
  };

  // Drop the existing table if it exists
  const dropTableSql = `
    DROP TABLE IF EXISTS books;
  `;
  await db.query(dropTableSql);

  // Create the new table
  const createTableSql = `
    CREATE TABLE books (
      ${Object.entries(columnDataTypes)
        .map(([column, dataType]) => `${column} ${dataType}`)
        .join(", ")}
    );
  `;

  await db.query(createTableSql);
  console.log(`Created the table books`);
}

async function setRandomBooksAsHighlight() {
  try {
    // Set any previously highlighted books to null
    await db.query(`
      UPDATE books
      SET category = NULL
      WHERE category = 'highlight'
    `);

    // Get a random selection of 5 books from the table
    const randomBooks = await db.query(`
      SELECT isbn
      FROM books
      WHERE category IS NULL
      ORDER BY RANDOM()
      LIMIT 5
    `);

    // Set the category of the random books to "highlight"
    await db.query(`
      UPDATE books
      SET category = 'highlight'
      WHERE isbn IN (${randomBooks.rows
        .map((book) => `'${book.isbn}'`)
        .join(",")})
    `);

    console.log(
      `Set category to 'highlight' for ${randomBooks.rowCount} books.`
    );
  } catch (err) {
    console.error("Failed to set random books as highlight:", err);
  }
}

async function setBookAsHighlight(isbn) {
  try {
    const queryResult = await db.query(`
      UPDATE books
      SET category = 'highlight'
      WHERE isbn = '${isbn}'
      AND category != 'highlight'
    `);
    console.log(
      `Set category to 'highlight' for ${queryResult.rowCount} book.`
    );
  } catch (err) {
    console.error(`Failed to set book ${isbn} as highlight:`, err);
  }
}

const jsonFilePath = "./book_isbns.json";

//main ;
async function main(count) {
  try {
    if (count == 0) {
      await createOrUpdateBooksTable(jsonFilePath);
    }
    await addBooksFromJSONFile(jsonFilePath);
    await setRandomBooksAsHighlight();
  } catch (error) {
    console.error(
      "Failed to add books and set random books as highlight:",
      error
    );
  }
}

main(1);

module.exports = {
  addBookToDatabaseFromISBN,
};
