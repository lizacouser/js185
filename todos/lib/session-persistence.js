const SeedData = require("./seed-data");
const ValidUsers = require("./users.js");
const deepCopy = require("./deep-copy");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");
const bcrypt = require("bcrypt");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
    this.username = session.username;
    this.validUsers = session.validUsers || deepCopy(ValidUsers);
  };

  completeAllTodos(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.filter(todo => !todo.done)
                  .forEach(todo => todo.done = true);
    return true;
  }

  createTodoList(todoListTitle) {
    this._todoLists.push({
      id: nextId(),
      title: todoListTitle,
      todos: [],
      username: this.username,
    });
    return true;
  }

  createTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.push({
      id: nextId(),
      title,
      done: false,
      username: this.username,
    });

    return true;
  }

  deleteTodoList(todoListId) {
    let index = this._todoLists.findIndex(todoList => todoList.id === todoListId && todoList.username === this.username);
    if (index === -1) return false;

    this._todoLists.splice(index, 1);
    return true;
  }

  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    let index = todoList.todos.findIndex(todo => todo.id === todoId && todo.username === this.username);
    if (index === -1) return false;

    todoList.todos.splice(index, 1);
    return true;
  }

  existsTodoListTitle(todoListTitle) {
    return this._todoLists.some(todoList => todoList.title === todoListTitle && todoList.username === this.username);
  }

  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId && todoList.username === this.username);
  }

  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    return todoList.todos.find(todo => todo.id === todoId && todo.username === this.username);
  }

  // Does the todo list have any undone todos? Returns true if yes, false if no.
  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  // Are all of the todos in the todo list done? If the todo list has at least
  // one todo and all of its todos are marked as done, then the todo list is
  // done. Otherwise, it is undone.
  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  // Returns `true` if `error` seems to indicate a `UNIQUE` constraint
  // violation, `false` otherwise.
  isUniqueConstraintViolation(_error) {
    return false;
  }

  // Find a todo list with the indicated ID. Returns `undefined` if not found.
  // Note that `todoListId` must be numeric.
  loadTodoList(todoListId) {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  }

  // Find a todo with the indicated ID in the indicated todo list. Returns
  // `undefined` if not found. Note that both `todoListId` and `todoId` must be
  // numeric.
  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  setTodoListTitle(todoListId, todoListTitle) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.title = todoListTitle;
    return true;
  }

  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList) && todoList.username === this.username);
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList) && todoList.username === this.username);
    return sortTodoLists(undone, done);
  }

  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter(todo => !todo.done && todoList.username === this.username);
    let done = todos.filter(todo => todo.done && todoList.username === this.username);
    return deepCopy(sortTodos(undone, done));
  }

  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return false;

    todo.done = !todo.done;
    return true;
  }

  // Returns a Promise that resolves to `true` if `username` and `password`
  // combine to identify a legitimate application user, `false` if either the
  // `username` or `password` is invalid.
  validCredentials(username, password) {
    let user = deepCopy(this.validUsers.find(user => user.username === username));
    if (!user) return false;
    return bcrypt.compare(password, user.password)
  }
};