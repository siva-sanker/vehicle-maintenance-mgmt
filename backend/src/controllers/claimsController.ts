import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getClaims = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM claims WHERE deleted_at IS NULL ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};