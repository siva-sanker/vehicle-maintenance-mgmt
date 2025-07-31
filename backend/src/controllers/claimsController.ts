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

export const getClaimsByVehicleId = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const pool = getDatabase();
    const result = await pool.request()
      .input('vehicleId', vehicleId)
      .query(`
        SELECT * 
        FROM claims 
        WHERE vehicle_id = @vehicleId AND deleted_at IS NULL 
        ORDER BY claim_date DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching claims by vehicle ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createClaim = async (req: Request, res: Response) => {
  const { vehicle_id, claim_date, claim_amount, reason, status } = req.body;

  if (!vehicle_id || !claim_date || !claim_amount || !reason || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = getDatabase();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await pool.request()
      .input('id', id)
      .input('vehicle_id', vehicle_id)
      .input('claim_date', claim_date)
      .input('claim_amount', claim_amount)
      .input('reason', reason)
      .input('status', status)
      .input('created_at', createdAt)
      .query(`
        INSERT INTO claims (id, vehicle_id, claim_date, claim_amount, reason, status, created_at)
        VALUES (@id, @vehicle_id, @claim_date, @claim_amount, @reason, @status, @created_at)
      `);

    res.status(201).json({ message: 'Claim created successfully', id });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};