const { dbQuery } = require('./db-query');

module.exports = class SessionPersistence {

  // Mark all todos in the specified todo list as done. Returns a promise that
  // resolves to `true` on success, `false` if the todo list doesn't exist. The
  // todo list ID must be numeric.
  async completeAllTodos(todoListId) {
    const COMPLETE_ALL = 'UPDATE todos SET done = true WHERE todolist_id = $1 AND NOT done;'
    let completeAll = await dbQuery(COMPLETE_ALL, todoListId);
    return completeAll.rowCount > 0;
  }

  // Create a new todo list with the specified title and add it to the list of
  // todo lists. Returns `true` on success, `false` on failure. (At this time,
  // there are no known failure conditions.)
  async createTodoList(title) {
    let ADD_TODOLIST = 'INSERT INTO todolists (title) VALUES ($1);'

    try {
      let addTodoList = await dbQuery(ADD_TODOLIST, title);
      return addTodoList.rowCount === 1;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) return false;
      throw error;
    }
  }

  // Create a new todo with the specified title and add it to the indicated todo
  // list. Returns a promise that resolves to `true` on success, `false` on
  // failure.
  async createTodo(todoListId, title) {
    let ADD_TODO = 'INSERT INTO todos (title, todolist_id) VALUES ($1, $2);'
    let addTodo = await dbQuery(ADD_TODO, title, todoListId);
    return addTodo.rowCount === 1;
  }

  // Delete a todo list and all of its todos (handled by cascade). Returns a
  // Promise that resolves to `true` on success, false if the todo list doesn't
  // exist
  async deleteTodoList(todoListId) {
    const DELETE_TODOLIST = 'DELETE FROM todolists WHERE id = $1;'
    let deleted = await dbQuery(DELETE_TODOLIST, todoListId);
    return deleted.rowCount === 1;
  }

  // Delete a todo from the specified todo list. Returns a promise that resolves
  // to `true` on success, `false` on failure.
  async deleteTodo(todoListId, todoId) {
    const DELETE_TODO = 'DELETE FROM todos WHERE todolist_id = $1 AND id = $2;'
    let deleted = await dbQuery(DELETE_TODO, todoListId, todoId);
    return deleted.rowCount === 1;
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

  // Returns a Promise that resolves to `true` if a todo list with the specified
  // title exists in the list of todo lists, `false` otherwise.
  async existsTodoListTitle(title) {
    const FIND_TODOLIST_TITLE = 'SELECT 1 FROM todolists WHERE title = $1;'
    let result = await dbQuery(FIND_TODOLIST_TITLE, title);
    return result.rowCount === 1;
  }


  // Returns `true` if `error` seems to indicate a `UNIQUE` constraint
  // violation, `false` otherwise.
  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }

  // Returns a copy of the todo list with the indicated ID. Returns `undefined`
  // if not found. Note that `todoListId` must be numeric.
  async loadTodoList(todoListId) {
    const FIND_TODOLIST = "SELECT * FROM todolists WHERE id = $1";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";
    
    let resultTodoList = dbQuery(FIND_TODOLIST, todoListId);
    let resultTodos = dbQuery(FIND_TODOS, todoListId);
    let resultBoth = await Promise.all([resultTodoList, resultTodos]);
    // Note that we're making two separate queries here. We could use await for each query, but that's wasteful; it's more efficient to make simultaneous queries instead of waiting for one to complete. Thus, we don't use await when making these queries. Instead, we use await Promise.all(...) to wait for all of the queries to settle. Promise.all creates a new Promise that settles when all of the Promises in the argument resolve.

    let todoList = resultBoth[0].rows[0];
    if (!todoList) return undefined;

    todoList.todos = resultBoth[1].rows;
    return todoList;
  }

  // Returns a copy of the indicated todo in the indicated todo list. Returns
  // `undefined` if either the todo list or the todo is not found. Note that
  // both IDs must be numeric.
  async loadTodo(todoListId, todoId) {
    const FIND_TODO = "SELECT * FROM todos WHERE todolist_id = $1 AND id = $2";
    let resultTodo = await dbQuery(FIND_TODO, todoListId, todoId);
    return resultTodo.rows[0];
  }

  // Set a new title for the specified todo list. Returns a promise that
  // resolves to `true` on success, `false` if the todo list wasn't found.
  async setTodoListTitle(todoListId, title) {
    const UPDATE_TODOLIST_TITLE = 'UPDATE todolists SET title = $1 WHERE id = $2;'
    let result = await dbQuery(UPDATE_TODOLIST_TITLE, title, todoListId);
    return result.rowCount === 1;
  }

  _partitionTodoLists(todoLists) {
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return [].concat(undone, done);
  }

  // Returns a promise that resolves to a sorted list of all the todo lists
  // together with their todos. The list is sorted by completion status and
  // title (case-insensitive). The todos in the list are unsorted.
  async sortedTodoLists() {
    const ALL_TODOLISTS = "SELECT * FROM todolists ORDER BY lower(title) ASC";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";

    let result = await dbQuery(ALL_TODOLISTS);
    let todoLists = result.rows;

    for (let index = 0; index < todoLists.length; ++index) {
      let todoList = todoLists[index];
      let todos = await dbQuery(FIND_TODOS, todoList.id);
      todoList.todos = todos.rows;
    }

    return this._partitionTodoLists(todoLists);
  }

  // Returns a copy of the list of todos in the indicated todo list by sorted by
  // completion status and title (case-insensitive).
  async sortedTodos(todoList) {
    const SORTED_TODOS = "SELECT * FROM todos " + 
                         "WHERE todolist_id = $1 " + 
                         "ORDER BY done ASC, lower(title) ASC";

    let todosResult = await dbQuery(SORTED_TODOS, todoList.id);
    return todosResult.rows;
  }

  // Toggle a todo between the done and not done state. Returns a promise that
  // resolves to `true` on success, `false` if the todo list or todo doesn't
  // exist. The id arguments must both be numeric.
  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_DONE = "UPDATE todos SET done = NOT done" +
                        "  WHERE todolist_id = $1 AND id = $2";

    let result = await dbQuery(TOGGLE_DONE, todoListId, todoId);
    return result.rowCount > 0;
  }
};