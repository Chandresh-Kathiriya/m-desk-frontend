import {
    USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGIN_FAIL, USER_LOGOUT,
    USER_REGISTER_REQUEST, USER_REGISTER_SUCCESS, USER_REGISTER_FAIL
  } from '../../constants/user/authConstants';
  
  // 1. Define the shape of your state
  export interface AuthState {
    loading?: boolean;
    error?: string;
    isAuthenticated?: boolean;
    userInfo?: any; 
  }
  
  // 2. Apply the interface to the state parameter
  export const userAuthReducer = (state: AuthState = {}, action: any): AuthState => {
    switch (action.type) {
      case USER_LOGIN_REQUEST:
      case USER_REGISTER_REQUEST:
        return { loading: true };
      case USER_LOGIN_SUCCESS:
      case USER_REGISTER_SUCCESS:
        return { loading: false, userInfo: action.payload, isAuthenticated: true };
      case USER_LOGIN_FAIL:
      case USER_REGISTER_FAIL:
        return { loading: false, error: action.payload, isAuthenticated: false };
      case USER_LOGOUT:
        return { isAuthenticated: false };
      default:
        return state;
    }
  };