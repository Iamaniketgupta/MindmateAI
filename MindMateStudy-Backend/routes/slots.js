import express  from "express";
import { addSlot, getSlotsByDoctorId } from "../controllers/slots.js";
const slotsRouter = express.Router();

slotsRouter.post("/add",addSlot);
slotsRouter.get("/:id",getSlotsByDoctorId);

export default slotsRouter;