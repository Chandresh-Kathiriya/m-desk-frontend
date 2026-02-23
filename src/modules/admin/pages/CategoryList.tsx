import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Button, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';
import { listCategories, deleteCategory } from '../../../store/actions/admin/categoryActions';

const CategoryList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.adminCategories;

  // 1. Pull the live category list from Redux
  const categoryList = useSelector((state: RootState) => state.categoryList);
  const { loading, error, categories } = categoryList as any;

  // 2. Pull the delete state so we know when to refresh the table
  const categoryDelete = useSelector((state: RootState) => state.categoryDelete);
  const { success: successDelete } = categoryDelete as any;

  useEffect(() => {
    // 3. Dispatch the action to fetch from the database
    // It will re-run automatically if a category is successfully deleted
    dispatch(listCategories());
  }, [dispatch, successDelete]);

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // 4. Dispatch the real delete action
      dispatch(deleteCategory(id));
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{text.title}</h2>
        <Link to="/admin/categories/new">
          <Button variant="primary" style={{ backgroundColor: 'var(--primary-color)' }}>
            + {text.addCategoryBtn}
          </Button>
        </Link>
      </div>

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead style={{ backgroundColor: 'var(--bg-light)' }}>
                <tr>
                  <th>{text.tableHeaders.name}</th>
                  <th>{text.tableHeaders.description}</th>
                  <th>{text.tableHeaders.status}</th>
                  <th className="text-end">{text.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((category: any) => (
                  <tr key={category._id} className="align-middle">
                    <td className="text-capitalize"><strong>{category.name}</strong></td>
                    <td>{category.description || '-'}</td>
                    <td>
                      <Badge bg={category.isActive ? 'success' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/categories/${category._id}/edit`}>
                        <Button variant="outline-info" size="sm" className="me-2">{text.editBtn}</Button>
                      </Link>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteHandler(category._id)}>
                        {text.deleteBtn}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CategoryList;