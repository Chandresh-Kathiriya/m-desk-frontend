import {
  ADMIN_LOGIN_REQUEST, ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAIL, ADMIN_LOGOUT,
  ADMIN_REGISTER_REQUEST, ADMIN_REGISTER_SUCCESS, ADMIN_REGISTER_FAIL
} from '../../constants/admin/authConstants';

// 1. Define the shape of your admin state
export interface AdminAuthState {
  loading?: boolean;
  error?: string;
  isAuthenticated?: boolean;
  adminInfo?: any; 
}

// 2. Apply the AdminAuthState interface to the state parameter
export const adminAuthReducer = (state: AdminAuthState = {}, action: any): AdminAuthState => {
  switch (action.type) {
    case ADMIN_LOGIN_REQUEST:
    case ADMIN_REGISTER_REQUEST:
      return { loading: true };
    case ADMIN_LOGIN_SUCCESS:
    case ADMIN_REGISTER_SUCCESS:
      return { loading: false, adminInfo: action.payload, isAuthenticated: true };
    case ADMIN_LOGIN_FAIL:
    case ADMIN_REGISTER_FAIL:
      return { loading: false, error: action.payload, isAuthenticated: false };
    case ADMIN_LOGOUT:
      return { isAuthenticated: false };
    default:
      return state;
  }
};