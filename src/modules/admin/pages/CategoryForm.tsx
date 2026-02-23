import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';
import { listCategoryDetails, createCategory, updateCategory } from '../../../store/actions/admin/categoryActions';
import { CATEGORY_CREATE_RESET, CATEGORY_UPDATE_RESET } from '../../../store/constants/admin/categoryConstants';

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const text = textSchema.en.adminCategories;
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const categoryCreate = useSelector((state: RootState) => state.categoryCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = categoryCreate as any;

  const categoryUpdate = useSelector((state: RootState) => state.categoryUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = categoryUpdate as any;

  const categoryDetails = useSelector((state: RootState) => state.categoryDetails);
  const { category } = categoryDetails as any;

  useEffect(() => {
    if (successCreate || successUpdate) {
      dispatch({ type: CATEGORY_CREATE_RESET });
      dispatch({ type: CATEGORY_UPDATE_RESET });
      navigate('/admin/categories');
    } else if (isEditing) {
      if (!category || category._id !== id) {
        dispatch(listCategoryDetails(id as string));
      } else {
        setFormData({
          name: category.name,
          description: category.description || '',
          isActive: category.isActive,
        });
      }
    }
  }, [dispatch, navigate, id, isEditing, category, successCreate, successUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateCategory({ _id: id, ...formData }));
    } else {
      dispatch(createCategory(formData));
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '600px', borderTop: '4px solid var(--primary-color)' }}>
        <Card.Body>
          <h3 className="mb-4 text-center">{isEditing ? text.formTitleEdit : text.formTitleAdd}</h3>
          
          {errorCreate && <Alert variant="danger">{errorCreate}</Alert>}
          {errorUpdate && <Alert variant="danger">{errorUpdate}</Alert>}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>{text.nameLabel}</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{text.descLabel}</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check type="switch" id="active-switch" name="isActive" label={text.activeLabel} checked={formData.isActive} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/admin/categories')}>{text.cancelBtn}</Button>
              <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--primary-color)' }} disabled={loadingCreate || loadingUpdate}>
                {loadingCreate || loadingUpdate ? <Spinner size="sm" animation="border" /> : text.saveBtn}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CategoryForm;