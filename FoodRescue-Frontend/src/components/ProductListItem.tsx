import React from 'react';
import { BackendProduct } from '../types/api';
import { koboToNaira } from '../utils/apiHelpers';
import { productService } from '../services/productService';

interface ProductListItemProps {
    product: BackendProduct;
    onDelete: (id: string) => void;
    onEdit: (product: BackendProduct) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, onDelete, onEdit }) => {
    const handleDelete = async () => {
        if (window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
            try {
                await productService.deleteProduct(product._id);
                onDelete(product._id);
                alert('Product deleted successfully!');
            } catch (err: any) {
                alert('Failed to delete product: ' + (err.message || 'Unknown error'));
            }
        }
    };

    return (
        <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img
                src={product.images[0] || 'https://via.placeholder.com/80'}
                alt={product.name}
                style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0' }}>{product.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {product.inventory.availableStock} {product.inventory.unit} left • {product.status}
                </div>
                <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {koboToNaira(product.pricing.retail.price).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button
                    onClick={() => onEdit(product)}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};
