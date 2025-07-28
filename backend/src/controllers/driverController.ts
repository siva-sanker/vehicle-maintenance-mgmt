import { Request, Response } from 'express';
import { getDatabase } from '../config/database'; // Adjust the import path as necessary

export const getDrivers = async(req: Request, res: Response) => { 
    try {
    const db = getDatabase();
    const result = await db.request()
        .query('SELECT * FROM drivers WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getDriverById = async (req: Request, res: Response) => { 

};
export const createDriver = async (req: Request, res: Response) => {

 };
export const updateDriver = async (req: Request, res: Response) => { 

};
export const patchDriver = async (req: Request, res: Response) => { 

};
export const deleteDriver = async (req: Request, res: Response) => { 

};
export const softDeleteDriver = async (req: Request, res: Response) => { 

};
export const restoreDriver = async (req: Request, res: Response) => { 

}; 