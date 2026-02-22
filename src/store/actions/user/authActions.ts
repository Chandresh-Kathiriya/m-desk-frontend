import axios from 'axios';
import {
  USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGIN_FAIL, USER_LOGOUT,
  USER_REGISTER_REQUEST, USER_REGISTER_SUCCESS, USER_REGISTER_FAIL
} from '../../constants/user/authConstants';

// We assume your base API URL is configured or proxy is set up in vite.config.ts
export const loginUser = (email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const config = { headers: { 'Content-Type': 'application/json' } };
    const { data } = await axios.post('/api/auth/login', { email, password }, config);

    dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error: any) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const registerUser = (userData: any) => async (dispatch: any) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    const config = { headers: { 'Content-Type': 'application/json' } };
    const { data } = await axios.post('/api/auth/register', userData, config);

    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data }); // Log them in automatically
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error: any) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const logoutUser = () => (dispatch: any) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
};