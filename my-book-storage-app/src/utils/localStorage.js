export const saveBooksToLocalStorage = (books) => {
  localStorage.setItem("books", JSON.stringify(books));
};

export const getBooksFromLocalStorage = () => {
  const storedBooks = localStorage.getItem("books");
  return storedBooks ? JSON.parse(storedBooks) : [];
};
