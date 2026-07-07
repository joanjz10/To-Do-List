const taskForm =
  document.getElementById(
    "task-form",
  ); /*Busca en el HTML el elemento con id="task-form" (tu <form>) y guarda esa referencia en la variable taskForm. La vamos a necesitar para "escuchar" cuándo el usuario envía el formulario.*/
const taskInput =
  document.getElementById(
    "task-input",
  ); /*Busca en el HTML el elemento con id="task-input" (tu <input>) y guarda esa referencia en la variable taskInput. La vamos a necesitar para obtener el valor que el usuario escribe en el input.*/
const taskList =
  document.getElementById(
    "task-list",
  ); /*Busca en el HTML el elemento con id="task-list" (tu <ul>) y guarda esa referencia en la variable taskList. La vamos a necesitar para agregar nuevas tareas a la lista.*/
const emptyState =
  document.getElementById(
    "empty-state",
  ); /*Busca en el HTML el elemento con id="empty-state" (tu <p>) y guarda esa referencia en la variable emptyState. La vamos a necesitar para mostrar u ocultar el mensaje de "No hay tareas".*/
const filtersContainer = document.getElementById("filters"); /* el <div> que contiene los 3 botones de filtro */

let currentFilter = "all"; /* guarda cuál filtro está activo ahora mismo: "all", "pending" o "completed" */

filtersContainer.addEventListener("click", (event) => {
  const clickedButton = event.target;
  if (!clickedButton.matches("[data-filter]")) return; // si el clic no fue en un botón de filtro, no hacemos nada

  // le quitamos el estilo activo a todos los botones de filtro
  filtersContainer.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.classList.remove("filter-btn-active");
    btn.classList.add("filter-btn");
    btn.setAttribute("aria-pressed", "false");
  });

  // le ponemos el estilo activo solo al botón que clickeaste
  clickedButton.classList.remove("filter-btn");
  clickedButton.classList.add("filter-btn-active");
  clickedButton.setAttribute("aria-pressed", "true");

  currentFilter = clickedButton.dataset.filter; // guardamos "all", "pending" o "completed"
  applyFilter(); // muestra/oculta las tareas según el filtro elegido
  updateEmptyState(); // revisa si con este filtro no queda ninguna tarea visible
});

taskForm.addEventListener("submit", (event) => {
  /* "escucha" el evento de enviar el formulario (submit) y ejecuta la función que le pasamos como segundo argumento cuando eso sucede. La función recibe un objeto event que contiene información sobre el evento que ocurrió. */
  event.preventDefault(); /*evita que la página se recargue al enviar el formulario*/
  
  const taskText =
    taskInput.value.trim(); /* el texto escrito, sin espacios de sobra al inicio/final*/
  if (taskText === "") return; /* si el usuario no escribió nada, no hacemos nada más */

  const taskElement = createTaskElement(taskText);
  taskList.appendChild(taskElement); /* inserta la tarea en la lista <ul> visible */
  applyFilter(); /* respeta el filtro activo por si la tarea nueva debe ocultarse */
  updateEmptyState(); /* revisa si debe ocultar el mensaje de "no hay tareas" */
  saveTasks(); /* guarda el estado actual de las tareas en localStorage */

  taskInput.value = ""; /* limpia el input para escribir la siguiente tarea */
});

const emptyMessages = {
  all: "No hay tareas.",
  pending: "No hay tareas pendientes.",
  completed: "No hay tareas completadas.",
}; // un mensaje distinto según el filtro activo

function updateEmptyState() {
  const allTasks = taskList.querySelectorAll(".task-item"); // todas las tareas, sin importar el filtro
  const visibleTasks = Array.from(allTasks).filter((task) => task.style.display !== "none"); // solo las que se ven con el filtro actual
  emptyState.textContent = emptyMessages[currentFilter]; // ajusta el texto al filtro actual
  emptyState.style.display = visibleTasks.length > 0 ? "none" : "block"; // si hay tareas visibles, lo oculta; si no, lo muestra
}

