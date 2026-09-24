import express from 'express';
import {
  createListing,
  getListings,
  getNearbyFood,
  getListingById,
  updateListing,
  deleteListing
} from '../controllers/foodController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/nearby', getNearbyFood);
router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('donor', 'admin'), createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

// Image upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.originalname });
});

export default router;
