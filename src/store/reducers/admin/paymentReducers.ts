import {
    PAYMENT_CREATE_REQUEST,
    PAYMENT_CREATE_SUCCESS,
    PAYMENT_CREATE_FAIL,
    PAYMENT_CREATE_RESET
} from '../../constants/admin/paymentConstants';

export const paymentCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case PAYMENT_CREATE_REQUEST:
            return { loading: true };
        case PAYMENT_CREATE_SUCCESS:
            return { loading: false, success: true, payment: action.payload };
        case PAYMENT_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case PAYMENT_CREATE_RESET:
            return {};
        default:
            return state;
    }
};