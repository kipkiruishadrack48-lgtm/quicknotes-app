
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const charCount = document.querySelector("#char-count");

const STORAGE_KEY = "quicknotes-notes";

let notes = [];

try {
  const savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (Array.isArray(savedNotes)) {
    notes = savedNotes.filter((note) =>
      note &&
      typeof note.id === "string" &&
      typeof note.text === "string" &&
      ["personal", "work", "study"].includes(note.category) &&
      typeof note.createdAt === "string"
    );
  }
} catch (error) {
  console.error("Could not load saved notes:", error);
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    errorMessage.textContent =
      "Unable to save notes in this browser.";
  }
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

function render() {
  notesList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm)
  );

  updateCount();

  if (filteredNotes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-message");

    emptyItem.textContent = searchTerm
      ? "No notes match your search."
      : "No notes to display. Add your first note above.";

    notesList.appendChild(emptyItem);
    return;
  }

  filteredNotes.forEach((note) => {
    const item = document.createElement("li");
    item.classList.add(
      "note-card",
      `category-${note.category}`
    );

    const text = document.createElement("p");
    text.classList.add("note-text");
    text.textContent = note.text;

    const category = document.createElement("span");
    category.classList.add("note-category-label");
    category.textContent = note.category;

    const date = document.createElement("time");
    date.classList.add("note-date");
    date.textContent = note.createdAt;
    date.dateTime = Number.isNaN(Date.parse(note.createdAt))
      ? ""
      : new Date(note.createdAt).toISOString();

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete note: ${note.text.slice(0, 40)}`
    );

    deleteButton.addEventListener("click", () => {
      notes = notes.filter((savedNote) =>
        savedNote.id !== note.id
      );

      saveNotes();
      render();
    });

    item.append(text, category, date, deleteButton);
    notesList.appendChild(item);
  });
}

noteInput.addEventListener("input", () => {
  charCount.textContent =
    `${noteInput.value.length} / 200 characters`;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteInput.value.trim();

  if (!text) {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  const note = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    text: text,
    category: noteCategory.value,
    createdAt: new Date().toLocaleString()
  };

  notes.unshift(note);
  saveNotes();

  errorMessage.textContent = "";
  noteInput.value = "";
  charCount.textContent = "0 / 200 characters";

  render();
  noteInput.focus();
});

searchInput.addEventListener("input", render);

// Optional bonus: Clear All button.
const clearAllButton = document.createElement("button");
clearAllButton.id = "clear-all-btn";
clearAllButton.type = "button";
clearAllButton.textContent = "Clear All";
clearAllButton.hidden = true;

notesList.parentElement.appendChild(clearAllButton);

clearAllButton.addEventListener("click", () => {
  if (notes.length === 0) {
    return;
  }

  const confirmed = confirm(
    "Delete all notes? This action cannot be undone."
  );

  if (confirmed) {
    notes = [];
    saveNotes();
    render();
  }
});

function updateClearAllButton() {
  clearAllButton.hidden = notes.length === 0;
}

// Keep the optional button in sync with the notes array.
const originalRender = render;

render = function () {
  originalRender();
  updateClearAllButton();
};

render();
