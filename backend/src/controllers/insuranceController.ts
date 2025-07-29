import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getInsurance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM insurance ORDER BY created_at DESC');
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
            .input('id', id)
            .query('SELECT * FROM insurance WHERE id = @id');

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
            .input('vehicleId', vehicleId)
            .query('SELECT * FROM insurance WHERE vehicle_id = @vehicleId ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching insurance by vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createInsurance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const id = uuidv4().slice(0, 8);
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
                INSERT INTO insurance (id, vehicle_id, policy_number, insurer, policy_type, 
                                     start_date, end_date, payment, issue_date, premium_amount)
                VALUES (@id, @vehicle_id, @policy_number, @insurer, @policy_type, 
                        @start_date, @end_date, @payment, @issue_date, @premium_amount);
                SELECT * FROM insurance WHERE id = @id;
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
                UPDATE insurance 
                SET vehicle_id = @vehicle_id, policy_number = @policy_number, 
                    insurer = @insurer, policy_type = @policy_type, 
                    start_date = @start_date, end_date = @end_date, 
                    payment = @payment, issue_date = @issue_date, 
                    premium_amount = @premium_amount
                WHERE id = @id;
                SELECT * FROM insurance WHERE id = @id;
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

        // Build dynamic update query
        const updateFields: string[] = [];
        const inputs: any = { id };

        Object.keys(req.body).forEach(key => {
            if (key !== 'id') {
                updateFields.push(`${key} = @${key}`);
                inputs[key] = req.body[key];
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const query = `
            UPDATE insurance 
            SET ${updateFields.join(', ')}
            WHERE id = @id;
            SELECT * FROM insurance WHERE id = @id;
        `;

        const request = pool.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
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
            .input('id', id)
            .query('DELETE FROM insurance WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Insurance record not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting insurance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 