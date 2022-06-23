const req = require('express/lib/request');
const { Client } = require('pg');
const { dbQuery } = require('./db-query');

module.exports = class SessionPersistence {
  
  constructor(session) {
    // this._todoLists = session.todoLists || deepCopy(SeedData);
    // session.todoLists = this._todoLists;
  }

  // Mark all todos on the todo list as done. Returns `true` on success,
  // `false` if the todo list doesn't exist. The todo list ID must be numeric.
  completeAllTodos(todoListId) {
    // let todoList = this._findTodoList(todoListId);
    // if (!todoList) return false;
    //
    // todoList.todos.filter(todo => !todo.done)
    //               .forEach(todo => (todo.done = true));
    // return true;
  }

  // Create a new todo list with the specified title and add it to the list of
  // todo lists. Returns `true` on success, `false` on failure. (At this time,
  // there are no known failure conditions.)
  createTodoList(title) {
    // this._todoLists.push({
    //   title,
    //   id: nextId(),
    //   todos: [],
    // });
    //
    // return true;
  }

  // Create a new todo with the specified title and add it to the indicated todo
  // list. Returns `true` on success, `false` on failure.
  createTodo(todoListId, title) {
    // let todoList = this._findTodoList(todoListId);
    // if (!todoList) return false;
    //
    // todoList.todos.push({
    //   title,
    //   id: nextId(),
    //   done: false,
    // });
    //
    // return true;
  }

  // Delete a todo list from the list of todo lists. Returns `true` on success,
  // `false` if the todo list doesn't exist. The ID argument must be numeric.
  deleteTodoList(todoListId) {
    // let todoListIndex = this._todoLists.findIndex(todoList => {
    //   return todoList.id === todoListId;
    // });
    //
    // if (todoListIndex === -1) return false;
    //
    // this._todoLists.splice(todoListIndex, 1);
    // return true;
  }

  // Delete the specified todo from the specified todo list. Returns `true` on
  // success, `false` if the todo or todo list doesn't exist. The id arguments
  // must both be numeric.
  deleteTodo(todoListId, todoId) {
    // let todoList = this._findTodoList(todoListId);
    // if (!todoList) return false;
    //
    // let todoIndex = todoList.todos.findIndex(todo => todo.id === todoId);
    // if (todoIndex === -1) return false;
    //
    // todoList.todos.splice(todoIndex, 1);
    // return true;
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

  // Returns `true` if a todo list with the specified title exists in the list
  // of todo lists, `false` otherwise.
  existsTodoListTitle(title) {
    // return this._todoLists.some(todoList => todoList.title === title);
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

    // let todoList = this._findTodoList(todoListId);
    // return deepCopy(todoList);
  }

  // Returns a copy of the indicated todo in the indicated todo list. Returns
  // `undefined` if either the todo list or the todo is not found. Note that
  // both IDs must be numeric.
  loadTodo(todoListId, todoId) {
    // let todo = this._findTodo(todoListId, todoId);
    // return deepCopy(todo);
  }

  // Set a new title for the specified todo list. Returns `true` on success,
  // `false` if the todo list isn't found. The todo list ID must be numeric.
  setTodoListTitle(todoListId, title) {
    // let todoList = this._findTodoList(todoListId);
    // if (!todoList) return false;
    //
    // todoList.title = title;
    // return true;
  }

  _partitionTodoLists(todoLists) {
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    // console.log(undone, done);
    return [].concat(undone, done);
  }

    // Returns a new list of todo lists partitioned by completion status.
    // _partitionTodoLists(todoLists) {
    //   let undone = [];
    //   let done = [];
  
    //   todoLists.forEach(todoList => {
    //     if (this.isDoneTodoList(todoList)) {
    //       done.push(todoList);
    //     } else {
    //       undone.push(todoList);
    //     }
    //   });
  
    //   return undone.concat(done);
    // }

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

  // Toggle a todo between the done and not done state. Returns `true` on
  // success, `false` if the todo or todo list doesn't exist. The id arguments
  // must both be numeric.
  toggleDoneTodo(todoListId, todoId) {
    // let todo = this._findTodo(todoListId, todoId);
    // if (!todo) return false;
    //
    // todo.done = !todo.done;
    // return true;
  }

  // Returns a reference to the todo list with the indicated ID. Returns
  // `undefined`. if not found. Note that `todoListId` must be numeric.
  // _findTodoList(todoListId) {
  //   return this._todoLists.find(todoList => todoList.id === todoListId);
  // }

  // Returns a reference to the indicated todo in the indicated todo list.
  // Returns `undefined` if either the todo list or the todo is not found. Note
  // that both IDs must be numeric.
  // _findTodo(todoListId, todoId) {
  //   let todoList = this._findTodoList(todoListId);
  //   if (!todoList) return undefined;
  //
  //   return todoList.todos.find(todo => todo.id === todoId);
  // }
};