import {
    COUPON_VALIDATE_REQUEST,
    COUPON_VALIDATE_SUCCESS,
    COUPON_VALIDATE_FAIL,
    COUPON_VALIDATE_RESET,
} from '../../constants/user/couponConstants';

export const couponValidateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case COUPON_VALIDATE_REQUEST:
            return { loading: true };
        case COUPON_VALIDATE_SUCCESS:
            return { loading: false, success: true, couponInfo: action.payload };
        case COUPON_VALIDATE_FAIL:
            return { loading: false, error: action.payload };
        case COUPON_VALIDATE_RESET:
            return {};
        default:
            return state;
    }
};