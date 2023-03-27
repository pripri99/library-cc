function formatSubjects(subjects) {
  // split the subjects string by ", " to get an array of individual subjects
  const subjectsArray = subjects.split(", ");

  // create a new array to hold the formatted subjects
  const formattedSubjects = [];

  // iterate over each subject in the subjectsArray
  subjectsArray.forEach((subject) => {
    // split the subject by " " to get an array of words
    const wordsArray = subject.split(" ");

    // iterate over each word in the wordsArray
    wordsArray.forEach((word) => {
      // convert the word to lowercase and remove any punctuation
      const formattedWord = word.toLowerCase().replace(/[^\w\s]/gi, "");

      // if the formatted word isn't already in the formattedSubjects array, push it in
      if (!formattedSubjects.includes(formattedWord)) {
        formattedSubjects.push('"' + formattedWord + '"');
      }
    });
  });

  // return the formattedSubjects array as a string with brackets
  return "[" + formattedSubjects.join(", ") + "]";
}
async function fetchBooks() {
  try {
    const response = await fetch("/api/books");
    const books = await response.json();
    populateBookGrid(books);
  } catch (error) {
    console.error("Failed to fetch books", error);
  }
}
function populateBookGrid(books) {
  const bookGrid = document.getElementById("grid");
  books.forEach((book) => {
    const bookLi = document.createElement("li");
    bookLi.className = "book-item small-12 medium-6 columns";
    bookLi.setAttribute(
      "data-groups",
      formatSubjects(JSON.stringify(book.subjects))
    );
    console.log(formatSubjects(JSON.stringify(book.subjects)));
    bookLi.setAttribute("data-date-created", book.publish_date);
    bookLi.setAttribute("data-title", book.title);
    bookLi.setAttribute("data-color", book.color);

    bookLi.innerHTML = `
      <div class="bk-img">
        <div class="bk-wrapper">
          <div class="bk-book bk-bookdefault">
            <div class="bk-front">
              <div class="bk-cover" style="background-image: url('${book.image_url_small}');"></div>
            </div>
            <div class="bk-back"></div>
            <div class="bk-left"></div>
          </div>
        </div>
      </div>
      <div class="item-details">
        <h3 class="book-item_title">${book.title}</h3>
        <p class="author">by ${book.author} &bull; ${book.publish_date}</p>
        <p>${book.description}</p>
        <a href="#" class="button">Details</a>
      </div>
      <div class="overlay-details">
        <a href="#" class="close-overlay-btn">Close</a>
        <div class="overlay-image">
          <img src="${book.image_url}" alt="Book Cover" />
          <div class="back-color"></div>
        </div>
        <div class="overlay-desc activated">
          <h2 class="overlay_title">${book.title}</h2>
          <p class="author">by ${book.author}</p>
          <p class="published">${book.publish_date}</p>
          <p class="synopsis">${book.synopsis}</p>
          <a href="#" class="button preview">Preview</a>
        </div>
        <div class="overlay-preview">
          <a href="#" class="back-preview-btn">Back</a>
          <h4 class="preview-title">Preview</h4>
          <div class="preview-content">
            ${book.preview_content}
          </div>
        </div>
      </div>
    `;
    bindDisplayBookDetails(bookLi);
    bookGrid.appendChild(bookLi);
  });
}

function bindDisplayBookDetails(bookItem) {
  var $this = $(bookItem);

  $("li.book-item").each(function () {
    var $this = $(this);

    $this
      .find(".bk-front > div")
      .css("background-color", $(this).data("color"));
    $this.find(".bk-left").css("background-color", $(this).data("color"));
    $this.find(".back-color").css("background-color", $(this).data("color"));

    $this.find(".item-details a.button").on("click", function () {
      displayBookDetails($this);
    });
  });
}

// Get Color Attribute
// Set the background book color
$("li.book-item").each(function () {
  var $this = $(this);

  $this.find(".bk-front > div").css("background-color", $(this).data("color"));
  $this.find(".bk-left").css("background-color", $(this).data("color"));
  $this.find(".back-color").css("background-color", $(this).data("color"));

  $this.find(".item-details a.button").on("click", function () {
    displayBookDetails($this);
  });
});

function displayBookDetails(el) {
  var $this = $(el);
  $(".main-container").addClass("prevent-scroll");
  $(".main-overlay").fadeIn();

  $this.find(".overlay-details").clone().prependTo(".main-overlay");

  $("a.close-overlay-btn").on("click", function (e) {
    e.preventDefault();
    $(".main-container").removeClass("prevent-scroll");
    $(".main-overlay").fadeOut();
    $(".main-overlay").find(".overlay-details").remove();
  });

  $(".main-overlay a.preview").on("click", function () {
    $(".main-overlay .overlay-desc").toggleClass("activated");
    $(".main-overlay .overlay-preview").toggleClass("activated");
  });

  $(".main-overlay a.back-preview-btn").on("click", function () {
    $(".main-overlay .overlay-desc").toggleClass("activated");
    $(".main-overlay .overlay-preview").toggleClass("activated");
  });
}

