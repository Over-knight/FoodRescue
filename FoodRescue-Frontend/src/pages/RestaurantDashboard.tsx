import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { BackendProduct, BackendCategory } from '../types/api';
import { koboToNaira } from '../utils/apiHelpers';
import { Link } from 'react-router-dom';
import { ProductListItem } from '../components/ProductListItem';
import './RestaurantDashboard.css';

export const RestaurantDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<BackendProduct[]>([]);
    const [categories, setCategories] = useState<BackendCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        originalPrice: '',
        quantity: '',
        category: '',
        tags: '',
        expiryDate: '', // Add expiryDate
        unit: '', // Add unit
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (user && (user.role === 'seller' || user.role === 'restaurant')) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            console.log('Loading dashboard data...');

            // Load categories
            const cats = await categoryService.getAllCategories();
            console.log('Categories loaded:', cats);
            setCategories(cats.filter(c => c.isActive));
            console.log('Active categories:', cats.filter(c => c.isActive));

            // Load products
            const { products: prods } = await productService.getAllProducts();
            console.log('Products loaded:', prods);
            setProducts(prods);

            // Load stats (optional - can be implemented later)
            // const statsData = await productService.getProductStats();
            // setStats(statsData);
        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            console.error('Error details:', err.message, err.response);
            setError(err.message || 'Failed to load dashboard data');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setImageFiles(files);

        // Create previews
        const previews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === files.length) {
                    setImagePreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            // Validate
            if (!formData.category) {
                throw new Error('Please select a category');
            }
            if (imageFiles.length === 0) {
                throw new Error('Please upload at least one image');
            }
            if (!formData.expiryDate) {
                throw new Error('Please select an expiry date');
            }

            // Create product
            const newProduct = await productService.createProduct({
                name: formData.name,
                description: formData.description,
                category: formData.category,
                originalPrice: Number(formData.originalPrice),
                quantity: Number(formData.quantity),
                unit: formData.unit || 'portion',
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                expiryDate: new Date(formData.expiryDate).toISOString(), // Send as ISO string
                status: 'active',
                images: imageFiles
            });

            // Add to list
            setProducts([newProduct, ...products]);

            alert('Product created successfully!');

            // Reset form
            setFormData({
                name: '',
                description: '',
                originalPrice: '',
                quantity: '',
                category: '',
                tags: '',
                expiryDate: '',
                unit: '',
            });
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err: any) {
            console.error('Error creating product:', err);
            setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product: BackendProduct) => {
        // Populate form with product data
        const expiryDate = new Date(product.expiryDate);
        const formattedDate = expiryDate.toISOString().slice(0, 16);

        setFormData({
            name: product.name,
            description: product.description || '',
            originalPrice: koboToNaira(product.pricing.retail.price).toString(),
            quantity: product.inventory.availableStock.toString(),
            category: typeof product.category === 'object' ? product.category._id : product.category,
            tags: product.tags.join(', '),
            expiryDate: formattedDate,
            unit: product.inventory.unit
        });

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('Product loaded into form. Modify fields and submit to update.\n\nNote: You\'ll need to re-upload images.');
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(products.filter(p => p._id !== productId));
    };

    if (!user || !['seller', 'restaurant', 'stores', 'ngo'].includes(user.role)) {
        return <div>Access Denied. Please login as a restaurant, store, or NGO.</div>;
    }

    return (
        <div className="container dashboard-container">
            <h1 className="dashboard-title">Restaurant Dashboard</h1>

            {/* Verification Banner */}
            <div className="verification-banner">
                <div className="verification-banner-content">
                    <div className="verification-banner-icon">!</div>
                    <div>
                        <div className="verification-banner-title">Action Required: Verify Account</div>
                        <div className="verification-banner-description">Please submit your business documents to unlock full features.</div>
                    </div>
                </div>
                <Link to="/verification" className="btn verification-banner-button">
                    Verify Now
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="card stat-card">
                        <h3 className="stat-title">Total Sales</h3>
                        <div className="stat-value">₦{stats.totalSales.toLocaleString()}</div>
                    </div>
                    <div className="card stat-card">
                        <h3 className="stat-title">Meals Saved</h3>
                        <div className="stat-value stat-value-success">{stats.mealsSaved}</div>
                    </div>
                    <div className="card stat-card">
                        <h3 className="stat-title">CO₂ Avoided</h3>
                        <div className="stat-value stat-value-primary">{stats.co2Saved}kg</div>
                    </div>
                </div>
            )}

            <div className="dashboard-grid">

                {/* Post Food Form */}
                <div>
                    <div className="card form-card">
                        <h2 className="form-title">Post New Food</h2>
                        <form onSubmit={handleSubmit} className="form-group">
                            <div>
                                <label htmlFor="item-name" className="form-label">Item Name</label>
                                <input
                                    id="item-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="form-label">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="form-textarea"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label htmlFor="category" className="form-label">Category</label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload (Multiple) */}
                            <div>
                                <label htmlFor="food-images" className="form-label">Food Images (Max 5)</label>
                                <input
                                    id="food-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="form-input"
                                    required
                                />
                                {imagePreviews.length > 0 && (
                                    <div className="image-preview-grid">
                                        {imagePreviews.map((preview, idx) => (
                                            <img
                                                key={idx}
                                                src={preview}
                                                alt={`Preview ${idx + 1}`}
                                                className="image-preview"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="price-quantity-grid">
                                <div>
                                    <label htmlFor="quantity" className="form-label">Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        className="form-input"
                                        required
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="unit" className="form-label">Unit</label>
                                    <input
                                        id="unit"
                                        type="text"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        className="form-input"
                                        placeholder="e.g. plate, box"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="expiry-date" className="form-label">Expiry Date</label>
                                <input
                                    id="expiry-date"
                                    type="datetime-local"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="form-input"
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>

                            <div>
                                <label htmlFor="original-price" className="form-label">Original Price (₦)</label>
                                <input
                                    id="original-price"
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                                <input
                                    id="tags"
                                    type="text"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    className="form-input"
                                    placeholder="e.g. rice, lunch, spicy"
                                />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Post Food Listing'}
                            </button>

                        </form>
                    </div>
                </div>

                {/* Active Listings */}
                <div>
                    <h2 className="listings-title">Active Listings</h2>
                    <div className="listings-section">
                        {products.map(product => (
                            <ProductListItem
                                key={product._id}
                                product={product}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        ))}
                        {products.length === 0 && <p className="no-listings-message">No active listings.</p>}
                    </div>
                </div>

            </div>

        </div>
    );
};
