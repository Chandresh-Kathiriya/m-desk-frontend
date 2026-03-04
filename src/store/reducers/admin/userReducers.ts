import { USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAIL, USER_LIST_RESET, USER_CREATE_REQUEST, USER_CREATE_SUCCESS, USER_CREATE_RESET, USER_CREATE_FAIL } from '../../constants/admin/userConstants';

export const userListReducer = (state = { users: [] }, action: any) => {
    switch (action.type) {
        case USER_LIST_REQUEST: return { loading: true, users: [] };
        case USER_LIST_SUCCESS: return { loading: false, users: action.payload };
        case USER_LIST_FAIL: return { loading: false, error: action.payload };
        case USER_LIST_RESET: return { users: [] };
        default: return state;
    }
};

export const userCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case USER_CREATE_REQUEST:
            return { loading: true };
        case USER_CREATE_SUCCESS:
            // We safely grab the user object from the payload
            return { loading: false, success: true, user: action.payload.user || action.payload };
        case USER_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case USER_CREATE_RESET:
            return {};
        default:
            return state;
    }
};