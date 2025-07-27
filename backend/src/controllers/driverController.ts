import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

// Get all drivers (excluding soft-deleted)
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const drivers = await db.all(
      'SELECT * FROM drivers WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get driver by ID
export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const driver = await db.get(
      'SELECT * FROM drivers WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new driver
export const createDriver = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { name, phone, address, licenseNumber, status } = req.body;
    const db = getDatabase();
    await db.run(
      `INSERT INTO drivers (
        id, name, phone, address, license_number, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, name, phone, address || null, licenseNumber || null, status || 'active']
    );
    const newDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(newDriver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a driver's entire record
export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, licenseNumber, status } = req.body;
    const db = getDatabase();
    const result = await db.run(
      `UPDATE drivers SET 
        name = ?, phone = ?, address = ?, license_number = ?, status = ?, last_updated = datetime('now') 
       WHERE id = ?`,
      [name, phone, address || null, licenseNumber || null, status, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    const updatedDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Patch (partial) update to a driver's record
export const patchDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Remove `id` field if provided in updates to avoid id modification
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    const result = await db.run(
      `UPDATE drivers SET ${setClause}, last_updated = datetime('now') WHERE id = ?`,
      [...values, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    const updatedDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error patching driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a driver permanently
export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const result = await db.run('DELETE FROM drivers WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Soft-delete a driver (mark deleted_at timestamp)
export const softDeleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const result = await db.run(
      `UPDATE drivers SET deleted_at = datetime('now'), last_updated = datetime('now') WHERE id = ?`,
      [id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver soft-deleted' });
  } catch (error) {
    console.error('Error soft-deleting driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Restore a soft-deleted driver (clear deleted_at)
export const restoreDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const result = await db.run(
      `UPDATE drivers SET deleted_at = NULL, last_updated = datetime('now') WHERE id = ?`,
      [id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Driver not found or not deleted' });
    }
    res.json({ message: 'Driver restored' });
  } catch (error) {
    console.error('Error restoring driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
