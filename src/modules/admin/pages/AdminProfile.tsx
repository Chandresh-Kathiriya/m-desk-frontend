import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { getAdminDetails, updateAdminProfile } from '../../../store/actions/admin/adminActions'; 
import { showToast, showErrorAlert } from '../../../common/utils/alertUtils';

import styles from '../../../schemas/css/AdminProfile.module.css';

const AdminProfile = () => {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();

    // --- ADMIN REDUX STATE ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth as any);
    const { adminInfo } = adminAuth || {};

    const adminDetails = useSelector((state: RootState) => state.adminDetails as any);
    const { loading, error, admin } = adminDetails || {};
    const currentAdmin: any = admin || {};

    const adminUpdateProfile = useSelector((state: RootState) => state.adminUpdateProfile as any);
    const { success, error: updateError, loading: updateLoading } = adminUpdateProfile || {};

    // --- MODAL STATES ---
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // --- FORM STATES ---
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [stateName, setStateName] = useState('');
    const [pincode, setPincode] = useState('');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            if (success) {
                dispatch({ type: 'ADMIN_UPDATE_PROFILE_RESET' });
                dispatch(getAdminDetails('profile'));
                setIsEditProfileOpen(false);
                setIsPasswordModalOpen(false);
            } 
            else if (!currentAdmin.name) {
                if (!error && !loading) {
                    dispatch(getAdminDetails('profile'));
                }
            } 
            else {
                // Populate the states when admin data is loaded
                setName(currentAdmin.name);
                setCity(currentAdmin.address?.city || '');
                setStateName(currentAdmin.address?.state || '');
                setPincode(currentAdmin.address?.pincode || '');
            }
        }
        
        if (success) {
            showToast('Admin Profile Updated Successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        
        if (updateError) {
            showErrorAlert('Update Failed', updateError);
            dispatch({ type: 'ADMIN_UPDATE_PROFILE_RESET' }); 
        }

    }, [dispatch, navigate, adminInfo, currentAdmin, success, updateError, error, loading]);

    // --- HANDLERS ---
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updateAdminProfile({ 
            id: currentAdmin._id, 
            name,
            address: { city, state: stateName, pincode } 
        }));
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return showToast('New passwords do not match!', 'error');
        }
        if (!currentPassword) {
            return showToast('Please enter your current password.', 'error');
        }
        dispatch(updateAdminProfile({ 
            id: currentAdmin._id, 
            currentPassword,
            password: newPassword 
        }));
    };

    if (loading) return <div className={styles.spinner}></div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <div className={styles.card}>
                    
                    {/* Header Area */}
                    <div className={styles['profile-header']}>
                        <div className={styles['profile-title-group']}>
                            <h1 className={styles['profile-name']}>{currentAdmin.name}</h1>
                            <span className={styles['role-badge']}>
                                Administrator
                            </span>
                        </div>
                        <div className={styles['profile-actions']}>
                            <button onClick={() => setIsEditProfileOpen(true)} className={`${styles.btn} ${styles['btn-outline']}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit Details
                            </button>
                            <button onClick={() => setIsPasswordModalOpen(true)} className={`${styles.btn} ${styles['btn-primary']}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Change Password
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles['profile-body']}>
                        
                        {/* Contact Info */}
                        <div>
                            <h3 className={styles['section-title']}>Admin Information</h3>
                            <div className={styles['info-group']}>
                                <span className={styles['info-label']}>Email Address</span>
                                <div className={styles['info-value']}>{currentAdmin.email}</div>
                            </div>
                            <div className={styles['info-group']}>
                                <span className={styles['info-label']}>Mobile Number</span>
                                <div className={styles['info-value']}>+91 {currentAdmin.mobile}</div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div>
                            <h3 className={styles['section-title']}>Registered Address</h3>
                            <div className={styles['info-group']}>
                                <span className={styles['info-label']}>City</span>
                                <div className={styles['info-value']}>{currentAdmin.address?.city || 'Not provided'}</div>
                            </div>
                            <div className={styles['info-group']}>
                                <span className={styles['info-label']}>State</span>
                                <div className={styles['info-value']}>{currentAdmin.address?.state || 'Not provided'}</div>
                            </div>
                            <div className={styles['info-group']}>
                                <span className={styles['info-label']}>Pincode</span>
                                <div className={styles['info-value']}>{currentAdmin.address?.pincode || 'Not provided'}</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- MODAL 1: EDIT PROFILE --- */}
                {isEditProfileOpen && (
                    <div className={styles['modal-backdrop']} onClick={() => setIsEditProfileOpen(false)}>
                        <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                            <div className={styles['modal-header']}>
                                <h2 className={styles['modal-title']}>Edit Admin Details</h2>
                                <button className={styles['modal-close-btn']} onClick={() => setIsEditProfileOpen(false)}>&times;</button>
                            </div>

                            <form onSubmit={handleProfileUpdate} className={styles['form-layout']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Full Name</label>
                                    <input type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>City</label>
                                    <input type="text" className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>State</label>
                                    <input type="text" className={styles.input} value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Pincode</label>
                                    <input type="text" className={styles.input} value={pincode} onChange={(e) => setPincode(e.target.value)} required pattern="[0-9]{6}" title="Six digit zip code" />
                                </div>
                                <button type="submit" disabled={updateLoading} className={`${styles.btn} ${styles['btn-primary']}`} style={{ marginTop: '1rem', width: '100%' }}>
                                    {updateLoading ? <><div className={`${styles.spinner} ${styles['spinner--light']}`}></div> Saving...</> : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- MODAL 2: UPDATE PASSWORD --- */}
                {isPasswordModalOpen && (
                    <div className={styles['modal-backdrop']} onClick={() => setIsPasswordModalOpen(false)}>
                        <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                            <div className={styles['modal-header']}>
                                <h2 className={styles['modal-title']}>Update Security</h2>
                                <button className={styles['modal-close-btn']} onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
                            </div>

                            <form onSubmit={handlePasswordUpdate} className={styles['form-layout']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Current Password</label>
                                    <input type="password" className={styles.input} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>New Password</label>
                                    <input type="password" className={styles.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Confirm New Password</label>
                                    <input type="password" className={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                                </div>
                                <button type="submit" disabled={updateLoading} className={`${styles.btn} ${styles['btn-primary']}`} style={{ marginTop: '1rem', width: '100%' }}>
                                    {updateLoading ? <><div className={`${styles.spinner} ${styles['spinner--light']}`}></div> Updating...</> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
};

export default AdminProfile;