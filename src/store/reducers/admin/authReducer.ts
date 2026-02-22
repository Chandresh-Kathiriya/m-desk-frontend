import {
    ADMIN_LOGIN_REQUEST, ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAIL, ADMIN_LOGOUT,
    ADMIN_REGISTER_REQUEST, ADMIN_REGISTER_SUCCESS, ADMIN_REGISTER_FAIL
  } from '../../constants/admin/authConstants';
  
  export const adminAuthReducer = (state = {}, action: any) => {
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