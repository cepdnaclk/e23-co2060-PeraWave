import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateOptional, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/posts
router.post('/', authenticateOptional, async (req: AuthRequest, res: Response) => {
  try {
    const { forum_id, content } = req.body;
    const author_id = req.user?.userId || null; // Null if anonymous

    if (!forum_id || !content) {
      return res.status(400).json({ error: 'forum_id and content are required' });
    }

    // Verify forum exists
    const forumCheck = await query('SELECT * FROM forums WHERE forum_id = $1', [forum_id]);
    if (forumCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Forum not found' });
    }

    const result = await query(
      'INSERT INTO posts (forum_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
      [forum_id, author_id, content]
    );

    // Log activity if user is authenticated
    if (author_id) {
      const postId = result.rows[0].post_id;
      await query(
        'INSERT INTO user_activity (user_id, action_type, target_id) VALUES ($1, $2, $3)',
        [author_id, 'post', postId]
      );
    }

    res.status(201).json({ message: 'Post created successfully', post: result.rows[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:forum_id
router.get('/:forum_id', async (req: Request, res: Response) => {
  try {
    const { forum_id } = req.params;

    // Verify forum exists
    const forumCheck = await query('SELECT * FROM forums WHERE forum_id = $1', [forum_id]);
    if (forumCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Forum not found' });
    }

    // Retrieve posts with upvote counts and sort by score
    // Left join with reactions where type = 'upvote' or 'like' or 'heart'
    const result = await query(`
      SELECT 
        p.post_id, p.forum_id, p.author_id, p.content, p.created_at,
        u.name as author_name,
        COUNT(r.reaction_id) FILTER (WHERE r.type IN ('upvote', 'like', 'heart')) as upvotes,
        COUNT(r.reaction_id) FILTER (WHERE r.type = 'report') as reports
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.user_id
      LEFT JOIN reactions r ON p.post_id = r.post_id
      WHERE p.forum_id = $1
      GROUP BY p.post_id, u.name
      ORDER BY upvotes DESC, p.created_at DESC
    `, [forum_id]);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
