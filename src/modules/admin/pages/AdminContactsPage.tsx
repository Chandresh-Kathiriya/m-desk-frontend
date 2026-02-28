import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { listContacts, createContact, updateContact, deleteContact } from '../../../store/actions/admin/contactActions';
import { CONTACT_CREATE_RESET, CONTACT_UPDATE_RESET, CONTACT_DELETE_RESET } from '../../../store/constants/admin/contactConstants';

import styles from '../../../schemas/css/AdminContactsPage.module.css';

const AdminContactsPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const contactList = useSelector((state: RootState) => state.contactList || {});
    const { loading, error, contacts = [] } = contactList as any;

    const contactCreate = useSelector((state: RootState) => state.contactCreate || {});
    const { loading: loadingCreate, error: errorCreate, success: successCreate } = contactCreate as any;

    const contactUpdate = useSelector((state: RootState) => state.contactUpdate || {});
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = contactUpdate as any;

    const contactDelete = useSelector((state: RootState) => state.contactDelete || {});
    const { error: errorDelete, success: successDelete } = contactDelete as any;

    // --- LOCAL UI/FORM STATES ---
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', type: 'vendor', email: '', mobile: '',
        address: { city: '', state: '', pincode: '' }
    });

    // Initial Fetch & Success Resets
    useEffect(() => {
        if (successCreate || successUpdate) {
            setShowForm(false);
            setEditId(null);
            setFormData({ name: '', type: 'vendor', email: '', mobile: '', address: { city: '', state: '', pincode: '' } });
            dispatch({ type: CONTACT_CREATE_RESET });
            dispatch({ type: CONTACT_UPDATE_RESET });
        }

        if (successDelete) {
            dispatch({ type: CONTACT_DELETE_RESET });
        }

        if (userInfo) {
            dispatch(listContacts());
        }
    }, [dispatch, userInfo, successCreate, successUpdate, successDelete]);

    // Handle Form Input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (['city', 'state', 'pincode'].includes(name)) {
            setFormData({ ...formData, address: { ...formData.address, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle Form Submission
    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            dispatch(updateContact(editId, formData));
        } else {
            dispatch(createContact(formData));
        }
    };

    // Populate Form for Editing
    const editHandler = (contact: any) => {
        setEditId(contact._id);
        setFormData({
            name: contact.name, type: contact.type, email: contact.email, mobile: contact.mobile,
            address: contact.address || { city: '', state: '', pincode: '' }
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the form
    };

    // Handle Deletion
    const deleteHandler = (id: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            dispatch(deleteContact(id));
        }
    };

    // Toggle/Reset Form
    const resetForm = () => {
        setEditId(null);
        setFormData({ name: '', type: 'vendor', email: '', mobile: '', address: { city: '', state: '', pincode: '' } });
        setShowForm(!showForm);
    };

    const isProcessing = loadingCreate || loadingUpdate;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Manage Contacts</h1>
                    <button 
                        onClick={resetForm} 
                        className={`${styles.btn} ${showForm ? styles['btn-secondary'] : styles['btn-primary']}`}
                    >
                        {showForm ? 'Cancel & Close' : '+ Add New Contact'}
                    </button>
                </header>

                {error && <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>}
                {errorCreate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorCreate}</div>}
                {errorUpdate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorUpdate}</div>}
                {errorDelete && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorDelete}</div>}

                {/* --- INLINE FORM --- */}
                {showForm && (
                    <div className={styles['form-card']}>
                        <h2 className={styles['form-title']}>{editId ? 'Edit Contact' : 'Create New Contact'}</h2>
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
                                    <input type="text" name="city" className={styles.input} value={formData.address.city} onChange={handleInputChange} placeholder="New York" />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>State</label>
                                    <input type="text" name="state" className={styles.input} value={formData.address.state} onChange={handleInputChange} placeholder="NY" />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Pincode / Zip</label>
                                    <input type="text" name="pincode" className={styles.input} value={formData.address.pincode} onChange={handleInputChange} placeholder="10001" />
                                </div>
                            </div>

                            <div className={styles['form-actions']}>
                                <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={isProcessing}>
                                    {isProcessing ? <><div className={styles.spinner}></div> Processing...</> : (editId ? 'Update Contact' : 'Save Contact')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- CONTACTS TABLE --- */}
                <div className={styles['table-card']}>
                    {loading ? (
                        <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>
                    ) : (
                        <div className={styles['table-responsive']}>
                            <table className={styles['admin-table']}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Contact Info</th>
                                        <th>City</th>
                                        <th className={styles['align-right']}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact: any) => (
                                        <tr key={contact._id}>
                                            <td className={styles['fw-bold']}>{contact.name}</td>
                                            <td>
                                                <span className={`${styles.badge} ${
                                                    contact.type === 'vendor' ? styles['badge--warning'] : 
                                                    contact.type === 'customer' ? styles['badge--info'] : styles['badge--success']
                                                }`}>
                                                    {contact.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div>{contact.email || '-'}</div>
                                                <div className={`${styles['text-muted']} ${styles.small}`}>{contact.mobile || '-'}</div>
                                            </td>
                                            <td>{contact.address?.city || '-'}</td>
                                            <td className={styles['align-right']}>
                                                <button 
                                                    onClick={() => editHandler(contact)} 
                                                    className={`${styles.btn} ${styles['btn-text-primary']}`}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteHandler(contact._id)} 
                                                    className={`${styles.btn} ${styles['btn-text-danger']}`}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={styles['align-center']} style={{ padding: 'var(--space-8)' }}>
                                                <span className={styles['text-muted']}>No contacts found.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
};

export default AdminContactsPage;