
CREATE TABLE todolists (
  id serial PRIMARY KEY,
  title text UNIQUE NOT NULL
);
CREATE TABLE todos (
  id serial PRIMARY KEY,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  todolist integer NOT NULL 
    REFERENCES todolists (id)
    ON DELETE CASCADE
);

