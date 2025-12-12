import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { BackendProduct, BackendCategory } from '../types/api';
import { koboToNaira } from '../utils/apiHelpers';
import { Link } from 'react-router-dom';

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

            // Create product
            const newProduct = await productService.createProduct({
                name: formData.name,
                description: formData.description,
                category: formData.category,
                originalPrice: Number(formData.originalPrice),
                quantity: Number(formData.quantity),
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
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

    if (!user || (user.role !== 'seller' && user.role !== 'restaurant')) {
        return <div>Access Denied. Please login as a restaurant.</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Restaurant Dashboard</h1>

            {/* Verification Banner */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: '#EA580C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>!</div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#9A3412' }}>Action Required: Verify Account</div>
                        <div style={{ fontSize: '0.9rem', color: '#C2410C' }}>Please submit your business documents to unlock full features.</div>
                    </div>
                </div>
                <Link to="/verification" className="btn" style={{ background: '#EA580C', color: 'white', fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                    Verify Now
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Sales</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦{stats.totalSales.toLocaleString()}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Meals Saved</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.mealsSaved}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>CO₂ Avoided</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.co2Saved}kg</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Post Food Form */}
                <div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Post New Food</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Item Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Food Images (Max 5)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                />
                                {imagePreviews.length > 0 && (
                                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                                        {imagePreviews.map((preview, idx) => (
                                            <img
                                                key={idx}
                                                src={preview}
                                                alt={`Preview ${idx + 1}`}
                                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                    min="1"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Original Price (₦)</label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    placeholder="e.g. rice, lunch, spicy"
                                />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '0.5rem', padding: '1rem', color: '#EF4444' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ marginTop: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Post Food Listing'}
                            </button>

                        </form>
                    </div>
                </div>

                {/* Active Listings */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Listings</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {products.map(product => (
                            <div key={product._id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                                <img
                                    src={product.images[0] || 'https://via.placeholder.com/80'}
                                    alt={product.name}
                                    style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }}
                                />
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{product.name}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {product.inventory.availableStock} left • {product.status}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {koboToNaira(product.pricing.retail.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No active listings.</p>}
                    </div>
                </div>

            </div>

        </div>
    );
};
