import express from "express";
import vehicleRoutes from "./routes/vehicleRoutes";

const app = express();

app.use(express.json());
app.use("/", vehicleRoutes);

export default app;