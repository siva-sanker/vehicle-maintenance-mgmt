import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM drivers WHERE deleted_at IS NULL ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDriverById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM drivers WHERE id = @id AND deleted_at IS NULL');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDriver = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const id = uuidv4().slice(0, 8);
        const { name, phone, address, license_number } = req.body;

        const result = await pool.request()
            .input('id', id)
            .input('name', name)
            .input('phone', phone)
            .input('address', address)
            .input('license_number', license_number)
            .query(`
                INSERT INTO drivers (id, name, phone, address, license_number)
                VALUES (@id, @name, @phone, @address, @license_number);
                SELECT * FROM drivers WHERE id = @id;
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();
        const { name, phone, address, license_number, status } = req.body;

        const result = await pool.request()
            .input('id', id)
            .input('name', name)
            .input('phone', phone)
            .input('address', address)
            .input('license_number', license_number)
            .input('status', status)
            .query(`
                UPDATE drivers 
                SET name = @name, phone = @phone, address = @address, 
                    license_number = @license_number, status = @status, 
                    last_updated = GETDATE()
                WHERE id = @id;
                SELECT * FROM drivers WHERE id = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const patchDriver = async (req: Request, res: Response) => {
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
            UPDATE drivers 
            SET ${updateFields.join(', ')}, last_updated = GETDATE()
            WHERE id = @id;
            SELECT * FROM drivers WHERE id = @id;
        `;

        const request = pool.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error patching driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query('DELETE FROM drivers WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const softDeleteDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query(`
                UPDATE drivers 
                SET deleted_at = GETDATE(), last_updated = GETDATE()
                WHERE id = @id;
                SELECT * FROM drivers WHERE id = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json({ message: 'Driver soft-deleted', driver: result.recordset[0] });
    } catch (error) {
        console.error('Error soft-deleting driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const restoreDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query(`
                UPDATE drivers 
                SET deleted_at = NULL, last_updated = GETDATE()
                WHERE id = @id;
                SELECT * FROM drivers WHERE id = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json({ message: 'Driver restored', driver: result.recordset[0] });
    } catch (error) {
        console.error('Error restoring driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 