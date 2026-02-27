import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { listAdminProducts, deleteProduct } from '../../../store/actions/admin/productActions';
import { RootState } from '../../../store/reducers';

import styles from '../../../schemas/css/ProductList.module.css';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const productList = useSelector((state: RootState) => state.productList);
  const { loading, error, products } = productList;

  const productDelete = useSelector((state: RootState) => state.productDelete);
  const { success: successDelete } = productDelete;

  useEffect(() => {
    dispatch(listAdminProducts());
  }, [dispatch, successDelete]);

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? All its SKUs will be lost.')) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        
        <div className={styles.card}>
          <header className={styles['card-header']}>
            <h1 className={styles['card-title']}>Product Catalog</h1>
            <button className={`${styles.btn} ${styles['btn-primary']}`} onClick={() => navigate('/admin/products/new')}>
              + Add New Product
            </button>
          </header>

          {loading ? (
            <div className={styles['state-container']}>
              <div className={styles.spinner}></div>
            </div>
          ) : error ? (
            <div className={`${styles.alert} ${styles['alert--error']}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          ) : (
            <div className={styles['table-responsive']}>
              <table className={styles['admin-table']}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Type</th>
                    <th className={styles['align-center']}>Variants (SKUs)</th>
                    <th className={styles['align-center']}>Status</th>
                    <th className={styles['align-right']}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.map((product: any) => (
                    <tr key={product._id}>
                      <td className={styles['text-product-name']}>{product.productName}</td>
                      <td>{product.productCategory?.name || '-'}</td>
                      <td>{product.brand?.name || '-'}</td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge--info']}`}>
                          {product.productType}
                        </span>
                      </td>
                      <td className={styles['align-center']}>
                        <span className={`${styles.badge} ${styles['badge--dark']} ${styles['badge--pill']}`}>
                          {product.variants?.length || 0} SKUs
                        </span>
                      </td>
                      <td className={styles['align-center']}>
                        {product.published ? (
                          <span className={`${styles.badge} ${styles['badge--success']}`}>Published</span>
                        ) : (
                          <span className={`${styles.badge} ${styles['badge--warning']}`}>Draft</span>
                        )}
                      </td>
                      <td className={styles['align-right']}>
                        <div className={styles['action-group']}>
                          <button 
                            className={`${styles.btn} ${styles['btn-outline-primary']}`} 
                            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                          >
                            Edit
                          </button>
                          <button 
                            className={`${styles.btn} ${styles['btn-outline-danger']}`} 
                            onClick={() => deleteHandler(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!products || products.length === 0) && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }} className="text-muted">
                        No products found. Start by creating a new one!
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

export default ProductList;