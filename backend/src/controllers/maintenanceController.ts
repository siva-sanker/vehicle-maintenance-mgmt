import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

// Simulated BIGINT ID generator for development use (replace with DB sequence in prod)
let maintenanceIdCounter = Date.now();

export const getMaintenance = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicle_maintenance WHERE vm_deleted_at IS NULL ORDER BY vm_date DESC');
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
      .input('id', Number(id))
      .query('SELECT * FROM vehicle_maintenance WHERE vm_id_pk = @id');

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
      .input('vehicleId', Number(vehicleId))
      .query(`
        SELECT * FROM vehicle_maintenance 
        WHERE vm_vehicle_id_fk = @vehicleId AND vm_deleted_at IS NULL 
        ORDER BY vm_date DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching maintenance by vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const id = maintenanceIdCounter++;
    const { vehicle_id, description, date, odo_before, odo_after, cost, status } = req.body;

    const result = await pool.request()
      .input('id', id)
      .input('vehicle_id', vehicle_id)
      .input('description', description)
      .input('date', date)
      .input('odo_before', odo_before)
      .input('odo_after', odo_after)
      .input('cost', cost)
      .input('status', status)
      .query(`
        INSERT INTO vehicle_maintenance (
          vm_id_pk, vm_vehicle_id_fk, vm_description, vm_date, vm_odo_before, vm_odo_after, vm_cost, vm_status
        ) VALUES (
          @id, @vehicle_id, @description, @date, @odo_before, @odo_after, @cost, @status
        );
        SELECT * FROM vehicle_maintenance WHERE vm_id_pk = @id;
      `);

    // Update vehicle status based on maintenance status
    if (status) {
      const normalized = status.trim().toLowerCase();
      const newStatus = (["scheduled", "in progress"].includes(normalized)) ? 'maintenance'
        : (["completed"].includes(normalized)) ? 'active'
        : null;

      if (newStatus) {
        await pool.request()
          .input('vehicle_id', vehicle_id)
          .input('status', newStatus)
          .query(`
            UPDATE vehicles
            SET v_status = @status
            WHERE v_id_pk = @vehicle_id;
          `);
      }
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
    const { vehicle_id, description, date, odo_before, odo_after, cost, status } = req.body;

    const result = await pool.request()
      .input('id', Number(id))
      .input('vehicle_id', vehicle_id)
      .input('description', description)
      .input('date', date)
      .input('odo_before', odo_before)
      .input('odo_after', odo_after)
      .input('cost', cost)
      .input('status', status)
      .query(`
        UPDATE vehicle_maintenance 
        SET vm_vehicle_id_fk = @vehicle_id,
            vm_description = @description,
            vm_date = @date,
            vm_odo_before = @odo_before,
            vm_odo_after = @odo_after,
            vm_cost = @cost,
            vm_status = @status,
            vm_modified_on = GETDATE()
        WHERE vm_id_pk = @id;
        SELECT * FROM vehicle_maintenance WHERE vm_id_pk = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update vehicle status
    if (status) {
      const normalized = status.trim().toLowerCase();
      const newStatus = (["scheduled", "in progress"].includes(normalized)) ? 'maintenance'
        : (["completed"].includes(normalized)) ? 'active'
        : null;

      if (newStatus) {
        await pool.request()
          .input('vehicle_id', vehicle_id)
          .input('status', newStatus)
          .query(`
            UPDATE vehicles
            SET v_status = @status
            WHERE v_id_pk = @vehicle_id;
          `);
      }
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

    const updateFields: string[] = [];
    const inputs: any = { id: Number(id) };

    Object.entries(req.body).forEach(([key, value]) => {
      const dbKey = `vm_${key}`;
      updateFields.push(`${dbKey} = @${dbKey}`);
      inputs[dbKey] = value;
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `
      UPDATE vehicle_maintenance 
      SET ${updateFields.join(', ')}, vm_modified_on = GETDATE()
      WHERE vm_id_pk = @id;
      SELECT * FROM vehicle_maintenance WHERE vm_id_pk = @id;
    `;

    const request = pool.request();
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update vehicle status if needed
    const updatedStatus = req.body.status;
    if (updatedStatus) {
      const normalized = updatedStatus.trim().toLowerCase();
      const vehicle_id = result.recordset[0].vm_vehicle_id_fk;
      const newStatus = (["scheduled", "in progress"].includes(normalized)) ? 'maintenance'
        : (["completed"].includes(normalized)) ? 'active'
        : null;

      if (newStatus) {
        await pool.request()
          .input('vehicle_id', vehicle_id)
          .input('status', newStatus)
          .query(`
            UPDATE vehicles
            SET v_status = @status
            WHERE v_id_pk = @vehicle_id;
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
      .input('id', Number(id))
      .query(`
        UPDATE vehicle_maintenance
        SET vm_deleted_at = GETDATE()
        WHERE vm_id_pk = @id
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
      .query(`
        SELECT * FROM vehicle_maintenance 
        WHERE vm_status = 'completed' AND vm_deleted_at IS NULL 
        ORDER BY vm_date DESC
      `);
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
      .query(`
        SELECT * FROM vehicle_maintenance 
        WHERE vm_status = 'scheduled' AND vm_deleted_at IS NULL 
        ORDER BY vm_date ASC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching scheduled maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDeletedMaintenance = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicle_maintenance WHERE vm_deleted_at IS NOT NULL ORDER BY vm_date DESC');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};