function applyFilter() {
  const allTasks = taskList.querySelectorAll(".task-item"); // todas las tareas, sin importar el filtro

  allTasks.forEach((task) => {
    const isCompleted = task.classList.contains("completed"); // true o false

    if (currentFilter === "all") {
      task.style.display = "flex"; // se muestran todas
    } else if (currentFilter === "pending") {
      task.style.display = isCompleted ? "none" : "flex"; // oculta las completadas
    } else if (currentFilter === "completed") {
      task.style.display = isCompleted ? "flex" : "none"; // oculta las pendientes
    }
  });
}

function saveTasks() {
  const tasks = []; /* aquí vamos a juntar todas las tareas actuales */

  taskList.querySelectorAll(".task-item").forEach((item) => {
    tasks.push({
      text: item.querySelector(".task-text").textContent, /* el texto de esa tarea */
      completed: item.classList.contains("completed"), /* true o false, según si está completada */
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks)); /* guarda el array como texto en el navegador */
}

function createTaskElement(text) {
  const li =
    document.createElement(
      "li",
    ); /* crea un nuevo elemento <li> en memoria, que todavía no está en el DOM. */
  li.className =
    "task-item"; /* le asigna la clase "task-item" al <li> para que tenga los estilos correctos. */ 


  const checkbox =
    document.createElement(
      "input",
    ); /* crea un nuevo elemento <input> en memoria, que todavía no está en el DOM. */
  checkbox.type = "checkbox"; /* para marcar la tarea como completada */
  checkbox.className =
    "task-checkbox"; /* le asigna la clase "task-checkbox" al <input> para que tenga los estilos correctos. */

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed"); /* agrega o quita la clase "completed" según si el checkbox está marcado o no */
    applyFilter(); /* oculta/muestra la tarea si ya no corresponde al filtro activo */
    updateEmptyState(); /* revisa si tras el cambio no queda ninguna tarea visible */
    saveTasks(); /* guarda el nuevo estado (completada o no) en localStorage */
  });

  const span =
    document.createElement(
      "span",
    ); /* crea un nuevo elemento <span> en memoria, que todavía no está en el DOM. */
  span.className =
    "task-text"; /* le asigna la clase "task-text" al <span> para que tenga los estilos correctos. */
  span.textContent = text; /* le asigna el texto de la tarea al <span> */

  const deleteBtn =
    document.createElement(
      "button",
    ); /* crea un nuevo elemento <button> en memoria, que todavía no está en el DOM. */
  deleteBtn.type =
    "button"; /* para que no envíe el formulario al hacer click */
  deleteBtn.className =
    "btn-delete"; /* le asigna la clase "btn-delete" al <button> para que tenga los estilos correctos. */
  deleteBtn.textContent = "✕"; /* le asigna el texto "✕" al <button> */

  deleteBtn.addEventListener("click", () => {
  li.remove(); // elimina el <li> completo de la página
  updateEmptyState(); // vuelve a revisar si debe mostrarse el mensaje de "no hay tareas"
  saveTasks(); // guarda la lista actualizada (sin la tarea eliminada) en localStorage
});

  li.appendChild(checkbox); /* agrega el <input> al <li> */
  li.appendChild(span); /* agrega el <span> al <li> */
  li.appendChild(deleteBtn); /* agrega el <button> al <li> */

    return li; /* devuelve el <li> completo, listo para ser agregado al DOM */
}

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || []; /* lee lo guardado y lo convierte de texto a array; si no hay nada, usa un array vacío */

  savedTasks.forEach((task) => {
    const taskElement = createTaskElement(task.text); /* crea el <li> igual que al agregar una tarea nueva */

    if (task.completed) {
      taskElement.classList.add("completed"); /* aplica el estilo de tachado si estaba completada */
      taskElement.querySelector(".task-checkbox").checked = true; /* marca el checkbox visualmente */
    }

    taskList.appendChild(taskElement); /* inserta la tarea recuperada en la lista visible */
  });

  applyFilter(); /* aplica el filtro activo (por defecto "all") a las tareas recién cargadas */
  updateEmptyState(); /* revisa si debe mostrarse el mensaje de "no hay tareas" según lo cargado */
}

loadTasks(); /* se ejecuta apenas se carga la página, para mostrar las tareas guardadas */
