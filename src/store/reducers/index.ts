import { combineReducers } from 'redux';
import { userAuthReducer } from './user/authReducer';
import { adminAuthReducer } from './admin/authReducer';

const rootReducer = combineReducers({
  userAuth: userAuthReducer,
  adminAuth: adminAuthReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;