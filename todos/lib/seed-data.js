const nextId = require("./next-id");

module.exports = [
  {
    id: nextId(),
    title: "Work Todos",
    todos: [
      {
        id: nextId(),
        title: "Get coffee",
        done: true,
        username: "admin",
      },
      {
        id: nextId(),
        title: "Chat with co-workers",
        done: true,
        username: "admin",
      },
      {
        id: nextId(),
        title: "Duck out of meeting",
        done: false,
        username: "admin",
      },
    ],
    username: "admin",
  },
  {
    id: nextId(),
    title: "Home Todos",
    todos: [
      {
        id: nextId(),
        title: "Feed the cats",
        done: true,
        username: "admin",
      },
      {
        id: nextId(),
        title: "Go to bed",
        done: true,
        username: "admin",
      },
      {
        id: nextId(),
        title: "Buy milk",
        done: true,
        username: "admin",
      },
      {
        id: nextId(),
        title: "Study for Launch School",
        done: true,
        username: "admin",
      },
    ],
    username: "admin",
  },
  {
    id: nextId(),
    title: "Additional Todos",
    todos: [],
    username: "admin",
  },
  {
    id: nextId(),
    title: "social todos",
    todos: [
      {
        id: nextId(),
        title: "Go to Libby's birthday party",
        done: false,
        username: "admin",
      },
    ],
    username: "admin",
  },
];