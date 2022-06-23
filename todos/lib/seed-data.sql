INSERT INTO todolists (title) VALUES ('Work todos'), ('Home todos'), ('Additional todos'), ('social todos');

INSERT INTO todos (title, done, todolist_id) VALUES
  ('Get coffee', true, 1),
  ('Chat with coworkers', true, 1),
  ('Duck out of meeting', false, 1),
  ('Feed the cats', true, 2),
  ('Go to bed', true, 2),
  ('Buy milk', true, 2),
  ('Study for launch school', true, 2),
  ('Go to Libby''s birthday party', false, 4);
