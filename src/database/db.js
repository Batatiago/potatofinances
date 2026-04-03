import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function getDb() {
  const db = await open({
    filename: "./src/database/database.sqlite",
    driver: sqlite3.Database,
  });

  return db;
}