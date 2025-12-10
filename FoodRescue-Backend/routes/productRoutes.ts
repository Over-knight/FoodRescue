import { Router } from "express";
import { 
    getProducts, 
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    incrementViewCount,
    searchProducts,
    getProductStats,
    getInventoryTracking,
    updateProductStock
} from "../controllers/productController";
import { authenticateToken } from "../middleware/auth";
import { uploadProductImages } from "../middleware/uploadMiddleware";

const router = Router()

// Public routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/id/:id", getProductById);
router.post("/:id/view", incrementViewCount);

// Protected routes - sellers/admin
router.post("/", authenticateToken, uploadProductImages.array("images", 5), createProduct);
router.put("/:id", authenticateToken, uploadProductImages.array("images", 5), updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

// Admin/Seller analytics routes
router.get("/stats/overview", authenticateToken, getProductStats);
router.get("/inventory/tracking", authenticateToken, getInventoryTracking);
router.patch("/:id/stock", authenticateToken, updateProductStock);

export default router;