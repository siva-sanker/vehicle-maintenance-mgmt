import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

export const getAssignedDrivers = async (req: Request, res: Response) => {
    try {
        const pool = getDatabase();
        const result = await pool.request()
            .query('select * from EMP_Physician_Master where EM_Title_FK=114');
        
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