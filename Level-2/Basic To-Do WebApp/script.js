const STORAGE_KEY = "daily-tasks-v1";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const pendingList = document.querySelector("#pendingList");
const completedList = document.querySelector("#completedList");
const pendingEmpty = document.querySelector("#pendingEmpty");
const completedEmpty = document.querySelector("#completedEmpty");
const totalCount = document.querySelector("#totalCount");
const pendingCount = document.querySelector("#pendingCount");
const completedCount = document.querySelector("#completedCount");
const pendingBadge = document.querySelector("#pendingBadge");
const completedBadge = document.querySelector("#completedBadge");
const todayLabel = document.querySelector("#todayLabel");
const taskTemplate = document.querySelector("#taskTemplate");

let tasks = loadTasks();

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

todayLabel.textContent = dayFormatter.format(new Date());
render();

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: createTaskId(),
    title,
    completed: false,
    addedAt: new Date().toISOString(),
    completedAt: null,
  });

  taskInput.value = "";
  saveAndRender();
});

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function createTaskId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The app still works for the current page session if storage is unavailable.
  }

  render();
}

function render() {
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  renderList(pendingList, pendingTasks);
  renderList(completedList, completedTasks);

  totalCount.textContent = tasks.length;
  pendingCount.textContent = pendingTasks.length;
  completedCount.textContent = completedTasks.length;
  pendingBadge.textContent = pendingTasks.length;
  completedBadge.textContent = completedTasks.length;

  pendingEmpty.classList.toggle("visible", pendingTasks.length === 0);
  completedEmpty.classList.toggle("visible", completedTasks.length === 0);
}

function renderList(listElement, taskItems) {
  listElement.replaceChildren();

  taskItems.forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const statusButton = item.querySelector(".status-toggle");
    const title = item.querySelector(".task-title");
    const meta = item.querySelector(".task-meta");
    const editButton = item.querySelector(".edit-button");
    const deleteButton = item.querySelector(".delete-button");

    item.classList.toggle("completed", task.completed);
    title.textContent = task.title;
    meta.textContent = buildMetaText(task);

    statusButton.classList.toggle("is-complete", task.completed);
    statusButton.setAttribute(
      "aria-label",
      task.completed ? `Move ${task.title} to pending tasks` : `Mark ${task.title} complete`
    );

    statusButton.addEventListener("click", () => toggleTask(task.id));
    editButton.addEventListener("click", () => editTask(task.id));
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    listElement.append(item);
  });
}

function buildMetaText(task) {
  const addedText = `Added ${formatDate(task.addedAt)}`;

  if (!task.completedAt) {
    return addedText;
  }

  return `${addedText} - Completed ${formatDate(task.completedAt)}`;
}

function formatDate(value) {
  return dateFormatter.format(new Date(value));
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    const isCompleted = !task.completed;

    return {
      ...task,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
    };
  });

  saveAndRender();
}

function editTask(id) {
  const task = tasks.find((currentTask) => currentTask.id === id);

  if (!task) {
    return;
  }

  const nextTitle = prompt("Edit task", task.title);

  if (nextTitle === null) {
    return;
  }

  const trimmedTitle = nextTitle.trim();

  if (!trimmedTitle) {
    return;
  }

  tasks = tasks.map((currentTask) =>
    currentTask.id === id ? { ...currentTask, title: trimmedTitle } : currentTask
  );

  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}
