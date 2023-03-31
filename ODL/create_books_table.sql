DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER,
  category TEXT,
  type TEXT,
  genre TEXT,
  description TEXT,
  image_url TEXT,
  rating_color TEXT,
  voters TEXT
);
