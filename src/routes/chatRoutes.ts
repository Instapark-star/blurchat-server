import { Router } from "express";

const router = Router();

/**
 * For now, we don't persist messages.
 * Only basic health check route for chat service.
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Chat service running ✅" });
});

export default router;
