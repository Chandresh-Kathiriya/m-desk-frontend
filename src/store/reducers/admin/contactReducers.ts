import { CONTACT_LIST_REQUEST, CONTACT_LIST_SUCCESS, CONTACT_LIST_FAIL } from '../../constants/admin/contactConstants';

export const contactListReducer = (state = { contacts: [] }, action: any) => {
    switch (action.type) {
        case CONTACT_LIST_REQUEST: return { loading: true, contacts: [] };
        case CONTACT_LIST_SUCCESS: return { loading: false, contacts: action.payload };
        case CONTACT_LIST_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};