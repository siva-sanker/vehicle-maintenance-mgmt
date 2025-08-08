import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getMaintenance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM maintenance ORDER BY date DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMaintenanceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM maintenance WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching maintenance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMaintenanceByVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;
        const pool = getDatabase();
        const result = await pool.request()
            .input('vehicleId', vehicleId)
            .query('SELECT * FROM maintenance WHERE vehicle_id = @vehicleId ORDER BY date DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching maintenance by vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createMaintenance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const id = uuidv4().slice(0, 8);
        const { vehicle_id, description, date, cost, status } = req.body;

        const result = await pool.request()
            .input('id', id)
            .input('vehicle_id', vehicle_id)
            .input('description', description)
            .input('date', date)
            .input('cost', cost)
            .input('status', status)
            .query(`
                INSERT INTO maintenance (id, vehicle_id, description, date, cost, status)
                VALUES (@id, @vehicle_id, @description, @date, @cost, @status);
                SELECT * FROM maintenance WHERE id = @id;
            `);

        // Update vehicle status based on maintenance status
        if (status && ["scheduled", "in progress", "Scheduled", "In Progress"].includes(status.trim().toLowerCase())) {
            await pool.request()
                .input('vehicle_id', vehicle_id)
                .input('status', 'maintenance')
                .query(`
                    UPDATE vehicles
                    SET status = @status
                    WHERE id = @vehicle_id;
                `);
        } else if (status && ["completed", "Completed"].includes(status.trim().toLowerCase())) {
            await pool.request()
                .input('vehicle_id', vehicle_id)
                .input('status', 'active')
                .query(`
                    UPDATE vehicles
                    SET status = @status
                    WHERE id = @vehicle_id;
                `);
        }
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error creating maintenance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();
        const { vehicle_id, description, date, cost, status } = req.body;

        const result = await pool.request()
            .input('id', id)
            .input('vehicle_id', vehicle_id)
            .input('description', description)
            .input('date', date)
            .input('cost', cost)
            .input('status', status)
            .query(`
                UPDATE maintenance 
                SET vehicle_id = @vehicle_id, description = @description, 
                    date = @date, cost = @cost, status = @status, 
                    last_updated = GETDATE()
                WHERE id = @id;
                SELECT * FROM maintenance WHERE id = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        // After checking if (result.recordset.length === 0) { ... }, and before res.json(result.recordset[0]);
        if (status && ["scheduled", "in progress", "Scheduled", "In Progress"].includes(status.trim().toLowerCase())) {
            await pool.request()
                .input('vehicle_id', vehicle_id)
                .input('status', 'maintenance')
                .query(`
                    UPDATE vehicles
                    SET status = @status
                    WHERE id = @vehicle_id;
                `);
        } else if (status && ["completed", "Completed"].includes(status.trim().toLowerCase())) {
            await pool.request()
                .input('vehicle_id', vehicle_id)
                .input('status', 'active')
                .query(`
                    UPDATE vehicles
                    SET status = @status
                    WHERE id = @vehicle_id;
                `);
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error updating maintenance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const patchMaintenance = async (req: Request, res: Response) => {
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
            UPDATE maintenance 
            SET ${updateFields.join(', ')}, last_updated = GETDATE()
            WHERE id = @id;
            SELECT * FROM maintenance WHERE id = @id;
        `;

        const request = pool.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        // Update vehicle status if maintenance status was changed
        if (req.body.status) {
            const maintenanceRecord = result.recordset[0];
            const status = req.body.status;
            const vehicle_id = maintenanceRecord.vehicle_id;

            if (status && ["scheduled", "in progress", "Scheduled", "In Progress"].includes(status.trim().toLowerCase())) {
                await pool.request()
                    .input('vehicle_id', vehicle_id)
                    .input('status', 'maintenance')
                    .query(`
                        UPDATE vehicles
                        SET status = @status
                        WHERE id = @vehicle_id;
                    `);
            } else if (status && ["completed", "Completed"].includes(status.trim().toLowerCase())) {
                await pool.request()
                    .input('vehicle_id', vehicle_id)
                    .input('status', 'active')
                    .query(`
                        UPDATE vehicles
                        SET status = @status
                        WHERE id = @vehicle_id;
                    `);
            }
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error patching maintenance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query(`
                UPDATE maintenance
                SET deleted_at = GETDATE()
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        res.status(200).json({ message: 'Maintenance record soft-deleted' });
    } catch (error) {
        console.error('Error soft-deleting maintenance record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getCompletedMaintenance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query("SELECT * FROM maintenance WHERE status = 'completed' ORDER BY date DESC");
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching completed maintenance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getScheduledMaintenance = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query("SELECT * FROM maintenance WHERE status = 'scheduled' ORDER BY date ASC");
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching scheduled maintenance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 