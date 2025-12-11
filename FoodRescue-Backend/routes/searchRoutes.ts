import express from 'express';
import {
  getSearchSuggestions,
  getSearchFilters
} from '../controllers/searchController';

const router = express.Router();

// All routes are public
router.get('/suggestions', getSearchSuggestions);
router.get('/filters', getSearchFilters);

export default router;
