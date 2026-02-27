import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listInventory, adjustStock } from '../../../store/actions/admin/inventoryActions';
import { INVENTORY_UPDATE_RESET } from '../../../store/constants/admin/inventoryConstants'; // Ensure path/constant is correct
import { RootState } from '../../../store/reducers';

import styles from '../../../schemas/css/InventoryManagement.module.css';

const InventoryManagement: React.FC = () => {
  const dispatch = useDispatch<any>();

  const [showModal, setShowModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number | string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('New Purchase Order');
  const [notes, setNotes] = useState('');

  const inventoryList = useSelector((state: RootState) => state.inventoryList || {} as any);
  const { loading, error, inventory } = inventoryList;

  const inventoryUpdate = useSelector((state: RootState) => state.inventoryUpdate || {} as any);
  const { loading: updateLoading, success: updateSuccess, error: updateError } = inventoryUpdate;

  useEffect(() => {
    dispatch(listInventory());
  }, [dispatch, updateSuccess]);

  useEffect(() => {
    if (updateSuccess) {
      setShowModal(false);
      setSelectedSku(null);
      setAdjustmentQty('');
      dispatch({ type: INVENTORY_UPDATE_RESET });
    }
  }, [updateSuccess, dispatch]);

  const handleOpenAdjust = (item: any) => {
    setSelectedSku(item);
    setAdjustmentQty('');
    setReason('New Purchase Order');
    setNotes('');
    setShowModal(true);
  };

  const submitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !adjustmentQty || !reason) return;
    dispatch(adjustStock(selectedSku.sku, Number(adjustmentQty), reason, notes));
  };

  const safeInventory = (inventory as any[]) || [];

  const filteredInventory = safeInventory.filter((item: any) =>
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        
        <div className={styles.card}>
          <div className={styles['card-header']}>
            <h1 className={styles['card-title']}>Clothing Inventory (SKU Level)</h1>
            
            <div className={styles['search-wrapper']}>
              <svg className={styles['search-icon']} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className={styles['search-input']}
                placeholder="Search by SKU or Product Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                    <th>SKU</th>
                    <th>Product Details</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>In Stock</th>
                    <th className={styles['align-right']}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className={styles['text-sku']}>{item.sku}</td>
                      <td>
                        <div className={styles['product-name']}>{item.productName}</div>
                        <div className={styles['product-meta']}>{item.brand} | {item.category} | {item.type}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge--light']}`}>{item.color}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge--dark']}`}>{item.size}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles['stock-badge']} ${item.stock > 10 ? styles['badge--success'] : item.stock > 0 ? styles['badge--warning'] : styles['badge--error']}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className={styles['align-right']}>
                        <button className={styles['btn-outline']} onClick={() => handleOpenAdjust(item)}>
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }} className="text-muted">
                        No inventory items found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* --- STOCK ADJUSTMENT MODAL --- */}
      {showModal && (
        <div className={styles['modal-backdrop']} onClick={() => !updateLoading && setShowModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles['modal-header']}>
              <h2 className={styles['modal-title']}>Adjust Inventory</h2>
              <button className={styles['btn-close']} onClick={() => setShowModal(false)} disabled={updateLoading}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles['modal-body']}>
              <form onSubmit={submitAdjustment}>
                {updateError && (
                  <div className={`${styles.alert} ${styles['alert--error']}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{updateError}</span>
                  </div>
                )}

                {selectedSku && (
                  <div className={styles['selected-item-box']}>
                    <div className={styles['selected-item-title']}>{selectedSku.productName}</div>
                    <div className={styles['selected-item-sku']}>{selectedSku.sku}</div>
                    <div className={styles['selected-item-badges']}>
                      <span className={`${styles.badge} ${styles['badge--dark']}`}>{selectedSku.size}</span>
                      <span className={`${styles.badge} ${styles['badge--light']}`}>{selectedSku.color}</span>
                    </div>
                    <div className={styles['selected-item-stock']}>
                      Current Stock: <strong>{selectedSku.stock}</strong>
                    </div>
                  </div>
                )}

                <div className={styles['form-group']}>
                  <label className={styles.label}>Units to Add/Remove (Use negative for removal)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    required 
                    placeholder="e.g., 50 or -5" 
                    value={adjustmentQty} 
                    onChange={(e) => setAdjustmentQty(e.target.value)} 
                  />
                </div>

                <div className={styles['form-group']}>
                  <label className={styles.label}>Reason for Adjustment</label>
                  <select 
                    className={styles.select} 
                    required 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="New Purchase Order">New Purchase Order (Stock In)</option>
                    <option value="Customer Return">Customer Return (Stock In)</option>
                    <option value="Damaged/Defective">Damaged / Defective (Stock Out)</option>
                    <option value="Lost in Transit">Lost in Transit (Stock Out)</option>
                    <option value="Inventory Correction">Inventory Correction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles['form-group']}>
                  <label className={styles.label}>Additional Notes (Optional)</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="e.g., PO# 12345 or Found missing box in warehouse" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>

                <button type="submit" className={styles['btn-primary']} disabled={updateLoading}>
                  {updateLoading ? (
                    <><div className={`${styles.spinner} ${styles['spinner--light']}`}></div> Processing...</>
                  ) : (
                    'Confirm Inventory Update'
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </main>
  );
};

export default InventoryManagement;