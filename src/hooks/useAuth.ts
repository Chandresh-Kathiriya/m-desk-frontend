import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../redux/slices/authSlice';
import { authService, LoginRequest, RegisterRequest } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginRequest) => {
    dispatch(loginStart());
    try {
      const response = await authService.login(credentials);
      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed';
      dispatch(loginFailure(error));
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    dispatch(loginStart());
    try {
      const response = await authService.register(data);
      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed';
      dispatch(loginFailure(error));
      throw err;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};
