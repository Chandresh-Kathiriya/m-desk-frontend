import { USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAIL, USER_LIST_RESET } from '../../constants/admin/userConstants';

export const userListReducer = (state = { users: [] }, action: any) => {
    switch (action.type) {
        case USER_LIST_REQUEST: return { loading: true, users: [] };
        case USER_LIST_SUCCESS: return { loading: false, users: action.payload };
        case USER_LIST_FAIL: return { loading: false, error: action.payload };
        case USER_LIST_RESET: return { users: [] };
        default: return state;
    }
};