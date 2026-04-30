import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/forums
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let dbQuery = 'SELECT * FROM forums';
    const params: any[] = [];

    if (type) {
      // Validate type
      const validTypes = ['university', 'faculty', 'batch'];
      if (!validTypes.includes(type as string)) {
        return res.status(400).json({ error: 'Invalid forum type' });
      }
      dbQuery += ' WHERE type = $1';
      params.push(type);
    }

    dbQuery += ' ORDER BY created_at DESC';

    const result = await query(dbQuery, params);
    res.json({ forums: result.rows });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
