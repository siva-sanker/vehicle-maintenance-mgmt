import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicles WHERE deleted_at IS NULL');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.request()
      .query('SELECT * FROM vehicles');
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
      .input('id', id)
      .query('SELECT * FROM vehicles WHERE id = @id AND deleted_at IS NULL');

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
    const id = uuidv4().slice(0, 8);
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
        INSERT INTO vehicles (id, make, model, purchase_date, registration_number, 
                            purchase_price, fuel_type, engine_number, chassis_number, 
                            kilometers, color, owner, phone, address)
        VALUES (@id, @make, @model, @purchase_date, @registration_number, 
                @purchase_price, @fuel_type, @engine_number, @chassis_number, 
                @kilometers, @color, @owner, @phone, @address);
        SELECT * FROM vehicles WHERE id = @id;
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
      .input('status', status)
      .query(`
        UPDATE vehicles 
        SET make = @make, model = @model, purchase_date = @purchase_date,
            registration_number = @registration_number, purchase_price = @purchase_price,
            fuel_type = @fuel_type, engine_number = @engine_number, 
            chassis_number = @chassis_number, kilometers = @kilometers,
            color = @color, owner = @owner, phone = @phone, address = @address,
            status = @status, last_updated = GETDATE()
        WHERE id = @id;
        SELECT * FROM vehicles WHERE id = @id;
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
      UPDATE vehicles 
      SET ${updateFields.join(', ')}, last_updated = GETDATE()
      WHERE id = @id;
      SELECT * FROM vehicles WHERE id = @id;
    `;

    const request = pool.request();
    Object.keys(inputs).forEach(key => {
      request.input(key, inputs[key]);
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
      .input('id', id)
      .query('DELETE FROM vehicles WHERE id = @id');

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
      .input('id', id)
      .query(`
        UPDATE vehicles 
        SET deleted_at = GETDATE(), last_updated = GETDATE()
        WHERE id = @id;
        SELECT * FROM vehicles WHERE id = @id;
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
      .input('id', id)
      .query(`
        UPDATE vehicles 
        SET deleted_at = NULL, last_updated = GETDATE()
        WHERE id = @id;
        SELECT * FROM vehicles WHERE id = @id;
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

    let query = 'SELECT * FROM vehicles WHERE deleted_at IS NULL';
    const inputs: any = {};

    if (q) {
      query += ' AND (make LIKE @search OR model LIKE @search OR registration_number LIKE @search)';
      inputs.search = `%${q}%`;
    }
    if (make) {
      query += ' AND make LIKE @make';
      inputs.make = `%${make}%`;
    }
    if (model) {
      query += ' AND model LIKE @model';
      inputs.model = `%${model}%`;
    }
    if (status) {
      query += ' AND status = @status';
      inputs.status = status;
    }

    const request = pool.request();
    Object.keys(inputs).forEach(key => {
      request.input(key, inputs[key]);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
