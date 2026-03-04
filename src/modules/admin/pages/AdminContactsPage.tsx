import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { listContacts, createContact, updateContact, deleteContact } from '../../../store/actions/admin/contactActions';
import { CONTACT_CREATE_RESET, CONTACT_UPDATE_RESET, CONTACT_DELETE_RESET } from '../../../store/constants/admin/contactConstants';

// Import your new Dialog Component! (Adjust the path if needed)
import ContactFormDialog from '../../../common/components/ContactFormDialog';

import styles from '../../../schemas/css/AdminContactsPage.module.css';
import { showConfirmAlert } from '../../../common/utils/alertUtils';

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

    // --- LOCAL UI STATES ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [initialContactData, setInitialContactData] = useState<any>(null);

    // Initial Fetch & Success Resets
    useEffect(() => {
        if (successCreate || successUpdate) {
            setIsDialogOpen(false);
            setEditId(null);
            setInitialContactData(null);
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

    // Handle Form Submission coming from the Dialog
    const handleDialogSubmit = (formData: any) => {
        if (editId) {
            dispatch(updateContact(editId, formData));
        } else {
            dispatch(createContact(formData));
        }
    };

    // Open Form for Editing
    const editHandler = (contact: any) => {
        setEditId(contact._id);
        setInitialContactData({
            name: contact.name, type: contact.type, email: contact.email, mobile: contact.mobile,
            address: contact.address || { city: '', state: '', pincode: '' }
        });
        setIsDialogOpen(true);
    };

    // Open Form for Creating
    const createHandler = () => {
        setEditId(null);
        setInitialContactData(null);
        setIsDialogOpen(true);
    };

    // Handle Deletion
    const deleteHandler = async (id: string) => {
        // Await the user's choice from the SweetAlert dialog
        const isConfirmed = await showConfirmAlert(
            'Delete Contact?',
            'Are you sure you want to delete this contact? This action cannot be undone.',
            'Yes, Delete'
        );
  
        // If they clicked "Yes, Delete", fire the dispatch!
        if (isConfirmed) {
            dispatch(deleteContact(id));
        }
    };

    const isProcessing = loadingCreate || loadingUpdate;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Manage Contacts</h1>
                    <button onClick={createHandler} className={`${styles.btn} ${styles['btn-primary']}`}>
                        + Add New Contact
                    </button>
                </header>

                {error && <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>}
                {errorCreate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorCreate}</div>}
                {errorUpdate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorUpdate}</div>}
                {errorDelete && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorDelete}</div>}

                {/* --- REUSABLE CONTACT FORM DIALOG --- */}
                <ContactFormDialog 
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={handleDialogSubmit}
                    initialData={initialContactData}
                    isProcessing={isProcessing}
                    title={editId ? 'Edit Contact' : 'Create New Contact'}
                />

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