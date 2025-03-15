import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Get all classrooms
router.get('/', (_req: Request, res: Response) => {
  // TODO: Implement get all classrooms
  res.status(200).json({ classrooms: [] });
});

// Create a new classroom
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;
  // TODO: Implement classroom creation
  res.status(201).json({ message: 'Classroom created successfully', classroom: { name, description } });
});

// Get a specific classroom
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement get classroom by id
  res.status(200).json({ classroom: { id } });
});

// Update a classroom
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  // TODO: Implement update classroom
  res.status(200).json({ message: 'Classroom updated successfully', classroom: { id, ...updates } });
});

// Delete a classroom
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement delete classroom
  res.status(200).json({ message: 'Classroom deleted successfully', id });
});

export default router;
