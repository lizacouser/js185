// Compare object titles alphabetically (case insensitive)
const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

// Return a list of todo lists sorted by their completion status and title
// (case-sensitive). The uncompleted and completed todo lists must be passed
// to the method via the `undone` and `done` arguments.
const sortItems = (undone, done) => {
  undone.sort(compareByTitle);
  done.sort(compareByTitle);
  return [].concat(undone, done);
}

module.exports = {
  sortTodoLists: sortItems,
  sortTodos: sortItems,
};

// // return the list of todo lists sorted by completion status and title.
  // sortTodoLists(todoLists) {
  //   let undone = todoLists.filter(todoList => !todoList.isDone());
  //   let done = todoLists.filter(todoList => todoList.isDone());
  //   undone.sort(compareByTitle);
  //   done.sort(compareByTitle);
  //   return [].concat(undone, done);
  // },
  

  // return the list of todos in the todo list sorted by completion status and
  // title.
  // sortTodos(todoList) {
  //   let undone = todoList.todos.filter(todo => !todo.isDone());
  //   let done = todoList.todos.filter(todo => todo.isDone());
  //   undone.sort(compareByTitle);
  //   done.sort(compareByTitle);
  //   return [].concat(undone, done);
  // },
