import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Modal, Form, InputGroup } from 'react-bootstrap';
import { listInventory, adjustStock } from '../../../store/actions/admin/inventoryActions';
import { INVENTORY_UPDATE_RESET } from '../../../store/actions/admin/inventoryActions'; // Adjust path if needed
import { RootState } from '../../../store/reducers';

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
    setShowModal(true);
  };

  const submitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !adjustmentQty || !reason) return;
    // Pass the new data to Redux
    dispatch(adjustStock(selectedSku.sku, Number(adjustmentQty), reason, notes));
  };

  // Filter for searching SKUs or product names
  const filteredInventory = inventory?.filter((item: any) => 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-top border-primary border-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Clothing Inventory (SKU Level)</h3>
          </div>

          <Form.Group className="mb-4" style={{ maxWidth: '400px' }}>
            <Form.Control 
              type="text" 
              placeholder="Search by SKU or Product Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          {loading ? <Spinner animation="border" className="d-block mx-auto my-5" /> : error ? <Alert variant="danger">{error}</Alert> : (
            <Table responsive hover className="align-middle bg-white">
              <thead className="table-light">
                <tr>
                  <th>SKU</th>
                  <th>Product Details</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>In Stock</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="font-monospace fw-bold">{item.sku}</td>
                    <td>
                      <div className="fw-bold">{item.productName}</div>
                      <small className="text-muted">{item.brand} | {item.category} | {item.type}</small>
                    </td>
                    <td><Badge bg="light" text="dark" className="border">{item.color}</Badge></td>
                    <td><Badge bg="dark">{item.size}</Badge></td>
                    <td>
                      <Badge bg={item.stock > 10 ? 'success' : item.stock > 0 ? 'warning' : 'danger'} style={{ fontSize: '1rem' }}>
                        {item.stock}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenAdjust(item)}>
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* --- STOCK ADJUSTMENT MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Inventory</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitAdjustment}>
        <Modal.Body>
  {updateError && <Alert variant="danger">{updateError}</Alert>}
  
  {selectedSku && (
    <div className="mb-4 p-3 bg-light rounded border">
      <h6 className="fw-bold">{selectedSku.productName}</h6>
      <div className="text-muted font-monospace mb-2">{selectedSku.sku}</div>
      <Badge bg="dark" className="me-2">{selectedSku.size}</Badge>
      <Badge bg="secondary">{selectedSku.color}</Badge>
      <div className="mt-2">Current Stock: <strong>{selectedSku.stock}</strong></div>
    </div>
  )}

  <Form.Group className="mb-3">
    <Form.Label>Units to Add/Remove (Use negative for removal)</Form.Label>
    <Form.Control type="number" required placeholder="e.g., 50 or -5" value={adjustmentQty} onChange={(e) => setAdjustmentQty(e.target.value)} />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Reason for Adjustment</Form.Label>
    <Form.Select required value={reason} onChange={(e) => setReason(e.target.value)}>
      <option value="New Purchase Order">New Purchase Order (Stock In)</option>
      <option value="Customer Return">Customer Return (Stock In)</option>
      <option value="Damaged/Defective">Damaged / Defective (Stock Out)</option>
      <option value="Lost in Transit">Lost in Transit (Stock Out)</option>
      <option value="Inventory Correction">Inventory Correction</option>
      <option value="Other">Other</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-4">
    <Form.Label>Additional Notes (Optional)</Form.Label>
    <Form.Control as="textarea" rows={2} placeholder="e.g., PO# 12345 or Found missing box in warehouse" value={notes} onChange={(e) => setNotes(e.target.value)} />
  </Form.Group>

  <Button variant="primary" className="w-100" type="submit" disabled={updateLoading}>
    {updateLoading ? <Spinner size="sm" animation="border" /> : 'Confirm Inventory Update'}
  </Button>
</Modal.Body>
        </Form>
      </Modal>

    </Container>
  );
};

export default InventoryManagement;