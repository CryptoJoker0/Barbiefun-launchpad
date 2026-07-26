import { Router } from "express";
import {
  adminSessionIsConfigured,
  clearAdminSession,
  hasAdminSession,
  isAdminPassword,
  setAdminSession,
} from "../lib/adminAuth";

const router = Router();

router.get("/admin/session", (req, res) => {
  if (!adminSessionIsConfigured()) {
    res.status(503).json({ authenticated: false, error: "Admin authentication is not configured" });
    return;
  }

  res.json({ authenticated: hasAdminSession(req) });
});

router.post("/admin/login", (req, res) => {
  if (!adminSessionIsConfigured()) {
    res.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }

  if (!isAdminPassword(req.body?.password)) {
    res.status(401).json({ error: "Incorrect admin password" });
    return;
  }

  setAdminSession(res);
  res.json({ authenticated: true });
});

router.post("/admin/logout", (req, res) => {
  clearAdminSession(res);
  res.json({ authenticated: false });
});

export default router;