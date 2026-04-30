import { Router, Response } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/reactions
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { post_id, type } = req.body;
    const user_id = req.user!.userId;

    if (!post_id || !type) {
      return res.status(400).json({ error: 'post_id and type are required' });
    }

    const validTypes = ['upvote', 'report', 'like', 'heart'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    // Check if post exists
    const postCheck = await query('SELECT * FROM posts WHERE post_id = $1', [post_id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already reacted with the SAME type on this post
    // Depending on logic, a user might be able to upvote only once.
    const existingReaction = await query(
      'SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
      [post_id, user_id, type]
    );

    if (existingReaction.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reacted with this type on this post' });
    }

    // Insert reaction
    const result = await query(
      'INSERT INTO reactions (post_id, user_id, type) VALUES ($1, $2, $3) RETURNING *',
      [post_id, user_id, type]
    );

    // Log activity
    const reactionId = result.rows[0].reaction_id;
    await query(
      'INSERT INTO user_activity (user_id, action_type, target_id) VALUES ($1, $2, $3)',
      [user_id, 'reaction', reactionId]
    );

    res.status(201).json({ message: 'Reaction added successfully', reaction: result.rows[0] });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
