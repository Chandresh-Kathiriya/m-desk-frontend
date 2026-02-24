import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, ListGroup, Button, Table, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { listMasterData, createMasterData, updateMasterData, deleteMasterData } from '../../../store/actions/admin/masterDataActions';
import { MASTER_DATA_CREATE_RESET, MASTER_DATA_UPDATE_RESET } from '../../../store/constants/admin/masterDataConstants';
import { RootState } from '../../../store/reducers';

const MasterDataManagement: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [activeTab, setActiveTab] = useState<'brands' | 'colors' | 'sizes' | 'styles' | 'categories' | 'types'>('brands');
  
  // --- NEW: Edit Tracking State ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [formData, setFormData] = useState({ name: '', description: '', hexCode: '#000000', code: '' });

  const masterDataList = useSelector((state: RootState) => state.masterDataList || {} as any);
  const { loading, error } = masterDataList;
  const currentRecords = masterDataList[activeTab] || []; 

  const masterDataCreate = useSelector((state: RootState) => state.masterDataCreate || {} as any);
  const { loading: createLoading, error: createError, success: createSuccess } = masterDataCreate;

  const masterDataUpdate = useSelector((state: RootState) => state.masterDataUpdate || {} as any);
  const { loading: updateLoading, error: updateError, success: updateSuccess } = masterDataUpdate;

  useEffect(() => {
    dispatch(listMasterData(activeTab));
  }, [dispatch, activeTab, createSuccess, updateSuccess]); // Reload when tab changes OR create/update succeeds

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
    setFormData({ name: '', description: '', hexCode: '#000000', code: '' });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', hexCode: '#000000', code: '' });
    setShowModal(true);
  };

  // --- NEW: Populate form for editing ---
  const handleOpenEdit = (record: any) => {
    setEditingId(record._id);
    setFormData({
      name: record.name || '',
      description: record.description || '',
      hexCode: record.hexCode || '#000000',
      code: record.code || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteMasterData(activeTab, id)).then(() => dispatch(listMasterData(activeTab)));
    }
  };

  // --- NEW: Smart Submit (Handles both Create & Update) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateMasterData(activeTab, editingId, formData));
    } else {
      dispatch(createMasterData(activeTab, formData));
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

              {loading && <Spinner animation="border" className="d-block mx-auto" />}
              {error && <Alert variant="danger">{error}</Alert>}

              {!loading && !error && (
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
                          {/* --- NEW: Edit Button --- */}
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(record)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(record._id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {currentRecords.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-muted py-4">No records found.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">
            {editingId ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {(createError || updateError) && <Alert variant="danger">{createError || updateError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Form.Group>

            {(activeTab === 'brands' || activeTab === 'categories') && (
  <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control as="textarea" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
  </Form.Group>
)}

            {activeTab === 'sizes' && (
              <Form.Group className="mb-3">
                <Form.Label>Size Code</Form.Label>
                <Form.Control type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              </Form.Group>
            )}

            {activeTab === 'colors' && (
              <Form.Group className="mb-3">
                <Form.Label>Hex Code</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Control type="color" required value={formData.hexCode} onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })} style={{ width: '50px', height: '40px', padding: '0' }}/>
                  <Form.Control type="text" required value={formData.hexCode} onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })} />
                </div>
              </Form.Group>
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={createLoading || updateLoading}>
              {createLoading || updateLoading ? <Spinner size="sm" animation="border" /> : (editingId ? 'Update Record' : 'Save Record')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MasterDataManagement;