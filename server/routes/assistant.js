import express from 'express';
import { handleMessage } from '../services/assistantService.js';

const router = express.Router();

/**
 * POST /api/assistant
 * Natural language interface for operations
 *
 * Request body:
 * {
 *   "message": "user message",
 *   "history": [
 *     { "role": "user", "content": "..." },
 *     { "role": "assistant", "content": "..." }
 *   ]
 * }
 *
 * Response:
 * {
 *   "response": "assistant message",
 *   "toolCalls": [] (if any tools were called)
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Validate history format
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array' });
    }

    // Process message through assistant
    const result = await handleMessage(message, history);

    res.json({
      response: result.response,
      toolCalls: result.toolCalls,
    });
  } catch (error) {
    console.error('[POST /api/assistant]', error.message);
    next(error);
  }
});

export default router;
