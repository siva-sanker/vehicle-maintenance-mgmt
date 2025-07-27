import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const vehicles = await db.all(
      'SELECT * FROM vehicles WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    
    // Get related data for each vehicle
    const vehiclesWithData = await Promise.all(vehicles.map(async (vehicle) => {
      const insurance = await db.get('SELECT * FROM insurance WHERE vehicle_id = ?', [vehicle.id]);
      const claims = await db.all('SELECT * FROM claims WHERE vehicle_id = ?', [vehicle.id]);
      const location = await db.get(
        'SELECT * FROM vehicle_locations WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 1',
        [vehicle.id]
      );
      
      return {
        ...vehicle,
        insurance: insurance || null,
        claims: claims || [],
        currentLocation: location || null
      };
    }));
    
    res.json(vehiclesWithData);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const vehicle = await db.get(
      'SELECT * FROM vehicles WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const insurance = await db.get('SELECT * FROM insurance WHERE vehicle_id = ?', [id]);
    const claims = await db.all('SELECT * FROM claims WHERE vehicle_id = ?', [id]);
    const location = await db.get(
      'SELECT * FROM vehicle_locations WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 1',
      [id]
    );
    
    res.json({
      ...vehicle,
      insurance: insurance || null,
      claims: claims || [],
      currentLocation: location || null
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const vehicleData = req.body;
    const db = getDatabase();
    
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Insert vehicle
      await db.run(
        `INSERT INTO vehicles (
          id, make, model, purchase_date, registration_number, purchase_price,
          fuel_type, engine_number, chassis_number, kilometers, color, owner,
          phone, address, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, vehicleData.make, vehicleData.model, vehicleData.purchaseDate,
          vehicleData.registrationNumber, vehicleData.purchasePrice,
          vehicleData.fuelType, vehicleData.engineNumber, vehicleData.chassisNumber,
          vehicleData.kilometers || 0, vehicleData.color, vehicleData.owner,
          vehicleData.phone, vehicleData.address, vehicleData.status || 'active'
        ]
      );
      
      // Insert insurance if provided
      if (vehicleData.insurance) {
        const ins = vehicleData.insurance;
        await db.run(
          `INSERT INTO insurance (
            id, vehicle_id, policy_number, insurer, policy_type, start_date,
            end_date, payment, issue_date, premium_amount, has_insurance
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), id, ins.policyNumber, ins.insurer, ins.policytype,
            ins.startDate, ins.endDate, ins.payment, ins.issueDate,
            ins.premiumAmount, ins.hasInsurance !== false ? 1 : 0
          ]
        );
      }
      
      // Insert claims if provided
      if (vehicleData.claims && vehicleData.claims.length > 0) {
        for (const claim of vehicleData.claims) {
          await db.run(
            'INSERT INTO claims (id, vehicle_id, claim_date, claim_amount, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), id, claim.claimDate, claim.claimAmount, claim.reason, claim.status || 'pending']
          );
        }
      }
      
      // Insert location if provided
      if (vehicleData.currentLocation) {
        const loc = vehicleData.currentLocation;
        await db.run(
          'INSERT INTO vehicle_locations (id, vehicle_id, latitude, longitude, timestamp, address) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), id, loc.latitude, loc.longitude, loc.timestamp, loc.address]
        );
      }
      
      await db.run('COMMIT');
      
      const newVehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
      res.status(201).json(newVehicle);
      
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    const db = getDatabase();
    
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Update vehicle
      const result = await db.run(
        `UPDATE vehicles SET 
          make = ?, model = ?, purchase_date = ?, registration_number = ?,
          purchase_price = ?, fuel_type = ?, engine_number = ?, chassis_number = ?,
          kilometers = ?, color = ?, owner = ?, phone = ?, address = ?, status = ?,
          last_updated = datetime('now')
        WHERE id = ?`,
        [
          vehicleData.make, vehicleData.model, vehicleData.purchaseDate,
          vehicleData.registrationNumber, vehicleData.purchasePrice,
          vehicleData.fuelType, vehicleData.engineNumber, vehicleData.chassisNumber,
          vehicleData.kilometers, vehicleData.color, vehicleData.owner,
          vehicleData.phone, vehicleData.address, vehicleData.status, id
        ]
      );
      
      if (result.changes === 0) {
        await db.run('ROLLBACK');
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      // Update insurance
      if (vehicleData.insurance) {
        const ins = vehicleData.insurance;
        await db.run('DELETE FROM insurance WHERE vehicle_id = ?', [id]);
        await db.run(
          `INSERT INTO insurance (
            id, vehicle_id, policy_number, insurer, policy_type, start_date,
            end_date, payment, issue_date, premium_amount, has_insurance
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), id, ins.policyNumber, ins.insurer, ins.policytype,
            ins.startDate, ins.endDate, ins.payment, ins.issueDate,
            ins.premiumAmount, ins.hasInsurance !== false ? 1 : 0
          ]
        );
      }
      
      await db.run('COMMIT');
      
      const updatedVehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
      res.json(updatedVehicle);
      
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const patchVehicle = async (req: Request, res: Response) => {
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
      `UPDATE vehicles SET ${setClause}, last_updated = datetime('now') WHERE id = ?`,
      [...values, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const updatedVehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error patching vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const softDeleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.run(
      'UPDATE vehicles SET deleted_at = datetime("now"), last_updated = datetime("now") WHERE id = ?',
      [id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle soft-deleted' });
  } catch (error) {
    console.error('Error soft-deleting vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const restoreVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.run(
      'UPDATE vehicles SET deleted_at = NULL, last_updated = datetime("now") WHERE id = ?',
      [id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle restored' });
  } catch (error) {
    console.error('Error restoring vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchVehicles = async (req: Request, res: Response) => {
  try {
    const { make, model, status } = req.query;
    const db = getDatabase();
    
    let query = 'SELECT * FROM vehicles WHERE deleted_at IS NULL';
    const params: any[] = [];
    
    if (make) {
      query += ' AND make LIKE ?';
      params.push(`%${make}%`);
    }
    
    if (model) {
      query += ' AND model LIKE ?';
      params.push(`%${model}%`);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    const vehicles = await db.all(query, params);
    res.json(vehicles);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};