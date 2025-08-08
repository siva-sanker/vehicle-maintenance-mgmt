import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM drivers WHERE deleted_at IS NULL ORDER BY created_at DESC');
        
        // Parse assigned_vehicles from JSON string to array for each driver
        const driversWithParsedVehicles = result.recordset.map(driver => {
            let assignedVehicleIds: string[] = [];
            if (driver.assigned_vehicles) {
                try {
                    assignedVehicleIds = JSON.parse(driver.assigned_vehicles);
                } catch (error) {
                    console.warn(`Failed to parse assigned_vehicles for driver ${driver.id}:`, error);
                    assignedVehicleIds = [];
                }
            }
            return {
                ...driver,
                assignedVehicleIds
            };
        });
        
        res.json(driversWithParsedVehicles);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getAllDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('SELECT * FROM drivers');
        
        // Parse assigned_vehicles from JSON string to array for each driver
        const driversWithParsedVehicles = result.recordset.map(driver => {
            let assignedVehicleIds: string[] = [];
            if (driver.assigned_vehicles) {
                try {
                    assignedVehicleIds = JSON.parse(driver.assigned_vehicles);
                } catch (error) {
                    console.warn(`Failed to parse assigned_vehicles for driver ${driver.id}:`, error);
                    assignedVehicleIds = [];
                }
            }
            return {
                ...driver,
                assignedVehicleIds
            };
        });
        
        res.json(driversWithParsedVehicles);
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
        
        const driver = result.recordset[0];
        let assignedVehicleIds: string[] = [];
        if (driver.assigned_vehicles) {
            try {
                assignedVehicleIds = JSON.parse(driver.assigned_vehicles);
            } catch (error) {
                console.warn(`Failed to parse assigned_vehicles for driver ${driver.id}:`, error);
                assignedVehicleIds = [];
            }
        }
        
        res.json({
            ...driver,
            assignedVehicleIds
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDriver = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const id = uuidv4().slice(0, 8);
        const { name, phone, address, license_number, status, assignedVehicleIds } = req.body;
        // console.log(req.body);
        // Convert assignedVehicleIds array to JSON string if provided
        const assignedVehicleIdsStr = assignedVehicleIds && Array.isArray(assignedVehicleIds) 
            ? JSON.stringify(assignedVehicleIds) 
            : null;

        // Validate assigned vehicle IDs exist in vehicles table if provided
        if (assignedVehicleIds && Array.isArray(assignedVehicleIds) && assignedVehicleIds.length > 0) {
            const vehicleChecks = assignedVehicleIds.map(vehicleId => `'${vehicleId}'`).join(',');
            const vehicleValidation = await pool.request()
                .query(`SELECT COUNT(*) as count FROM vehicles WHERE id IN (${vehicleChecks}) AND deleted_at IS NULL`);
            
            if (vehicleValidation.recordset[0].count !== assignedVehicleIds.length) {
                return res.status(400).json({ 
                    message: 'One or more assigned vehicle IDs do not exist or are deleted' 
                });
            }
        }

        const result = await pool.request()
            .input('id', id)
            .input('name', name)
            .input('phone', phone)
            .input('address', address)
            .input('license_number', license_number)
            .input('status', status || 'active')
            .input('assignedVehicleIds', assignedVehicleIdsStr)
            .query(`
                INSERT INTO drivers (id, name, phone, address, license_number, status, assigned_vehicles)
                VALUES (@id, @name, @phone, @address, @license_number, @status, @assignedVehicleIds);
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
        const { name, phone, address, license_number, status, assignedVehicleIds } = req.body;
        
        // Convert assignedVehicleIds array to JSON string if provided
        const assignedVehicleIdsStr = assignedVehicleIds && Array.isArray(assignedVehicleIds) 
            ? JSON.stringify(assignedVehicleIds) 
            : null;

        const result = await pool.request()
            .input('id', id)
            .input('name', name)
            .input('phone', phone)
            .input('address', address)
            .input('license_number', license_number)
            .input('status', status)
            .input('assignedVehicleIds', assignedVehicleIdsStr)
            .query(`
                UPDATE drivers 
                SET name = @name, phone = @phone, address = @address, 
                    license_number = @license_number, status = @status, 
                    assigned_vehicles = @assignedVehicleIds,
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
            SET ${updateFields.join(', ')}, last_updated = GETDATE(), status='inactive'
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

// export const deleteDriver = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const pool = getDatabase();

//         const result = await pool.request()
//             .input('id', id)
//             .query('DELETE FROM drivers WHERE id = @id');

//         if (result.rowsAffected[0] === 0) {
//             return res.status(404).json({ message: 'Driver not found' });
//         }
//         res.status(204).send();
//     } catch (error) {
//         console.error('Error deleting driver:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// export const softDeleteDriver = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const pool = getDatabase();

//         const result = await pool.request()
//             .input('id', id)
//             .query(`
//                 UPDATE drivers 
//                 SET deleted_at = GETDATE(), last_updated = GETDATE() 
//                 WHERE id = @id;
//                 SELECT * FROM drivers WHERE id = @id;
//             `);

//         if (result.recordset.length === 0) {
//             return res.status(404).json({ message: 'Driver not found' });
//         }
//         res.json({ message: 'Driver soft-deleted', driver: result.recordset[0] });
//     } catch (error) {
//         console.error('Error soft-deleting driver:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

export const restoreDriver = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = getDatabase();

        const result = await pool.request()
            .input('id', id)
            .query(`
                UPDATE drivers 
                SET deleted_at = NULL, last_updated = GETDATE(), status='active'
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

export const assignVehicleToDriver = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const { vehicleId } = req.body;
        const pool = getDatabase();

        // First check if driver exists
        const driverCheck = await pool.request()
            .input('driverId', driverId)
            .query('SELECT assigned_vehicles FROM drivers WHERE id = @driverId AND deleted_at IS NULL');

        if (driverCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Check if vehicle exists
        const vehicleCheck = await pool.request()
            .input('vehicleId', vehicleId)
            .query('SELECT id FROM vehicles WHERE id = @vehicleId AND deleted_at IS NULL');

        if (vehicleCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Get current assigned vehicles
        let currentAssignedVehicles: string[] = [];
        try {
            const assignedVehiclesStr = driverCheck.recordset[0].assigned_vehicles;
            if (assignedVehiclesStr) {
                currentAssignedVehicles = JSON.parse(assignedVehiclesStr);
            }
        } catch {
            currentAssignedVehicles = [];
        }

        // Check if vehicle is already assigned
        if (currentAssignedVehicles.includes(vehicleId)) {
            return res.status(400).json({ message: 'Vehicle already assigned to this driver' });
        }

        // Add vehicle to assigned list
        currentAssignedVehicles.push(vehicleId);

        // Update driver with new assigned vehicles
        const result = await pool.request()
            .input('driverId', driverId)
            .input('assignedVehicleIds', JSON.stringify(currentAssignedVehicles))
            .query(`
                UPDATE drivers 
                SET assigned_vehicles = @assignedVehicleIds, last_updated = GETDATE()
                WHERE id = @driverId;
                SELECT * FROM drivers WHERE id = @driverId;
            `);

        res.json({ message: 'Vehicle assigned successfully', driver: result.recordset[0] });
    } catch (error) {
        console.error('Error assigning vehicle to driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const unassignVehicleFromDriver = async (req: Request, res: Response) => {
    try {
        const { driverId, vehicleId } = req.params;
        const pool = getDatabase();

        // First check if driver exists
        const driverCheck = await pool.request()
            .input('driverId', driverId)
            .query('SELECT assigned_vehicles FROM drivers WHERE id = @driverId AND deleted_at IS NULL');

        if (driverCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Get current assigned vehicles
        let currentAssignedVehicles: string[] = [];
        try {
            const assignedVehiclesStr = driverCheck.recordset[0].assigned_vehicles;
            if (assignedVehiclesStr) {
                currentAssignedVehicles = JSON.parse(assignedVehiclesStr);
            }
        } catch {
            currentAssignedVehicles = [];
        }

        // Check if vehicle is assigned
        if (!currentAssignedVehicles.includes(vehicleId)) {
            return res.status(400).json({ message: 'Vehicle not assigned to this driver' });
        }

        // Remove vehicle from assigned list
        currentAssignedVehicles = currentAssignedVehicles.filter(id => id !== vehicleId);

        // Update driver with new assigned vehicles
        const result = await pool.request()
            .input('driverId', driverId)
            .input('assignedVehicleIds', JSON.stringify(currentAssignedVehicles))
            .query(`
                UPDATE drivers 
                SET assigned_vehicles = @assignedVehicleIds, last_updated = GETDATE()
                WHERE id = @driverId;
                SELECT * FROM drivers WHERE id = @driverId;
            `);

        res.json({ message: 'Vehicle unassigned successfully', driver: result.recordset[0] });
    } catch (error) {
        console.error('Error unassigning vehicle from driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDriverAssignedVehicles = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const pool = getDatabase();

        // Get driver with assigned vehicles
        const driverResult = await pool.request()
            .input('driverId', driverId)
            .query('SELECT assigned_vehicles FROM drivers WHERE id = @driverId AND deleted_at IS NULL');

        if (driverResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Parse assigned vehicle IDs
        let assignedVehicleIds: string[] = [];
        try {
            const assignedVehiclesStr = driverResult.recordset[0].assigned_vehicles;
            if (assignedVehiclesStr) {
                assignedVehicleIds = JSON.parse(assignedVehiclesStr);
            }
        } catch {
            assignedVehicleIds = [];
        }

        if (assignedVehicleIds.length === 0) {
            return res.json([]);
        }

        // Get vehicle details for assigned vehicles
        const placeholders = assignedVehicleIds.map((_, index) => `@vehicleId${index}`).join(',');
        const request = pool.request();
        assignedVehicleIds.forEach((id, index) => {
            request.input(`vehicleId${index}`, id);
        });

        const vehiclesResult = await request.query(`
            SELECT * FROM vehicles 
            WHERE id IN (${placeholders}) AND deleted_at IS NULL
        `);

        res.json(vehiclesResult.recordset);
    } catch (error) {
        console.error('Error getting driver assigned vehicles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};