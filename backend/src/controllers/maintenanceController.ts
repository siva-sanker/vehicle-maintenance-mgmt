import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

// Get all maintenance records
export const getMaintenance = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const maintenance = await db.all(`
      SELECT m.*, v.make, v.model, v.registration_number
      FROM maintenance m
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.date DESC
    `);
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get maintenance by ID
export const getMaintenanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const maintenance = await db.get(`
      SELECT m.*, v.make, v.model, v.registration_number
      FROM maintenance m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = ?
    `, [id]);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get maintenance by vehicle
export const getMaintenanceByVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const db = getDatabase();
    const maintenance = await db.all(
      'SELECT * FROM maintenance WHERE vehicle_id = ? ORDER BY date DESC',
      [vehicleId]
    );
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance by vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new maintenance record
export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { vehicleId, description, date, cost, status } = req.body;
    const db = getDatabase();

    // Verify vehicle exists
    const vehicle = await db.get(
      'SELECT id FROM vehicles WHERE id = ? AND deleted_at IS NULL',
      [vehicleId]
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await db.run(
      'INSERT INTO maintenance (id, vehicle_id, description, date, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, vehicleId, description, date, cost, status || 'scheduled']
    );
    const newMaintenance = await db.get('SELECT * FROM maintenance WHERE id = ?', [id]);
    res.status(201).json(newMaintenance);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a maintenance record
export const updateMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleId, description, date, cost, status } = req.body;
    const db = getDatabase();
    const result = await db.run(
      'UPDATE maintenance SET vehicle_id = ?, description = ?, date = ?, cost = ?, status = ?, last_updated = datetime("now") WHERE id = ?',
      [vehicleId, description, date, cost, status, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    const updatedMaintenance = await db.get('SELECT * FROM maintenance WHERE id = ?', [id]);
    res.json(updatedMaintenance);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Patch maintenance (partial update)
export const patchMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    const result = await db.run(
      `UPDATE maintenance SET ${setClause}, last_updated = datetime('now') WHERE id = ?`,
      [...values, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    const updatedMaintenance = await db.get('SELECT * FROM maintenance WHERE id = ?', [id]);
    res.json(updatedMaintenance);
  } catch (error) {
    console.error('Error patching maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete maintenance
export const deleteMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const result = await db.run('DELETE FROM maintenance WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all completed maintenance
export const getCompletedMaintenance = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const maintenance = await db.all(`
      SELECT m.*, v.make, v.model, v.registration_number
      FROM maintenance m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status = 'completed'
      ORDER BY m.date DESC
    `);
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching completed maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all scheduled maintenance
export const getScheduledMaintenance = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const maintenance = await db.all(`
      SELECT m.*, v.make, v.model, v.registration_number
      FROM maintenance m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status = 'scheduled'
      ORDER BY m.date ASC
    `);
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching scheduled maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