/*
 *  Offcanvas Menu
 */
// Open Offcanvas Menu
$(".main-navigation a").on("click", function () {
  $(".main-container").addClass("nav-menu-open");
  $(".main-overlay").fadeIn();
});

// Close Offcanvas Menu
$(".overlay-full").on("click", function () {
  $(".main-container").removeClass("nav-menu-open");
  $(".main-container").removeClass("prevent-scroll");
  $(this).parent().fadeOut();
  $(this).parent().find(".overlay-details").remove();
});

/*
 *  Shuffle.js for Search, Catagory filter and Sort
 */

// Initiate Shuffle.js
var Shuffle = window.shuffle;

var bookList = function (element) {
  this.element = element;

  this.shuffle = new Shuffle(element, {
    itemSelector: ".book-item",
  });

  this._activeFilters = [];
  this.addFilterButtons();
  this.addSorting();
  this.addSearchFilter();
  this.mode = "exclusive";
};

bookList.prototype.toArray = function (arrayLike) {
  return Array.prototype.slice.call(arrayLike);
};

// Catagory Filter Functions
// Toggle mode for the Catagory filters
bookList.prototype.toggleMode = function () {
  if (this.mode === "additive") {
    this.mode = "exclusive";
  } else {
    this.mode = "additive";
  }
};

// Filter buttons eventlisteners
bookList.prototype.addFilterButtons = function () {
  var options = document.querySelector(".filter-options");
  if (!options) {
    return;
  }
  var filterButtons = this.toArray(options.children);

  filterButtons.forEach(function (button) {
    button.addEventListener("click", this._handleFilterClick.bind(this), false);
  }, this);
};

// Function for the Catagory Filter
bookList.prototype._handleFilterClick = function (evt) {
  var btn = evt.currentTarget;
  var isActive = btn.classList.contains("active");
  var btnGroup = btn.getAttribute("data-group");

  if (this.mode === "additive") {
    if (isActive) {
      this._activeFilters.splice(this._activeFilters.indexOf(btnGroup));
    } else {
      this._activeFilters.push(btnGroup);
    }

    btn.classList.toggle("active");
    this.shuffle.filter(this._activeFilters);
  } else {
    this._removeActiveClassFromChildren(btn.parentNode);

    var filterGroup;
    if (isActive) {
      btn.classList.remove("active");
      filterGroup = Shuffle.ALL_ITEMS;
    } else {
      btn.classList.add("active");
      filterGroup = btnGroup;
    }

    this.shuffle.filter(filterGroup);
  }
};

// Remove classes for active states
bookList.prototype._removeActiveClassFromChildren = function (parent) {
  var children = parent.children;
  for (var i = children.length - 1; i >= 0; i--) {
    children[i].classList.remove("active");
  }
};

// Sort By
// Watching for the select box to change to run
bookList.prototype.addSorting = function () {
  var menu = document.querySelector(".sort-options");
  if (!menu) {
    return;
  }
  menu.addEventListener("change", this._handleSortChange.bind(this));
};

// Sort By function Handler runs on change
bookList.prototype._handleSortChange = function (evt) {
  var value = evt.target.value;
  var options = {};

  function sortByDate(element) {
    return element.getAttribute("data-created");
  }

  function sortByTitle(element) {
    return element.getAttribute("data-title").toLowerCase();
  }

  if (value === "date-created") {
    options = {
      reverse: true,
      by: sortByDate,
    };
  } else if (value === "title") {
    options = {
      by: sortByTitle,
    };
  }

  this.shuffle.sort(options);
};

// Searching the Data-attribute Title
// Advanced filtering
// Waiting for input into the search field
bookList.prototype.addSearchFilter = function () {
  var searchInput = document.querySelector(".shuffle-search");
  if (!searchInput) {
    return;
  }
  searchInput.addEventListener("keyup", this._handleSearchKeyup.bind(this));
};

// Search function Handler to search list
bookList.prototype._handleSearchKeyup = function (evt) {
  var searchInput = document.querySelector(".shuffle-search");
  var searchText = evt.target.value.toLowerCase();

  // Check if Search input has value to toggle class
  if (searchInput && searchInput.value) {
    $(".catalog-search").addClass("input--filled");
  } else {
    $(".catalog-search").removeClass("input--filled");
  }

  this.shuffle.filter(function (element, shuffle) {
    // If there is a current filter applied, ignore elements that don't match it.
    if (shuffle.group !== Shuffle.ALL_ITEMS) {
      // Get the item's groups.
      var groups = JSON.parse(element.getAttribute("data-groups"));
      var isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

      // Only search elements in the current group
      if (!isElementInCurrentGroup) {
        return false;
      }
    }

    var titleElement = element.querySelector(".book-item_title");
    var titleText = titleElement.textContent.toLowerCase().trim();

    return titleText.indexOf(searchText) !== -1;
  });
};

// Wait till dom load to start the Shuffle js funtionality
document.addEventListener("DOMContentLoaded", function () {
  fetchBooks().then(() => {
    window.book_list = new bookList(document.getElementById("grid"));
  });
});
