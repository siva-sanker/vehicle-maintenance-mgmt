import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

// Auto-increment helper (simulate bigint ID generator — replace with real sequence if needed)
let vehicleIdCounter = Date.now(); // just for simulation in development

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicles WHERE v_deleted_at IS NULL');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request().query('SELECT * FROM vehicles');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();
    const result = await pool.request()
      .input('id', Number(id))
      .query('SELECT * FROM vehicles WHERE v_id_pk = @id AND v_deleted_at IS NULL');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const id = vehicleIdCounter++; // Simulated BIGINT ID

    const {
      make, model, purchase_date, registration_number, purchase_price,
      fuel_type, engine_number, chassis_number, kilometers, color,
      owner, phone, address
    } = req.body;

    const result = await pool.request()
      .input('id', id)
      .input('make', make)
      .input('model', model)
      .input('purchase_date', purchase_date)
      .input('registration_number', registration_number)
      .input('purchase_price', purchase_price)
      .input('fuel_type', fuel_type)
      .input('engine_number', engine_number)
      .input('chassis_number', chassis_number)
      .input('kilometers', kilometers)
      .input('color', color)
      .input('owner', owner)
      .input('phone', phone)
      .input('address', address)
      .query(`
        INSERT INTO vehicles (
          v_id_pk, v_make, v_model, v_purchase_date, v_registration_number, 
          v_purchase_price, v_fuel_type, v_engine_number, v_chassis_number, 
          v_kilometers, v_color, v_owner, v_phone, v_address
        ) VALUES (
          @id, @make, @model, @purchase_date, @registration_number, 
          @purchase_price, @fuel_type, @engine_number, @chassis_number, 
          @kilometers, @color, @owner, @phone, @address
        );
        SELECT * FROM vehicles WHERE v_id_pk = @id;
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const {
      make, model, purchase_date, registration_number, purchase_price,
      fuel_type, engine_number, chassis_number, kilometers, color,
      owner, phone, address, status
    } = req.body;

    const result = await pool.request()
      .input('id', Number(id))
      .input('make', make)
      .input('model', model)
      .input('purchase_date', purchase_date)
      .input('registration_number', registration_number)
      .input('purchase_price', purchase_price)
      .input('fuel_type', fuel_type)
      .input('engine_number', engine_number)
      .input('chassis_number', chassis_number)
      .input('kilometers', kilometers)
      .input('color', color)
      .input('owner', owner)
      .input('phone', phone)
      .input('address', address)
      .input('status', status)
      .query(`
        UPDATE vehicles 
        SET v_make = @make, v_model = @model, v_purchase_date = @purchase_date,
            v_registration_number = @registration_number, v_purchase_price = @purchase_price,
            v_fuel_type = @fuel_type, v_engine_number = @engine_number, 
            v_chassis_number = @chassis_number, v_kilometers = @kilometers,
            v_color = @color, v_owner = @owner, v_phone = @phone, v_address = @address,
            v_status = @status, v_modified_on = GETDATE()
        WHERE v_id_pk = @id;
        SELECT * FROM vehicles WHERE v_id_pk = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const patchVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const updateFields: string[] = [];
    const inputs: any = { id: Number(id) };

    Object.entries(req.body).forEach(([key, value]) => {
      const dbKey = `v_${key}`;
      updateFields.push(`${dbKey} = @${dbKey}`);
      inputs[dbKey] = value;
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `
      UPDATE vehicles 
      SET ${updateFields.join(', ')}, v_modified_on = GETDATE()
      WHERE v_id_pk = @id;
      SELECT * FROM vehicles WHERE v_id_pk = @id;
    `;

    const request = pool.request();
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error patching vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const result = await pool.request()
      .input('id', Number(id))
      .query('DELETE FROM vehicles WHERE v_id_pk = @id');

    if (result.rowsAffected[0] === 0) {
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
    const pool = getDatabase();

    const result = await pool.request()
      .input('id', Number(id))
      .query(`
        UPDATE vehicles 
        SET v_deleted_at = GETDATE(), v_modified_on = GETDATE()
        WHERE v_id_pk = @id;
        SELECT * FROM vehicles WHERE v_id_pk = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle soft-deleted', vehicle: result.recordset[0] });
  } catch (error) {
    console.error('Error soft-deleting vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const restoreVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getDatabase();

    const result = await pool.request()
      .input('id', Number(id))
      .query(`
        UPDATE vehicles 
        SET v_deleted_at = NULL, v_modified_on = GETDATE()
        WHERE v_id_pk = @id;
        SELECT * FROM vehicles WHERE v_id_pk = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle restored', vehicle: result.recordset[0] });
  } catch (error) {
    console.error('Error restoring vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchVehicles = async (req: Request, res: Response) => {
  try {
    const { make, model, status, q } = req.query;
    const pool = getDatabase();

    let query = 'SELECT * FROM vehicles WHERE v_deleted_at IS NULL';
    const inputs: any = {};

    if (q) {
      query += ' AND (v_make LIKE @search OR v_model LIKE @search OR v_registration_number LIKE @search)';
      inputs.search = `%${q}%`;
    }
    if (make) {
      query += ' AND v_make LIKE @make';
      inputs.make = `%${make}%`;
    }
    if (model) {
      query += ' AND v_model LIKE @model';
      inputs.model = `%${model}%`;
    }
    if (status) {
      query += ' AND v_status = @status';
      inputs.status = status;
    }

    const request = pool.request();
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
