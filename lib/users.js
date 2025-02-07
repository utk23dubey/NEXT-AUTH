import db from "./db";

export function createUser(email, password) {
  const result = db
    .prepare("INSERT into users (email, password) VALUES (?, ?)")
    .run(email, password);
  return result.lastInsertRowid;
}

export function getUser(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}
