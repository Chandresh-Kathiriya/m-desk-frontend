import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  listMasterData, createMasterData, updateMasterData, deleteMasterData, 
  listMasterDataTabs, createMasterDataTab
} from '../../../store/actions/admin/masterDataActions';
import { 
  MASTER_DATA_CREATE_RESET, MASTER_DATA_UPDATE_RESET, MASTER_DATA_TAB_CREATE_RESET 
} from '../../../store/constants/admin/masterDataConstants';
import { RootState } from '../../../store/reducers';
import axios from 'axios'; // <-- Used for deleting the tab quickly
import styles from '../../../schemas/css/MasterDataManagement.module.css';

const emptyRow = { name: '', description: '', hexCode: '#000000', code: '' };

const defaultTabs = [
  { id: 'brands', label: 'Brands' },
  { id: 'colors', label: 'Colors' },
  { id: 'sizes', label: 'Sizes' },
  { id: 'styles', label: 'Styles' },
  { id: 'categories', label: 'Categories' },
  { id: 'types', label: 'Product Types' },
];

const MasterDataManagement: React.FC = () => {
  const dispatch = useDispatch<any>();
  
  const [activeTab, setActiveTab] = useState<string>('brands');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [formDataArray, setFormDataArray] = useState([{ ...emptyRow }]);

  const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
  const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

  const masterDataTabsState = useSelector((state: RootState) => state.masterDataTabs || {} as any);
  const { tabs: backendTabs = [] } = masterDataTabsState;

  const masterDataTabCreate = useSelector((state: RootState) => state.masterDataTabCreate || {} as any);
  const { loading: tabCreateLoading, success: tabCreateSuccess } = masterDataTabCreate;

  const defaultTabIds = defaultTabs.map(t => t.id);
  const customTabs = backendTabs
    .filter((t: any) => !defaultTabIds.includes(t.tabId))
    .map((t: any) => ({ id: t.tabId, label: t.label, isCustom: true }));

  const displayTabs = [
    ...defaultTabs.map(t => ({...t, isCustom: false})),
    ...customTabs
  ];

  const masterDataList = useSelector((state: RootState) => state.masterDataList || {} as any);
  const { loading, error } = masterDataList;
  const currentRecords = (masterDataList as Record<string, any>)[activeTab] || [];

  const masterDataCreate = useSelector((state: RootState) => state.masterDataCreate || {} as any);
  const { loading: createLoading, error: createError, success: createSuccess } = masterDataCreate;

  const masterDataUpdate = useSelector((state: RootState) => state.masterDataUpdate || {} as any);
  const { loading: updateLoading, error: updateError, success: updateSuccess } = masterDataUpdate;

  // Track delete errors locally for immediate feedback
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  useEffect(() => { dispatch(listMasterDataTabs()); }, [dispatch]);

  useEffect(() => {
    if (tabCreateSuccess) {
      dispatch(listMasterDataTabs());
      dispatch({ type: MASTER_DATA_TAB_CREATE_RESET });
    }
  }, [tabCreateSuccess, dispatch]);

  useEffect(() => {
    dispatch(listMasterData(activeTab));
    setDeleteErrorMsg(null); // Clear errors when switching tabs
  }, [dispatch, activeTab, createSuccess, updateSuccess]);

  useEffect(() => {
    if (createSuccess || updateSuccess) {
      handleCloseModal();
      dispatch({ type: MASTER_DATA_CREATE_RESET });
      dispatch({ type: MASTER_DATA_UPDATE_RESET });
    }
  }, [createSuccess, updateSuccess, dispatch]);

  const handleAddCustomVariable = () => {
    const variableName = window.prompt('Enter the name for the new variable (e.g., Materials):');
    if (variableName && variableName.trim()) {
      const newId = variableName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (displayTabs.find((t: any) => t.id === newId)) {
        alert('This variable already exists!');
        return;
      }
      dispatch(createMasterDataTab({ tabId: newId, label: variableName.trim() }));
      setActiveTab(newId);
    }
  };

  const handleRemoveCustomTab = async (tabId: string) => {
    if (window.confirm('Delete this entire custom tab?')) {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/masterdata/admin/tabs/${tabId}`, config);
            dispatch(listMasterDataTabs());
            setActiveTab('brands'); // Reset to default
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete tab.');
        }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormDataArray([{ ...emptyRow }]);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormDataArray([{ ...emptyRow }]);
    setShowModal(true);
  };

  const handleOpenEdit = (record: any) => {
    setEditingId(record._id);
    setFormDataArray([{
      name: record.name || '',
      description: record.description || '',
      hexCode: record.hexCode || '#000000',
      code: record.code || ''
    }]);
    setShowModal(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setDeleteErrorMsg(null);
        // Dispatch the action. If the backend throws a 400 error (Linked to Product), it will trigger the catch block.
        await dispatch(deleteMasterData(activeTab, id)); 
        dispatch(listMasterData(activeTab));
      } catch (err: any) {
        // Display the backend protection message
        setDeleteErrorMsg(err.response?.data?.message || err.message || 'Failed to delete record.');
        window.scrollTo(0, 0); // Scroll up so admin sees the error
      }
    }
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...formDataArray];
    updated[index] = { ...updated[index], [field]: value };
    setFormDataArray(updated);
  };

  const handleAddRow = () => setFormDataArray([...formDataArray, { ...emptyRow }]);
  const handleRemoveRow = (index: number) => setFormDataArray(formDataArray.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) dispatch(updateMasterData(activeTab, editingId, formDataArray[0]));
    else dispatch(createMasterData(activeTab, formDataArray));
  };

  const isCustomOrDescriptiveTab = !['colors', 'sizes', 'styles', 'types'].includes(activeTab);

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        <h1 className={styles['page-title']}>Master Data Management</h1>
        
        {deleteErrorMsg && (
            <div className={`${styles.alert} ${styles['alert--error']}`} style={{ marginBottom: '1rem' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {deleteErrorMsg}
            </div>
        )}

        <div className={styles.layout}>
          <aside className={styles['nav-card']}>
            <ul className={styles['nav-list']}>
              {displayTabs.map((tab: any) => (
                <li 
                  key={tab.id}
                  className={`${styles['nav-item']} ${activeTab === tab.id ? styles['nav-item--active'] : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{tab.label}</span>
                  
                  {/* Give Admins a way to delete custom tabs */}
                  {tab.isCustom && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveCustomTab(tab.id); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-error-600)', cursor: 'pointer', fontWeight: 'bold' }}
                        title="Delete Custom Variable"
                      >
                          &times;
                      </button>
                  )}
                </li>
              ))}
              <li 
                className={styles['nav-item']} 
                onClick={handleAddCustomVariable}
                style={{ marginTop: '1rem', color: 'var(--color-primary-600)', fontWeight: 'bold', borderTop: '1px dashed var(--color-neutral-300)', paddingTop: '1rem' }}
              >
                {tabCreateLoading ? 'Creating...' : '+ Add Custom Variable'}
              </li>
            </ul>
          </aside>

          <section className={styles['content-card']}>
            <div className={styles['card-header']}>
              <h2 className={styles['card-title']}>{displayTabs.find((t: any) => t.id === activeTab)?.label || activeTab}</h2>
              <button className={`${styles.btn} ${styles['btn-primary']}`} onClick={handleOpenCreate}>+ Add New Record</button>
            </div>

            {loading ? <div className={styles['spinner-container']}><div className={styles.spinner}></div></div> : error ? (
              <div style={{ padding: 'var(--space-6)' }}><div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div></div>
            ) : (
              <div className={styles['table-responsive']}>
                <table className={styles['admin-table']}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {isCustomOrDescriptiveTab && <th>Description</th>}
                      {activeTab === 'colors' && <th>Color Swatch</th>}
                      {activeTab === 'sizes' && <th>Size Code</th>}
                      <th className={styles['align-right']}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record: any) => (
                      <tr key={record._id}>
                        <td className={styles['fw-bold']}>{record.name}</td>
                        {isCustomOrDescriptiveTab && <td>{record.description || '-'}</td>}
                        {activeTab === 'colors' && <td><span className={`${styles.badge} ${styles['badge--light']}`}><div className={styles['color-swatch']} style={{ backgroundColor: record.hexCode }}></div>{record.hexCode}</span></td>}
                        {activeTab === 'sizes' && <td><span className={`${styles.badge} ${styles['badge--dark']}`}>{record.code}</span></td>}
                        <td className={styles['align-right']}>
                          <button className={`${styles.btn} ${styles['btn-outline-primary']}`} style={{ marginRight: '8px' }} onClick={() => handleOpenEdit(record)}>Edit</button>
                          
                          {/* UPDATED TO USE NEW HANDLER */}
                          <button className={`${styles.btn} ${styles['btn-outline-danger']}`} onClick={() => handleDeleteRecord(record._id)}>Delete</button>
                          
                        </td>
                      </tr>
                    ))}
                    {currentRecords.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted" style={{ padding: 'var(--space-8)' }}>No records found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {showModal && (
        <div className={styles['modal-backdrop']} onClick={() => !createLoading && !updateLoading && handleCloseModal()}>
          <div className={`${styles['modal-content']} ${editingId ? styles['modal-content--sm'] : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>{editingId ? 'Edit' : 'Bulk Add'} Record</h3>
              <button className={styles['btn']} style={{ padding: 'var(--space-1)', background: 'transparent' }} onClick={handleCloseModal} disabled={createLoading || updateLoading}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-neutral-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles['modal-body']}>
                {(createError || updateError) && <div className={`${styles.alert} ${styles['alert--error']}`}>{createError || updateError}</div>}
                {formDataArray.map((row, index) => (
                  <div key={index} className={styles['row-card']}>
                    {!editingId && formDataArray.length > 1 && (
                      <div className={styles['row-card-header']}><button type="button" className={`${styles.btn} ${styles['btn-text-danger']}`} onClick={() => handleRemoveRow(index)}>&times; Remove Row</button></div>
                    )}
                    <div className={styles['form-grid']}>
                      <div className={`${styles['form-group']} ${(activeTab === 'colors' || activeTab === 'sizes') ? '' : styles['form-grid-full']}`}>
                        <label className={styles.label}>Name</label>
                        <input type="text" className={styles.input} required value={row.name} onChange={(e) => handleRowChange(index, 'name', e.target.value)} />
                      </div>
                      {isCustomOrDescriptiveTab && (
                        <div className={`${styles['form-group']} ${styles['form-grid-full']}`}>
                          <label className={styles.label}>Description</label>
                          <textarea className={styles.textarea} value={row.description} onChange={(e) => handleRowChange(index, 'description', e.target.value)} />
                        </div>
                      )}
                      {activeTab === 'sizes' && (
                        <div className={styles['form-group']}>
                          <label className={styles.label}>Size Code</label>
                          <input type="text" className={styles.input} required value={row.code} onChange={(e) => handleRowChange(index, 'code', e.target.value)} />
                        </div>
                      )}
                      {activeTab === 'colors' && (
                        <div className={styles['form-group']}>
                          <label className={styles.label}>Hex Code</label>
                          <div className={styles['color-picker-wrapper']}>
                            <input type="color" className={styles['color-input']} required value={row.hexCode} onChange={(e) => handleRowChange(index, 'hexCode', e.target.value)} />
                            <input type="text" className={styles.input} required value={row.hexCode} onChange={(e) => handleRowChange(index, 'hexCode', e.target.value)} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!editingId && <button type="button" className={`${styles.btn} ${styles['btn-dashed']}`} onClick={handleAddRow}>+ Add Another Row</button>}
              </div>
              <div className={styles['modal-footer']}>
                <button type="button" className={`${styles.btn} ${styles['btn-secondary']}`} onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={createLoading || updateLoading}>
                  {createLoading || updateLoading ? <><div className={`${styles.spinner} ${styles['spinner--sm']} ${styles['spinner--light']}`}></div> Processing...</> : editingId ? 'Update Record' : `Save ${formDataArray.length} Record(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MasterDataManagement;