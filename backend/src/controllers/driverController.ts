import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request().query(`
            SELECT 
                em.em_employeeid_pk AS id,
                CONCAT(em.EM_FirstName, ' ', ISNULL(em.EM_LastName, '')) AS name, 
                em.em_mobile AS phone, 
                em.em_address AS address
            FROM EMP_Physician_Master em
            ORDER BY em.EM_FirstName
        `);

        const drivers = result.recordset.map(driver => {
            return {
                id: driver.id,
                name: driver.name.trim(),
                phone: driver.phone,
                address: driver.address,
                license_number: null,
                status: 'active',
                assignedVehicleIds: [],
                created_at: null,
                modified_by: null,
                modified_on: null,
                provider_id: null,
                outlet_id: null
            };
        });

        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request().query(`
            SELECT 
                vd.*, 
                em.EM_FirstName AS name, 
                em.em_mobile AS phone, 
                em.em_address AS address
            FROM vehicle_drivers vd
            LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
            ORDER BY vd.vd_created_at DESC
        `);

        const drivers = result.recordset.map(driver => {
            let assignedVehicleIds: string[] = [];
            if (driver.vd_assigned_vehicles) {
                try {
                    assignedVehicleIds = JSON.parse(driver.vd_assigned_vehicles);
                } catch (error) {
                    console.warn(`Failed to parse assigned vehicles for driver ${driver.vd_id_pk}`, error);
                }
            }

            return {
                id: driver.vd_id_pk,
                name: driver.name,
                phone: driver.phone,
                address: driver.address,
                license_number: driver.vd_license_number,
                status: driver.vd_status,
                assignedVehicleIds,
                created_at: driver.vd_created_at,
                modified_by: driver.vd_modified_by_fk,
                modified_on: driver.vd_modified_on,
                provider_id: driver.vd_provider_id_fk,
                outlet_id: driver.vd_outlet_fk,
                deleted_at: driver.vd_deleted_at
            };
        });

        res.json(drivers);
    } catch (error) {
        console.error('Error fetching all drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getDriverById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name,
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @id AND vd.vd_deleted_at IS NULL
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const driver = result.recordset[0];
        let assignedVehicleIds: string[] = [];
        if (driver.vd_assigned_vehicles) {
            try {
                assignedVehicleIds = JSON.parse(driver.vd_assigned_vehicles);
            } catch (error) {
                console.warn(`Failed to parse assigned vehicles for driver ${driver.vd_id_pk}`, error);
            }
        }

        res.json({
            id: driver.vd_id_pk,
            name: driver.name,
            phone: driver.phone,
            address: driver.address,
            license_number: driver.vd_license_number,
            status: driver.vd_status,
            assignedVehicleIds,
            created_at: driver.vd_created_at,
            modified_by: driver.vd_modified_by_fk,
            modified_on: driver.vd_modified_on,
            provider_id: driver.vd_provider_id_fk,
            outlet_id: driver.vd_outlet_fk
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const createDriver = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();

        const { employeeId, license_number, status, assignedVehicleIds, outlet_id, provider_id, modified_by } = req.body;

        // Validate employee exists
        const employeeCheck = await pool.request()
            .input('employeeId', employeeId)
            .query('SELECT EM_FirstName, em_mobile, em_address FROM EMP_Physician_Master WHERE em_employeeid_pk = @employeeId');

        if (employeeCheck.recordset.length === 0) {
            return res.status(400).json({ message: 'Employee not found' });
        }

        // Convert assignedVehicleIds array to JSON string if provided
        const assignedVehicleIdsStr = assignedVehicleIds && Array.isArray(assignedVehicleIds)
            ? JSON.stringify(assignedVehicleIds)
            : null;

        // Validate assigned vehicle IDs if provided
        if (assignedVehicleIds && assignedVehicleIds.length > 0) {
            const vehicleChecks = (assignedVehicleIds as string[]).map(v => `'${v}'`).join(',');
            const vehicleValidation = await pool.request()
                .query(`SELECT COUNT(*) AS count FROM vehicles WHERE id IN (${vehicleChecks}) AND deleted_at IS NULL`);

            if (vehicleValidation.recordset[0].count !== assignedVehicleIds.length) {
                return res.status(400).json({ message: 'One or more assigned vehicle IDs are invalid or deleted' });
            }
        }

        // Insert driver
        await pool.request()
            .input('id', employeeId)
            .input('license_number', license_number)
            .input('status', status || 'active')
            .input('assignedVehicleIds', assignedVehicleIdsStr)
            .input('outlet_id', outlet_id)
            .input('provider_id', provider_id)
            .input('modified_by', modified_by)
            .query(`
                INSERT INTO vehicle_drivers (
                    vd_id_pk, vd_license_number, vd_status, vd_assigned_vehicles,
                    vd_created_at, vd_modified_on, vd_outlet_fk, vd_provider_id_fk, vd_modified_by_fk
                )
                VALUES (
                    @id, @license_number, @status, @assignedVehicleIds,
                    GETDATE(), GETDATE(), @outlet_id, @provider_id, @modified_by
                );
            `);

        // Return driver with joined data
        const result = await pool.request()
            .input('id', employeeId)
            .query(`
                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name, 
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @id
            `);

        const driver = result.recordset[0];
        const assignedVehicleIdsParsed = driver.vd_assigned_vehicles ? JSON.parse(driver.vd_assigned_vehicles) : [];

        res.status(201).json({
            id: driver.vd_id_pk,
            name: driver.name,
            phone: driver.phone,
            address: driver.address,
            license_number: driver.vd_license_number,
            status: driver.vd_status,
            assignedVehicleIds: assignedVehicleIdsParsed,
            created_at: driver.vd_created_at,
            outlet_id: driver.vd_outlet_fk,
            provider_id: driver.vd_provider_id_fk
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();
        const { license_number, status, assignedVehicleIds, outlet_id, provider_id, modified_by } = req.body;

        // Convert assignedVehicleIds array to JSON string if provided
        const assignedVehicleIdsStr = assignedVehicleIds && Array.isArray(assignedVehicleIds)
            ? JSON.stringify(assignedVehicleIds)
            : null;

        // Validate driver exists
        const existing = await pool.request()
            .input('id', id)
            .query('SELECT * FROM vehicle_drivers WHERE vd_id_pk = @id AND vd_deleted_at IS NULL');

        if (existing.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Update driver
        await pool.request()
            .input('id', id)
            .input('license_number', license_number)
            .input('status', status)
            .input('assignedVehicleIds', assignedVehicleIdsStr)
            .input('outlet_id', outlet_id)
            .input('provider_id', provider_id)
            .input('modified_by', modified_by)
            .query(`
                UPDATE vehicle_drivers 
                SET vd_license_number = @license_number,
                    vd_status = @status,
                    vd_assigned_vehicles = @assignedVehicleIds,
                    vd_outlet_fk = @outlet_id,
                    vd_provider_id_fk = @provider_id,
                    vd_modified_by_fk = @modified_by,
                    vd_modified_on = GETDATE()
                WHERE vd_id_pk = @id;
            `);

        // Return updated driver with joined data
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name,
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @id
            `);

        const driver = result.recordset[0];
        const assignedVehicleIdsParsed = driver.vd_assigned_vehicles ? JSON.parse(driver.vd_assigned_vehicles) : [];

        res.json({
            id: driver.vd_id_pk,
            name: driver.name,
            phone: driver.phone,
            address: driver.address,
            license_number: driver.vd_license_number,
            status: driver.vd_status,
            assignedVehicleIds: assignedVehicleIdsParsed,
            outlet_id: driver.vd_outlet_fk,
            provider_id: driver.vd_provider_id_fk,
            modified_on: driver.vd_modified_on
        });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const patchDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        // Build dynamic SQL update query
        const updateFields: string[] = [];
        const inputs: any = { id };

        Object.keys(req.body).forEach(key => {
            if (key !== 'id') {
                const columnName = `vd_${key}`;
                updateFields.push(`${columnName} = @${key}`);
                inputs[key] = req.body[key];
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Always update timestamp and status to inactive
        updateFields.push("vd_modified_on = GETDATE()");
        updateFields.push("vd_status = 'inactive'");

        const query = `
            UPDATE vehicle_drivers 
            SET ${updateFields.join(', ')}
            WHERE vd_id_pk = @id;

            SELECT 
                vd.*, 
                em.EM_FirstName AS name,
                em.em_mobile AS phone, 
                em.em_address AS address
            FROM vehicle_drivers vd
            LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
            WHERE vd.vd_id_pk = @id;
        `;

        const request = pool.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const driver = result.recordset[0];
        const assignedVehicleIds = driver.vd_assigned_vehicles ? JSON.parse(driver.vd_assigned_vehicles) : [];

        res.json({
            id: driver.vd_id_pk,
            name: driver.name,
            phone: driver.phone,
            address: driver.address,
            license_number: driver.vd_license_number,
            status: driver.vd_status,
            assignedVehicleIds,
            outlet_id: driver.vd_outlet_fk,
            provider_id: driver.vd_provider_id_fk,
            modified_on: driver.vd_modified_on
        });
    } catch (error) {
        console.error('Error patching driver:', error);
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
                UPDATE vehicle_drivers 
                SET vd_deleted_at = NULL, vd_modified_on = GETDATE(), vd_status = 'active'
                WHERE vd_id_pk = @id;

                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name,
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const driver = result.recordset[0];
        const assignedVehicleIds = driver.vd_assigned_vehicles ? JSON.parse(driver.vd_assigned_vehicles) : [];

        res.json({
            message: 'Driver restored',
            driver: {
                id: driver.vd_id_pk,
                name: driver.name,
                phone: driver.phone,
                address: driver.address,
                license_number: driver.vd_license_number,
                status: driver.vd_status,
                assignedVehicleIds,
                outlet_id: driver.vd_outlet_fk,
                provider_id: driver.vd_provider_id_fk,
                modified_on: driver.vd_modified_on
            }
        });
    } catch (error) {
        console.error('Error restoring driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const assignVehicleToDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const vehicleIds: string[] = req.body.vehicleIds;
    const pool = getDatabase();

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({ message: 'vehicleId must be a non-empty array' });
    }
    console.log('Received vehicleIds:', vehicleIds);

    let driverCheck = await pool.request()
      .input('driverId', driverId)
      .query(`
        SELECT vd_assigned_vehicles 
        FROM vehicle_drivers 
        WHERE vd_id_pk = @driverId AND vd_deleted_at IS NULL
      `);

    if (driverCheck.recordset.length === 0) {
      const empCheck = await pool.request()
        .input('driverId', driverId)
        .query(`
          SELECT em_employeeid_pk, EM_FirstName, em_mobile, em_address
          FROM EMP_Physician_Master
          WHERE em_employeeid_pk = @driverId
        `);

      if (empCheck.recordset.length === 0) {
        return res.status(404).json({ message: 'Driver not found in system' });
      }

      await pool.request()
        .input('driverId', driverId)
        .query(`
          INSERT INTO vehicle_drivers (vd_id_pk, vd_assigned_vehicles, vd_created_at)
          VALUES (@driverId, '[]', GETDATE())
        `);

      driverCheck = await pool.request()
        .input('driverId', driverId)
        .query(`
          SELECT vd_assigned_vehicles 
          FROM vehicle_drivers 
          WHERE vd_id_pk = @driverId AND vd_deleted_at IS NULL
        `);
    }

    let assigned: string[] = [];
    try {
      assigned = driverCheck.recordset[0].vd_assigned_vehicles
        ? JSON.parse(driverCheck.recordset[0].vd_assigned_vehicles)
        : [];
    } catch {
      assigned = [];
    }

    vehicleIds.forEach((id) => {
      const idStr = id.toString();
      if (!assigned.includes(idStr)) {
        assigned.push(idStr);
      }
    });

    await pool.request()
      .input('driverId', driverId)
      .input('assigned', JSON.stringify(assigned))
      .query(`
        UPDATE vehicle_drivers 
        SET vd_assigned_vehicles = @assigned, vd_modified_on = GETDATE()
        WHERE vd_id_pk = @driverId
      `);

    const result = await pool.request()
      .input('driverId', driverId)
      .query(`
        SELECT 
          vd.*, 
          em.EM_FirstName AS name,
          em.em_mobile AS phone, 
          em.em_address AS address
        FROM vehicle_drivers vd
        LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
        WHERE vd.vd_id_pk = @driverId
      `);

    const driver = result.recordset[0];

    res.json({
      message: 'Vehicles assigned successfully',
      driver: {
        id: driver.vd_id_pk,
        name: driver.name,
        phone: driver.phone,
        address: driver.address,
        assignedVehicleIds: assigned,
      },
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};


// Bulk assign multiple vehicles to driver
export const assignMultipleVehiclesToDriver = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const { vehicleIds } = req.body;
        const pool = getDatabase();

        if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
            return res.status(400).json({ message: 'vehicleIds must be a non-empty array' });
        }

        // Check if driver exists or create new entry
        const driverCheck = await pool.request()
            .input('driverId', driverId)
            .query(`
                SELECT vd_assigned_vehicles 
                FROM vehicle_drivers 
                WHERE vd_id_pk = @driverId AND vd_deleted_at IS NULL
            `);

        // If driver doesn't exist in vehicle_drivers table, create entry
        if (driverCheck.recordset.length === 0) {
            // Check if employee exists
            const employeeCheck = await pool.request()
                .input('driverId', driverId)
                .query('SELECT EM_FirstName FROM EMP_Physician_Master WHERE em_employeeid_pk = @driverId');

            if (employeeCheck.recordset.length === 0) {
                return res.status(404).json({ message: 'Driver not found in employee master' });
            }

            // Create new driver entry
            await pool.request()
                .input('driverId', driverId)
                .input('assigned', JSON.stringify(vehicleIds))
                .query(`
                    INSERT INTO vehicle_drivers (vd_id_pk, vd_status, vd_assigned_vehicles, vd_created_at, vd_modified_on)
                    VALUES (@driverId, 'active', @assigned, GETDATE(), GETDATE())
                `);
        } else {
            // Parse current assigned vehicles
            let assigned: string[] = [];
            try {
                assigned = driverCheck.recordset[0].vd_assigned_vehicles
                    ? JSON.parse(driverCheck.recordset[0].vd_assigned_vehicles)
                    : [];
            } catch {
                assigned = [];
            }

            // Add new vehicle IDs (avoid duplicates)
            for (const vehicleId of vehicleIds) {
                if (!assigned.includes(vehicleId)) {
                    assigned.push(vehicleId);
                }
            }

            // Update assignment
            await pool.request()
                .input('driverId', driverId)
                .input('assigned', JSON.stringify(assigned))
                .query(`
                    UPDATE vehicle_drivers 
                    SET vd_assigned_vehicles = @assigned, vd_modified_on = GETDATE()
                    WHERE vd_id_pk = @driverId
                `);
        }

        // Return updated driver data
        const result = await pool.request()
            .input('driverId', driverId)
            .query(`
                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name,
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @driverId
            `);

        const driver = result.recordset[0];
        const assignedVehicleIds = driver.vd_assigned_vehicles ? JSON.parse(driver.vd_assigned_vehicles) : [];

        res.json({
            message: `Successfully assigned ${vehicleIds.length} vehicles to driver`,
            driver: {
                id: driver.vd_id_pk,
                name: driver.name,
                phone: driver.phone,
                address: driver.address,
                assignedVehicleIds
            }
        });
    } catch (error) {
        console.error('Error assigning multiple vehicles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const unassignVehicleFromDriver = async (req: Request, res: Response) => {
    try {
        const { driverId, vehicleId } = req.params;
        const pool = getDatabase();

        const driverCheck = await pool.request()
            .input('driverId', driverId)
            .query(`
                SELECT vd_assigned_vehicles 
                FROM vehicle_drivers 
                WHERE vd_id_pk = @driverId AND vd_deleted_at IS NULL
            `);

        if (driverCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        let assigned: string[] = [];
        try {
            assigned = driverCheck.recordset[0].vd_assigned_vehicles
                ? JSON.parse(driverCheck.recordset[0].vd_assigned_vehicles)
                : [];
        } catch {
            assigned = [];
        }

        if (!assigned.includes(vehicleId)) {
            return res.status(400).json({ message: 'Vehicle not assigned to this driver' });
        }

        assigned = assigned.filter(v => v !== vehicleId);

        const result = await pool.request()
            .input('driverId', driverId)
            .input('assigned', JSON.stringify(assigned))
            .query(`
                UPDATE vehicle_drivers 
                SET vd_assigned_vehicles = @assigned, vd_modified_on = GETDATE()
                WHERE vd_id_pk = @driverId;

                SELECT 
                    vd.*, 
                    em.EM_FirstName AS name,
                    em.em_mobile AS phone, 
                    em.em_address AS address
                FROM vehicle_drivers vd
                LEFT JOIN EMP_Physician_Master em ON vd.vd_id_pk = em.em_employeeid_pk
                WHERE vd.vd_id_pk = @driverId;
            `);

        const driver = result.recordset[0];

        res.json({
            message: 'Vehicle unassigned successfully',
            driver: {
                id: driver.vd_id_pk,
                name: driver.name,
                phone: driver.phone,
                address: driver.address,
                assignedVehicleIds: assigned
            }
        });
    } catch (error) {
        console.error('Error unassigning vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDriverAssignedVehicles = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const pool = getDatabase();

        // Step 1: Fetch assigned vehicle IDs for driver
        const driverResult = await pool.request()
            .input('driverId', driverId)
            .query(`
                SELECT vd_assigned_vehicles 
                FROM vehicle_drivers 
                WHERE vd_id_pk = @driverId AND vd_deleted_at IS NULL
            `);

        if (driverResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found or deleted' });
        }

        // Step 2: Parse vehicle IDs
        let assignedVehicleIds: string[] = [];
        try {
            const raw = driverResult.recordset[0].vd_assigned_vehicles;
            if (raw) {
                assignedVehicleIds = JSON.parse(raw);
            }
        } catch (err) {
            console.warn('Invalid JSON for assigned vehicles:', err);
        }

        if (assignedVehicleIds.length === 0) {
            return res.json([]); // No vehicles assigned
        }

        // Step 3: Fetch vehicle details
        const placeholders = assignedVehicleIds.map((_, index) => `@v${index}`).join(',');
        const request = pool.request();
        assignedVehicleIds.forEach((id, index) => {
            request.input(`v${index}`, id);
        });

        const vehicleResult = await request.query(`
            SELECT v_id_pk,v_make,v_model,v_registration_number FROM vehicles 
            WHERE v_id_pk IN (${placeholders}) AND v_deleted_at IS NULL
        `);

        res.json(vehicleResult.recordset);
    } catch (error) {
        console.error('Error getting driver assigned vehicles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
