async function fetchHighlightedBooks() {
  // Fetch book data from API or any other source
  // For demonstration purposes, I'll use an array of book objects
  const response = await fetch("/highlighted-books");
  const books = await response.json();

  const slider = document.querySelector(".book-slide");

  // Iterate through each book and create the corresponding HTML structure
  var counter = 0;
  books.forEach((book) => {
    const bookCell = document.createElement("div");
    bookCell.classList.add("book-cell");
    const ratingColor = book.rating_color || "purple";
    const seeBookColor = `book-${ratingColor}`;
    bookCell.innerHTML = `
        <div class="book-img">
          <img src="${book.image_url}" alt="" class="book-photo" />
        </div>
        <div class="book-content">
          <div class="book-title">${book.title}</div>
          <div class="book-author">by ${book.author}</div>
          <!-- You can add other elements such as rating and voters here -->
          <div class="rate">
            <fieldset class="rating ${ratingColor}">
                  <input type="checkbox" id="star${
                    counter + 1
                  }" name="rating" value="5" />
                  <label class="full" for="star${counter + 1}"></label>
                  <input type="checkbox" id="star${
                    counter + 2
                  }" name="rating" value="4" />
                  <label class="full" for="star${counter + 2}"></label>
                  <input type="checkbox" id="star${
                    counter + 3
                  }" name="rating" value="3" />
                  <label class="full" for="star${counter + 3}"></label>
                  <input type="checkbox" id="star${
                    counter + 4
                  }" name="rating" value="2" />
                  <label class="full" for="star${counter + 4}"></label>
                  <input type="checkbox" id="star${
                    counter + 5
                  }" name="rating" value="1" />
                  <label class="full" for="star${counter + 5}"></label>
                </fieldset>
            <span class="book-voters">${book.voters} voters</span>
          </div>
          <div class="book-sum">${book.description}</div>
          <div class="book-see ${seeBookColor}">See The Book</div>
        </div>
    `;
    counter = counter + 5;
    slider.append(bookCell);
  });

  // Initialize Flickity
  const flkty = new Flickity(".book-slide", {
    cellAlign: "left",
    contain: true,
    wrapAround: true,
    autoPlay: true,
  });

  // Re-initialize Flickity after adding new books
  flkty.reloadCells();
}

// Call the fetchHighlightedBooks function
fetchHighlightedBooks();
