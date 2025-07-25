import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(__dirname, '../data/db.json');

const readDb = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const writeDb = (data: any) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const getVehicles = (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.vehicles.filter((v: any) => !v.deletedAt));
};

export const getVehicleById = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const vehicle = db.vehicles.find((v: any) => v.id === id && !v.deletedAt);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle);
};

export const createVehicle = (req: Request, res: Response) => {
  const db = readDb();
  const newVehicle = { id: uuidv4().slice(0, 4), ...req.body, deletedAt: null, lastUpdated: new Date().toISOString() };
  db.vehicles.push(newVehicle);
  writeDb(db);
  res.status(201).json(newVehicle);
};

export const updateVehicle = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.vehicles.findIndex((v: any) => v.id === id);
  if (index === -1) return res.status(404).json({ message: 'Vehicle not found' });

  db.vehicles[index] = { ...req.body, id, lastUpdated: new Date().toISOString() };
  writeDb(db);
  res.json(db.vehicles[index]);
};

export const patchVehicle = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const vehicle = db.vehicles.find((v: any) => v.id === id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  Object.assign(vehicle, req.body);
  vehicle.lastUpdated = new Date().toISOString();
  writeDb(db);
  res.json(vehicle);
};

export const deleteVehicle = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.vehicles.findIndex((v: any) => v.id === id);
  if (index === -1) return res.status(404).json({ message: 'Vehicle not found' });

  db.vehicles.splice(index, 1);
  writeDb(db);
  res.status(204).send();
};

export const softDeleteVehicle = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const vehicle = db.vehicles.find((v: any) => v.id === id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  vehicle.deletedAt = new Date().toISOString();
  vehicle.lastUpdated = new Date().toISOString();
  writeDb(db);
  res.json({ message: 'Vehicle soft-deleted' });
};

export const restoreVehicle = (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const vehicle = db.vehicles.find((v: any) => v.id === id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  vehicle.deletedAt = null;
  vehicle.lastUpdated = new Date().toISOString();
  writeDb(db);
  res.json({ message: 'Vehicle restored' });
};

export const searchVehicles = (req: Request, res: Response) => {
  const { make, model, status } = req.query;
  const db = readDb();
  let vehicles = db.vehicles.filter((v: any) => !v.deletedAt);

  if (make) vehicles = vehicles.filter((v: any) => v.make.toLowerCase().includes((make as string).toLowerCase()));
  if (model) vehicles = vehicles.filter((v: any) => v.model.toLowerCase().includes((model as string).toLowerCase()));
  if (status) vehicles = vehicles.filter((v: any) => v.status === status);

  res.json(vehicles);
};
