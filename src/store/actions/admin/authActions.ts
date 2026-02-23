import axios from 'axios';
import {
  ADMIN_LOGIN_REQUEST, ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAIL, ADMIN_LOGOUT,
  ADMIN_REGISTER_REQUEST, ADMIN_REGISTER_SUCCESS, ADMIN_REGISTER_FAIL
} from '../../constants/admin/authConstants';

export const loginAdmin = (email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch({ type: ADMIN_LOGIN_REQUEST });

    const config = { headers: { 'Content-Type': 'application/json' } };
    const { data } = await axios.post('/api/auth/login', { email, password }, config);

    // Optional: Add a check here to ensure data.user.role === 'admin' before dispatching success
    dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('adminInfo', JSON.stringify(data));
  } catch (error: any) {
    dispatch({
      type: ADMIN_LOGIN_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const logoutAdmin = () => (dispatch: any) => {
  localStorage.removeItem('adminInfo');
  dispatch({ type: ADMIN_LOGOUT });
};

export const registerAdmin = (adminData: any) => async (dispatch: any) => {
  try {
    dispatch({ type: ADMIN_REGISTER_REQUEST });

    const config = { headers: { 'Content-Type': 'application/json' } };
    
    // Notice we might need a dedicated route or to pass a role flag here
    const { data } = await axios.post('/api/auth/register', { ...adminData, role: 'admin' }, config);

    dispatch({ type: ADMIN_REGISTER_SUCCESS, payload: data });
    dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('adminInfo', JSON.stringify(data));
  } catch (error: any) {
    dispatch({
      type: ADMIN_REGISTER_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};