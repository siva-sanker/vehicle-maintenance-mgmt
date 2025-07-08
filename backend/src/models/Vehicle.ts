import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  name: string;
  type: string;
  registrationNumber: string;
}

const VehicleSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  registrationNumber: { type: String, required: true },
});

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);