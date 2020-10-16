import { combineReducers } from 'redux';
import signup, { signupSaga } from './signup';
import { all } from 'redux-saga/effects';

const rootReducer = combineReducers({
  signup,
});

export function* rootSaga() {
  yield all([signupSaga()]); // all은 배열 안의 여러 사가를 동시에 실행시켜준다.
}

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
