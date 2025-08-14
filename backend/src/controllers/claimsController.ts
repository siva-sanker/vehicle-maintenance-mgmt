import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getClaims = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query(`
        SELECT 
          vc.*, 
          v.v_registration_number AS registration_number
        FROM vehicle_claims vc
        JOIN vehicles v ON vc.vc_vehicle_id_fk = v.v_id_pk
        ORDER BY vc.vc_created_at DESC
      `);
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
        FROM vehicle_claims 
        WHERE vc_vehicle_id_fk = @vehicleId 
        ORDER BY vc_claim_date DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching claims by vehicle ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const createClaim = async (req: Request, res: Response) => {
  const {
    vehicle_id,
    claim_date,
    claim_amount,
    reason,
    status = 'pending',
    provider_id,
    outlet_id,
    modified_by
  } = req.body;

  if (!vehicle_id || !claim_date || !claim_amount || !reason) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = getDatabase();
    const id = Date.now(); // Since vc_id_pk is BIGINT, you can use a timestamp or generate it server-side
    const now = new Date();

    await pool.request()
      .input('id', id)
      .input('vehicle_id', vehicle_id)
      .input('claim_date', claim_date)
      .input('claim_amount', claim_amount)
      .input('reason', reason)
      .input('status', status)
      .input('created_at', now)
      .input('modified_on', now)
      .input('modified_by', modified_by || null)
      .input('provider_id', provider_id || null)
      .input('outlet_id', outlet_id || null)
      .query(`
        INSERT INTO vehicle_claims (
          vc_id_pk, vc_vehicle_id_fk, vc_claim_date, vc_claim_amount,
          vc_reason, vc_status, vc_created_at, vc_modified_on,
          vc_modified_by_fk, vc_provider_id_fk, vc_outlet_fk
        )
        VALUES (
          @id, @vehicle_id, @claim_date, @claim_amount,
          @reason, @status, @created_at, @modified_on,
          @modified_by, @provider_id, @outlet_id
        )
      `);

    res.status(201).json({ message: 'Claim created successfully', id });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
