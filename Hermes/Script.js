let notes = JSON.parse(localStorage.getItem("notes")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];
let currentNoteId = null;

const listContainer = document.getElementById("notesContainer");
const titleInput = document.getElementById("noteTitle");
const contentInput = document.getElementById("noteContent");
const notedate = document.getElementById("note-date");
const searchInput = document.getElementById("searchBar");
const pinBtn = document.getElementById("Pinbtn");
const wordCount = document.getElementById("wordCount");
const trashCount = document.getElementById("trashCount");

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}
function saveTrash() {
  localStorage.setItem("trash", JSON.stringify(trash));
  trashCount.textContent = trash.length;
}

function handleContentInput() {
  updateWordCount();
  autoResizeTextarea();
  if (currentNoteId !== null) {
    updateCurrentNote();
  }
}

function renderNotes() {
  updateSidebarButtons("notes");
  const query = searchInput.value.toLowerCase();
  listContainer.innerHTML = "";
  const pinned = notes.filter(n => n.pinned);
  const other = notes.filter(n => !n.pinned);

  const filtered = [...pinned, ...other].filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.content.toLowerCase().includes(query)
  );

  for (let note of filtered) {
    const div = document.createElement("div");
    div.className = "note-item" + (note.id === currentNoteId ? " active" : "");

    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";
    contentDiv.onclick = () => selectNote(note.id);
    contentDiv.innerHTML = `
      <h4>${note.title || "Untitled"}</h4>
      <small>${note.date}</small>
      ${note.pinned ? '<span class="pin-icon">📌</span>' : ''}
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    };

    div.appendChild(contentDiv);
    div.appendChild(deleteBtn);
    listContainer.appendChild(div);
  }
}

function renderTrash() {
  listContainer.innerHTML = "";
  updateSidebarButtons("trash");
  for (let note of trash) {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `
      <h4>${note.title || "Untitled"}</h4>
      <small>${note.date}</small>
      <button class="restore-btn">Restore</button>
      <button class="perma-delete-btn">Delete Forever</button>
    `;

    div.querySelector(".restore-btn").onclick = () => {
      const restored = { ...note };
      notes.push(restored);
      trash = trash.filter(n => n.id !== note.id);
      saveNotes();
      saveTrash();
      renderNotes();
      selectNote(restored.id);
    };

    div.querySelector(".perma-delete-btn").onclick = () => {
      const confirmDelete = confirm(`Permanently delete "${note.title || "Untitled"}"?`);
      if (!confirmDelete) return;
      trash = trash.filter(n => n.id !== note.id);
      saveTrash();
      renderTrash();
    };

    listContainer.appendChild(div);
  }
}

function selectNote(id) {
  currentNoteId = id;
  const note = notes.find(n => n.id === id);
  document.getElementById("editor").classList.remove("disabled");
  if (!note) return;
  titleInput.value = note.title;
  contentInput.value = note.content;
  notedate.textContent = "Last Edited: " + note.date;
  pinBtn.classList.toggle("active", note.pinned);
  renderNotes();
  updateWordCount();
  autoResizeTextarea();
}

function updateWordCount() {
  const text = contentInput.value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  wordCount.textContent = `${words} words`;
}

function autoResizeTextarea() {
  contentInput.style.height = "auto";
  const maxHeight = 400;
  const newHeight = Math.min(contentInput.scrollHeight, maxHeight);
  contentInput.style.height = newHeight + "px";
  contentInput.style.overflowY = newHeight >= maxHeight ? "auto" : "hidden";
}

function updateCurrentNote() {
  if (currentNoteId === null) return;
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  note.title = titleInput.value;
  note.content = contentInput.value;
  note.date = new Date().toLocaleString();

  notedate.textContent = "Last Edited: " + note.date;
  saveNotes();
  renderNotes();
  updateWordCount();
  autoResizeTextarea();
}

function addNote() {
  const newNote = {
    id: Date.now(),
    title: "",
    content: "",
    date: new Date().toLocaleString(),
    pinned: false
  };
  notes.push(newNote);
  currentNoteId = newNote.id;
  document.getElementById("editor").classList.remove("disabled");
  saveNotes();
  renderNotes();
  selectNote(newNote.id);
}

function clearNotes() {
  if (notes.length === 0) return;
  const confirmClear = confirm("Are you sure you want to delete all notes?");
  if (!confirmClear) return;

  trash.push(...notes.map(n => ({ ...n })));
  notes = [];
  currentNoteId = null;

  titleInput.value = "";
  contentInput.value = "";
  notedate.textContent = "Last Edited: -";
  document.getElementById("editor").classList.add("disabled");
  updateWordCount();
  autoResizeTextarea();

  saveNotes();
  saveTrash();
  renderNotes();
}

function togglePin() {
  if (currentNoteId === null) return;
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;
  note.pinned = !note.pinned;
  saveNotes();
  renderNotes();
  selectNote(note.id);
}

function deleteNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  const confirmDelete = confirm(`Move "${note.title || "Untitled"}" to Trash?`);
  if (!confirmDelete) return;

  trash.push({ ...note });
  notes = notes.filter(n => n.id !== id);

  if (currentNoteId === id) {
    currentNoteId = null;
    titleInput.value = "";
    contentInput.value = "";
    notedate.textContent = "Last Edited: -";
    updateWordCount();
    autoResizeTextarea();
    document.getElementById("editor").classList.add("disabled");
  }

  saveNotes();
  saveTrash();
  renderNotes();
}

function clearTrash() {
  if (trash.length === 0) return;
  const confirmClear = confirm("Are you sure you want to permanently delete all trashed notes?");
  if (!confirmClear) return;
  trash = [];
  saveTrash();
  renderTrash();
}

function handleTyping() {
  if (currentNoteId === null) {
    addNote();
  }
  updateCurrentNote();
  updateWordCount();
  autoResizeTextarea();
}

function updateSidebarButtons(mode) {
  const show = (id) => document.getElementById(id).style.display = "block";
  const hide = (id) => document.getElementById(id).style.display = "none";

  if (mode === "notes") {
    show("addNoteButton");
    show("clearNotesButton");
    show("viewTrashButton");
    hide("viewNotesButton");
    hide("clearTrashButton");
  } else if (mode === "trash") {
    hide("addNoteButton");
    hide("clearNotesButton");
    hide("viewTrashButton");
    show("viewNotesButton");
    show("clearTrashButton");
  }
}

// === Initial render ===
document.addEventListener("DOMContentLoaded", () => {
  renderNotes();
  updateWordCount();
  autoResizeTextarea();
  saveTrash(); // update trash count badge
  searchInput.addEventListener("input", renderNotes); // live search
});