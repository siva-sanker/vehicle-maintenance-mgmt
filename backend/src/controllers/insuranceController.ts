import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

// Simulated BIGINT primary key generator
let insuranceIdCounter = Date.now();

export const getInsurance = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicle_insurance WHERE vi_deleted_at IS NULL ORDER BY vi_created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching insurance records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInsuranceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();
    const result = await pool.request()
      .input('id', Number(id))
      .query('SELECT * FROM vehicle_insurance WHERE vi_id_pk = @id AND vi_deleted_at IS NULL');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching insurance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInsuranceByVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const pool = getDatabase();
    const result = await pool.request()
      .input('vehicleId', Number(vehicleId))
      .query(`
        SELECT * FROM vehicle_insurance 
        WHERE vi_vehicle_id = @vehicleId AND vi_deleted_at IS NULL 
        ORDER BY vi_created_at DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching insurance by vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInsurance = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const id = insuranceIdCounter++;

    const {
      vehicle_id,
      policy_number,
      insurer,
      policy_type,
      start_date,
      end_date,
      payment,
      issue_date,
      premium_amount
    } = req.body;

    const result = await pool.request()
      .input('id', id)
      .input('vehicle_id', vehicle_id)
      .input('policy_number', policy_number)
      .input('insurer', insurer)
      .input('policy_type', policy_type)
      .input('start_date', start_date)
      .input('end_date', end_date)
      .input('payment', payment)
      .input('issue_date', issue_date)
      .input('premium_amount', premium_amount)
      .query(`
        INSERT INTO vehicle_insurance (
          vi_id, vi_vehicle_id, vi_policy_number, vi_insurer, vi_policy_type,
          vi_start_date, vi_end_date, vi_payment, vi_issue_date, vi_premium_amount, vi_created_at
        ) VALUES (
          @id, @vehicle_id, @policy_number, @insurer, @policy_type,
          @start_date, @end_date, @payment, @issue_date, @premium_amount, GETDATE()
        );
        SELECT * FROM vehicle_insurance WHERE vi_id = @id;
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating insurance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInsurance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const {
      vehicle_id,
      policy_number,
      insurer,
      policy_type,
      start_date,
      end_date,
      payment,
      issue_date,
      premium_amount
    } = req.body;

    const result = await pool.request()
      .input('id', Number(id))
      .input('vehicle_id', vehicle_id)
      .input('policy_number', policy_number)
      .input('insurer', insurer)
      .input('policy_type', policy_type)
      .input('start_date', start_date)
      .input('end_date', end_date)
      .input('payment', payment)
      .input('issue_date', issue_date)
      .input('premium_amount', premium_amount)
      .query(`
        UPDATE vehicle_insurance
        SET vi_vehicle_id = @vehicle_id,
            vi_policy_number = @policy_number,
            vi_insurer = @insurer,
            vi_policy_type = @policy_type,
            vi_start_date = @start_date,
            vi_end_date = @end_date,
            vi_payment = @payment,
            vi_issue_date = @issue_date,
            vi_premium_amount = @premium_amount,
            v_modified_on = GETDATE()
        WHERE vi_id_pk = @id;

        SELECT * FROM vehicle_insurance WHERE vi_id_pk = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating insurance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const patchInsurance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const updateFields: string[] = [];
    const inputs: any = { id: Number(id) };

    const fieldMap: Record<string, string> = {
      vehicle_id: 'vi_vehicle_id',
      policy_number: 'vi_policy_number',
      insurer: 'vi_insurer',
      policy_type: 'vi_policy_type',
      start_date: 'vi_start_date',
      end_date: 'vi_end_date',
      payment: 'vi_payment',
      issue_date: 'vi_issue_date',
      premium_amount: 'vi_premium_amount'
    };

    Object.entries(req.body).forEach(([key, value]) => {
      const dbKey = fieldMap[key];
      if (dbKey) {
        updateFields.push(`${dbKey} = @${dbKey}`);
        inputs[dbKey] = value;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const query = `
      UPDATE vehicle_insurance 
      SET ${updateFields.join(', ')}, vi_last_updated = GETDATE()
      WHERE vi_id_pk = @id;
      SELECT * FROM vehicle_insurance WHERE vi_id_pk = @id;
    `;

    const request = pool.request();
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error patching insurance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteInsurance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const result = await pool.request()
      .input('id', Number(id))
      .query(`
        UPDATE vehicle_insurance
        SET vi_deleted_at = GETDATE()
        WHERE vi_id_pk = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Insurance record not found' });
    }

    res.status(200).json({ message: 'Insurance record soft-deleted' });
  } catch (error) {
    console.error('Error soft-deleting insurance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
