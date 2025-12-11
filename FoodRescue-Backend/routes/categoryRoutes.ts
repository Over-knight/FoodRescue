import { Router } from "express";
import { 
    getCategories,
    getCategoryBySlug,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
 } from "../controllers/categoryController";
import { authenticateToken } from "../middleware/auth";
import { uploadCategoryImage } from "../middleware/uploadMiddleware";

const router = Router()

// Public routes
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/id/:id", getCategoryById);

// Protected routes - admin only
router.post("/", authenticateToken, uploadCategoryImage.single("image"), createCategory);
router.put("/:id", authenticateToken, uploadCategoryImage.single("image"), updateCategory);
router.delete("/:id", authenticateToken, deleteCategory);

export default router;