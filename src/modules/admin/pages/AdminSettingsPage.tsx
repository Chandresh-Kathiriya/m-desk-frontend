import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getSettings, updateSettings } from '../../../store/actions/admin/settingsActions';
import { SETTINGS_UPDATE_RESET } from '../../../store/constants/admin/settingsConstants';

import styles from '../../../schemas/css/AdminSettingsPage.module.css';

const AdminSettingsPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const settingsDetails = useSelector((state: RootState) => state.settingsDetails || {});
    const { loading, error, settings } = settingsDetails as any;

    const settingsUpdate = useSelector((state: RootState) => state.settingsUpdate || {});
    const { loading: saving, error: errorUpdate, success } = settingsUpdate as any;

    // --- LOCAL FORM STATE ---
    const [automaticInvoicing, setAutomaticInvoicing] = useState(false);

    // Fetch Settings on Mount
    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(getSettings());
        }
    }, [dispatch, userInfo]);

    // Sync Redux state to local form state when settings are loaded
    useEffect(() => {
        if (settings) {
            setAutomaticInvoicing(settings.automaticInvoicing || false);
        }
    }, [settings]);

    // Handle Success Message Timeout
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch({ type: SETTINGS_UPDATE_RESET });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    // Save Settings
    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updateSettings({ automaticInvoicing }));
    };

    const displayError = error || errorUpdate;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>Global System Settings</h1>

                {displayError && <div className={`${styles.alert} ${styles['alert--error']}`}>{displayError}</div>}
                {success && <div className={`${styles.alert} ${styles['alert--success']}`}>System settings updated successfully.</div>}

                {loading ? (
                    <div className={styles['spinner-container']}>
                        <div className={styles.spinner}></div>
                    </div>
                ) : (
                    <div className={styles.layout}>
                        {/* SETTINGS CARD */}
                        <div className={styles.card}>
                            <h2 className={styles['card-title']}>ERP Invoicing Automation</h2>
                            <p className={styles.description}>
                                Control how the system handles customer invoices when a successful payment is made through the website checkout.
                            </p>
                            
                            <form onSubmit={submitHandler}>
                                <div className={styles['settings-row']}>
                                    <div>
                                        <h3 className={styles['setting-name']}>Automatic Invoicing</h3>
                                        <p className={styles['setting-help']}>
                                            If enabled, Stripe web orders will instantly generate a <strong>Customer Invoice</strong>. If disabled, they will only create a Sale Order, requiring manual admin invoicing later.
                                        </p>
                                    </div>
                                    
                                    <label className={styles['switch-wrapper']}>
                                        <input 
                                            type="checkbox" 
                                            className={styles['switch-input']} 
                                            checked={automaticInvoicing}
                                            onChange={(e) => setAutomaticInvoicing(e.target.checked)}
                                        />
                                        <div className={styles.switch}></div>
                                    </label>
                                </div>

                                <div className={styles['actions-row']}>
                                    <button type="submit" className={styles['btn-submit']} disabled={saving}>
                                        {saving ? <div className={`${styles.spinner} ${styles['spinner--light']}`}></div> : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default AdminSettingsPage;