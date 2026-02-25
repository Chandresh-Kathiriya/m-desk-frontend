import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, ListGroup, Button, Table, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { listMasterData, createMasterData, updateMasterData, deleteMasterData } from '../../../store/actions/admin/masterDataActions';
import { MASTER_DATA_CREATE_RESET, MASTER_DATA_UPDATE_RESET } from '../../../store/constants/admin/masterDataConstants';
import { RootState } from '../../../store/reducers';

const emptyRow = { name: '', description: '', hexCode: '#000000', code: '' };

const MasterDataManagement: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [activeTab, setActiveTab] = useState<'brands' | 'colors' | 'sizes' | 'styles' | 'categories' | 'types'>('brands');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  
  // --- NEW: Array State for Bulk Add ---
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

  // --- NEW: Dynamic Row Handlers ---
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
      // Editing sends a single object
      dispatch(updateMasterData(activeTab, editingId, formDataArray[0]));
    } else {
      // Creating sends the whole array (Bulk Add)
      dispatch(createMasterData(activeTab, formDataArray));
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Master Data Management</h2>
      <Row>
        <Col md={3}>
          <Card className="shadow-sm">
            <ListGroup variant="flush">
              <ListGroup.Item action active={activeTab === 'brands'} onClick={() => setActiveTab('brands')}>Brands</ListGroup.Item>
              <ListGroup.Item action active={activeTab === 'colors'} onClick={() => setActiveTab('colors')}>Colors</ListGroup.Item>
              <ListGroup.Item action active={activeTab === 'sizes'} onClick={() => setActiveTab('sizes')}>Sizes</ListGroup.Item>
              <ListGroup.Item action active={activeTab === 'styles'} onClick={() => setActiveTab('styles')}>Styles</ListGroup.Item>
              <ListGroup.Item action active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>Categories</ListGroup.Item>
              <ListGroup.Item action active={activeTab === 'types'} onClick={() => setActiveTab('types')}>Product Types</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={9}>
          <Card className="shadow-sm border-top border-primary border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-capitalize mb-0">{activeTab}</h4>
                <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                  + Add New {activeTab.slice(0, -1)}
                </Button>
              </div>

              {loading ? <Spinner animation="border" className="d-block mx-auto" /> : error ? <Alert variant="danger">{error}</Alert> : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      {(activeTab === 'brands' || activeTab === 'categories') && <th>Description</th>}
                      {activeTab === 'colors' && <th>Color Swatch</th>}
                      {activeTab === 'sizes' && <th>Size Code</th>}
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record: any) => (
                      <tr key={record._id}>
                        <td className="fw-bold">{record.name}</td>
                        {(activeTab === 'brands' || activeTab === 'categories') && <td>{record.description || '-'}</td>}
                        {activeTab === 'colors' && (
                          <td>
                            <Badge bg="light" text="dark" className="border d-flex align-items-center" style={{ width: 'fit-content' }}>
                              <div style={{ width: '15px', height: '15px', backgroundColor: record.hexCode, borderRadius: '50%', marginRight: '8px', border: '1px solid #ccc' }}></div>
                              {record.hexCode}
                            </Badge>
                          </td>
                        )}
                        {activeTab === 'sizes' && <td><Badge bg="secondary">{record.code}</Badge></td>}
                        <td className="text-end">
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(record)}>Edit</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(record._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                    {currentRecords.length === 0 && <tr><td colSpan={5} className="text-center py-4">No records found.</td></tr>}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- NEW BULK ADD MODAL --- */}
      <Modal show={showModal} onHide={handleCloseModal} centered size={editingId ? 'sm' : 'lg'}>
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">
            {editingId ? 'Edit' : 'Bulk Add'} {activeTab}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="bg-light">
            {(createError || updateError) && <Alert variant="danger">{createError || updateError}</Alert>}

            {formDataArray.map((row, index) => (
              <Card key={index} className="mb-3 shadow-sm border-0 relative">
                <Card.Body>
                  {/* Remove Row Button (Only show if creating and multiple rows exist) */}
                  {!editingId && formDataArray.length > 1 && (
                    <Button variant="link" className="text-danger position-absolute top-0 end-0 text-decoration-none" onClick={() => handleRemoveRow(index)}>
                      &times; Remove
                    </Button>
                  )}

                  <Row>
                    <Col md={(activeTab === 'colors' || activeTab === 'sizes') ? 6 : 12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-muted small text-uppercase">Name</Form.Label>
                        <Form.Control type="text" required value={row.name} onChange={(e) => handleRowChange(index, 'name', e.target.value)} />
                      </Form.Group>
                    </Col>

                    {(activeTab === 'brands' || activeTab === 'categories') && (
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold text-muted small text-uppercase">Description</Form.Label>
                          <Form.Control as="textarea" rows={2} value={row.description} onChange={(e) => handleRowChange(index, 'description', e.target.value)} />
                        </Form.Group>
                      </Col>
                    )}

                    {activeTab === 'sizes' && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold text-muted small text-uppercase">Size Code</Form.Label>
                          <Form.Control type="text" required value={row.code} onChange={(e) => handleRowChange(index, 'code', e.target.value)} />
                        </Form.Group>
                      </Col>
                    )}

                    {activeTab === 'colors' && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold text-muted small text-uppercase">Hex Code</Form.Label>
                          <div className="d-flex align-items-center gap-3">
                            <Form.Control type="color" required value={row.hexCode} onChange={(e) => handleRowChange(index, 'hexCode', e.target.value)} style={{ width: '40px', height: '38px', padding: '0' }}/>
                            <Form.Control type="text" required value={row.hexCode} onChange={(e) => handleRowChange(index, 'hexCode', e.target.value)} />
                          </div>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            ))}

            {!editingId && (
              <Button variant="outline-primary" size="sm" onClick={handleAddRow} className="fw-bold">
                + Add Another Row
              </Button>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={createLoading || updateLoading}>
              {createLoading || updateLoading ? <Spinner size="sm" animation="border" /> : (editingId ? 'Update Record' : `Save ${formDataArray.length} Record(s)`)}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MasterDataManagement;