import { Router } from 'express';
// import Vehicle from '../models/Vehicle';
import fs from "fs";
import path from 'path';

const router = Router();

router.get("/data", (req, res) => {
  const dbPath = path.join(__dirname, "../data/db.json");
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data" });
    }
    res.json(JSON.parse(data));
  });
});

export default router;