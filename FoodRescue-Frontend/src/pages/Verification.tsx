import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Verification: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate upload delay
        setTimeout(() => {
            setSubmitting(false);
            alert("Documents uploaded successfully! Admin will review shortly.");
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Verify Your Restaurant</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                To maintain trust and safety on FoodRescue, we require all restaurant partners to provide valid registration documents.
            </p>

            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>CAC Registration Number</label>
                        <input type="text" className="input-field" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }} placeholder="RC 123456" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload CAC Certificate</label>
                        <input type="file" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
                        <small style={{ color: 'var(--text-muted)' }}>PDF or JPG, max 5MB</small>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>NAFDAC License (Optional)</label>
                        <input type="file" style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ marginTop: '1rem' }}
                    >
                        {submitting ? 'Uploading...' : 'Submit Documents'}
                    </button>
                </form>
            </div>
        </div>
    );
};
