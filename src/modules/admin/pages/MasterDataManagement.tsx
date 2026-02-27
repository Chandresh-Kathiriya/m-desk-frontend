import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listMasterData, createMasterData, updateMasterData, deleteMasterData } from '../../../store/actions/admin/masterDataActions';
import { MASTER_DATA_CREATE_RESET, MASTER_DATA_UPDATE_RESET } from '../../../store/constants/admin/masterDataConstants';
import { RootState } from '../../../store/reducers';

import styles from '../../../schemas/css/MasterDataManagement.module.css';

const emptyRow = { name: '', description: '', hexCode: '#000000', code: '' };

const tabs = [
    { id: 'brands', label: 'Brands' },
    { id: 'colors', label: 'Colors' },
    { id: 'sizes', label: 'Sizes' },
    { id: 'styles', label: 'Styles' },
    { id: 'categories', label: 'Categories' },
    { id: 'types', label: 'Product Types' },
] as const;

type TabType = typeof tabs[number]['id'];

const MasterDataManagement: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [activeTab, setActiveTab] = useState<TabType>('brands');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  
  const [formDataArray, setFormDataArray] = useState([{ ...emptyRow }]);

  const masterDataList = useSelector((state: RootState) => state.masterDataList || {} as any);
  const { loading, error } = masterDataList;
  const currentRecords = (masterDataList as Record<string, any>)[activeTab] || [];

  const masterDataCreate = useSelector((state: RootState) => state.masterDataCreate || {} as any);
  const { loading: createLoading, error: createError, success: createSuccess } = masterDataCreate;

  const masterDataUpdate = useSelector((state: RootState) => state.masterDataUpdate || {} as any);
  const { loading: updateLoading, error: updateError, success: updateSuccess } = masterDataUpdate;

  useEffect(() => {
    dispatch(listMasterData(activeTab));
  }, [dispatch, activeTab, createSuccess, updateSuccess]);

  useEffect(() => {
    if (createSuccess || updateSuccess) {
      handleCloseModal();
      dispatch({ type: MASTER_DATA_CREATE_RESET });
      dispatch({ type: MASTER_DATA_UPDATE_RESET });
    }
  }, [createSuccess, updateSuccess, dispatch]);

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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteMasterData(activeTab, id)).then(() => dispatch(listMasterData(activeTab)));
    }
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...formDataArray];
    updated[index] = { ...updated[index], [field]: value };
    setFormDataArray(updated);
  };

  const handleAddRow = () => {
    setFormDataArray([...formDataArray, { ...emptyRow }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = formDataArray.filter((_, i) => i !== index);
    setFormDataArray(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateMasterData(activeTab, editingId, formDataArray[0]));
    } else {
      dispatch(createMasterData(activeTab, formDataArray));
    }
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        <h1 className={styles['page-title']}>Master Data Management</h1>
        
        <div className={styles.layout}>
          
          {/* --- SIDEBAR NAV --- */}
          <aside className={styles['nav-card']}>
            <ul className={styles['nav-list']}>
              {tabs.map((tab) => (
                <li 
                  key={tab.id}
                  className={`${styles['nav-item']} ${activeTab === tab.id ? styles['nav-item--active'] : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <section className={styles['content-card']}>
            <div className={styles['card-header']}>
              <h2 className={styles['card-title']}>{activeTab}</h2>
              <button className={`${styles.btn} ${styles['btn-primary']}`} onClick={handleOpenCreate}>
                + Add New {activeTab.slice(0, -1)}
              </button>
            </div>

            {loading ? (
              <div className={styles['spinner-container']}><div className={styles.spinner}></div></div>
            ) : error ? (
              <div style={{ padding: 'var(--space-6)' }}>
                <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>
              </div>
            ) : (
              <div className={styles['table-responsive']}>
                <table className={styles['admin-table']}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {(activeTab === 'brands' || activeTab === 'categories') && <th>Description</th>}
                      {activeTab === 'colors' && <th>Color Swatch</th>}
                      {activeTab === 'sizes' && <th>Size Code</th>}
                      <th className={styles['align-right']}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record: any) => (
                      <tr key={record._id}>
                        <td className={styles['fw-bold']}>{record.name}</td>
                        {(activeTab === 'brands' || activeTab === 'categories') && <td>{record.description || '-'}</td>}
                        
                        {activeTab === 'colors' && (
                          <td>
                            <span className={`${styles.badge} ${styles['badge--light']}`}>
                              <div className={styles['color-swatch']} style={{ backgroundColor: record.hexCode }}></div>
                              {record.hexCode}
                            </span>
                          </td>
                        )}
                        
                        {activeTab === 'sizes' && <td><span className={`${styles.badge} ${styles['badge--dark']}`}>{record.code}</span></td>}
                        
                        <td className={styles['align-right']}>
                          <button className={`${styles.btn} ${styles['btn-outline-primary']}`} style={{ marginRight: '8px' }} onClick={() => handleOpenEdit(record)}>Edit</button>
                          <button className={`${styles.btn} ${styles['btn-outline-danger']}`} onClick={() => handleDelete(record._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {currentRecords.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-4 text-muted" style={{ padding: 'var(--space-8)' }}>No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* --- BULK ADD / EDIT MODAL --- */}
      {showModal && (
        <div className={styles['modal-backdrop']} onClick={() => !createLoading && !updateLoading && handleCloseModal()}>
          <div className={`${styles['modal-content']} ${editingId ? styles['modal-content--sm'] : ''}`} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>{editingId ? 'Edit' : 'Bulk Add'} {activeTab}</h3>
              <button className={styles['btn']} style={{ padding: 'var(--space-1)', background: 'transparent' }} onClick={handleCloseModal} disabled={createLoading || updateLoading}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-neutral-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles['modal-body']}>
                {(createError || updateError) && (
                  <div className={`${styles.alert} ${styles['alert--error']}`}>
                    {createError || updateError}
                  </div>
                )}

                {formDataArray.map((row, index) => (
                  <div key={index} className={styles['row-card']}>
                    
                    {!editingId && formDataArray.length > 1 && (
                      <div className={styles['row-card-header']}>
                        <button type="button" className={`${styles.btn} ${styles['btn-text-danger']}`} onClick={() => handleRemoveRow(index)}>
                          &times; Remove Row
                        </button>
                      </div>
                    )}

                    <div className={styles['form-grid']}>
                      <div className={`${styles['form-group']} ${(activeTab === 'colors' || activeTab === 'sizes') ? '' : styles['form-grid-full']}`}>
                        <label className={styles.label}>Name</label>
                        <input type="text" className={styles.input} required value={row.name} onChange={(e) => handleRowChange(index, 'name', e.target.value)} />
                      </div>

                      {(activeTab === 'brands' || activeTab === 'categories') && (
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

                {!editingId && (
                  <button type="button" className={`${styles.btn} ${styles['btn-dashed']}`} onClick={handleAddRow}>
                    + Add Another Row
                  </button>
                )}
              </div>

              <div className={styles['modal-footer']}>
                <button type="button" className={`${styles.btn} ${styles['btn-secondary']}`} onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={createLoading || updateLoading}>
                  {createLoading || updateLoading ? (
                    <><div className={`${styles.spinner} ${styles['spinner--sm']} ${styles['spinner--light']}`}></div> Processing...</>
                  ) : (
                    editingId ? 'Update Record' : `Save ${formDataArray.length} Record(s)`
                  )}
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