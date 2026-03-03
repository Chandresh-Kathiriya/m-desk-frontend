import React, { useState, useEffect } from 'react';
import styles from '../../schemas/css/ContactFormDialog.module.css';

interface Address {
    city: string;
    state: string;
    pincode: string;
}

interface ContactData {
    name: string;
    type: string;
    email: string;
    mobile: string;
    address: Address;
}

interface ContactFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ContactData) => void;
    initialData?: ContactData | null;
    isProcessing: boolean;
    title: string;
}

const defaultData: ContactData = {
    name: '', type: 'vendor', email: '', mobile: '', address: { city: '', state: '', pincode: '' }
};

const ContactFormDialog: React.FC<ContactFormDialogProps> = ({ isOpen, onClose, onSubmit, initialData, isProcessing, title }) => {
    const [formData, setFormData] = useState<ContactData>(defaultData);

    // Reset or populate form data whenever the dialog opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || defaultData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (['city', 'state', 'pincode'].includes(name)) {
            setFormData({ ...formData, address: { ...formData.address, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className={styles['modal-backdrop']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <h2 className={styles['modal-title']}>{title}</h2>
                    <button className={styles['close-btn']} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={submitHandler}>
                    <div className={styles['form-grid-2']}>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Name *</label>
                            <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleInputChange} required placeholder="e.g. Acme Corp" />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Type *</label>
                            <select name="type" className={styles.select} value={formData.type} onChange={handleInputChange} required>
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles['form-grid-2']}>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Email</label>
                            <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleInputChange} placeholder="contact@example.com" />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Mobile</label>
                            <input type="text" name="mobile" className={styles.input} value={formData.mobile} onChange={handleInputChange} placeholder="+1 555-0199" />
                        </div>
                    </div>

                    <h3 className={styles['form-section-title']}>Address Details</h3>
                    
                    <div className={styles['form-grid-3']}>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>City</label>
                            <input type="text" name="city" className={styles.input} value={formData.address?.city || ''} onChange={handleInputChange} placeholder="New York" />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>State</label>
                            <input type="text" name="state" className={styles.input} value={formData.address?.state || ''} onChange={handleInputChange} placeholder="NY" />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Pincode / Zip</label>
                            <input type="text" name="pincode" className={styles.input} value={formData.address?.pincode || ''} onChange={handleInputChange} placeholder="10001" />
                        </div>
                    </div>

                    <div className={styles['form-actions']}>
                        <button type="button" className={`${styles.btn} ${styles['btn-secondary']}`} onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={isProcessing}>
                            {isProcessing ? <><div className={styles.spinner}></div> Processing...</> : 'Save Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactFormDialog;