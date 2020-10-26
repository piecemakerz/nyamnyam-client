import { State } from 'react-native-gesture-handler';
import { ActionType } from 'typesafe-actions';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import * as authAPI from '@base/api/auth';
import { SigninInfo, SigninState, SigninUserData } from '@base/types/auth';
import {
  storeTokens,
  createAuthCheckSaga,
  getAuthErrMsg,
  clearTokens,
} from '@base/lib/auth';

//액션 타입
const INITIALIZE_SIGNIN = 'signnin/INITIALIZE_SIGNIN' as const;
const REQUEST_SIGNIN = 'signin/REQUEST_SIGNIN' as const;
const SIGNIN_SUCCESS = 'signin/SIGNIN_SUCCESS' as const;
const SIGNIN_ERROR = 'signin/SIGNIN_ERROR' as const;
const REFRESH = 'signin/REFRESH' as const;
const CHECK_TOKEN = 'signin/CHECK_TOKEN' as const;
const INVALID_TOKEN = 'signin/INVALID_TOKEN' as const;
const VALID_TOKEN = 'signin/VALID_TOKEN' as const;

//액션 생성자

export const initializeSignin = (service: 'customer' | 'store') => {
  return {
    type: INITIALIZE_SIGNIN,
    payload: service,
  };
};

export const requestSignin = (signinInfo: SigninInfo) => ({
  type: REQUEST_SIGNIN,
  payload: signinInfo,
});

export const signinSuccess = (
  userdata: SigninUserData,
  accessToken: string
) => ({
  type: SIGNIN_SUCCESS,
  payload: {
    userdata,
    accessToken,
  },
});

export const signinError = (msg: string) => ({
  type: SIGNIN_ERROR,
  payload: msg,
});

export const refresh = (accessToken: string, refreshToken: string) => ({
  type: REFRESH,
  payload: { accessToken, refreshToken },
});

export const checkToken = () => ({
  type: CHECK_TOKEN,
});

export const invalidToken = (statusCode: number | string) => ({
  type: INVALID_TOKEN,
  payload: statusCode,
});

export const validToken = (accessToken: string, userdata: SigninUserData) => ({
  type: VALID_TOKEN,
  payload: { accessToken, userdata },
});

const actions = {
  initializeSignin,
  signinSuccess,
  signinError,
  requestSignin,
  refresh,
  validToken,
  invalidToken,
};

type SigninAction = ActionType<typeof actions>;

//리덕스 사가
function* requestSigninSaga(action: ReturnType<typeof requestSignin>) {
  const signinInfo = action.payload;
  let res;
  console.log('before signin');

  try {
    res = yield call(authAPI.signin, signinInfo);
    console.log('res success: ', res.data.userdata);
    const userdata = res.data.userdata;
    const { access_token, refresh_token } = userdata;

    delete userdata.access_token;
    delete userdata.refresh_token;

    yield put(signinSuccess(userdata, access_token));

    //access token, refresh token 저장
    console.log(
      'signin success -> store token: access Token:',
      access_token,
      'refresh token: ',
      refresh_token
    );
    storeTokens(access_token, refresh_token);
  } catch (e) {
    res = e.response;
    console.log('error:', res, e);
    if (!res) {
      yield put(signinError('알려지지 않은 에러가 발생했습니다.'));
      return;
    }

    if (res.status == 400) {
      yield put(signinError('아이디 또는 비밀번호를 입력해주세요.'));
    } else if (res.status == 404) {
      yield put(signinError('계정이 존재하지 않습니다.'));
    } else {
      yield put(signinError(e.message));
    }
  }
}

const signinAuthCheckSaga = createAuthCheckSaga(true);

export function* signinSaga() {
  yield takeEvery(CHECK_TOKEN, signinAuthCheckSaga);
  yield takeLatest(REQUEST_SIGNIN, requestSigninSaga);
}

const initialState: SigninState = {
  isSignin: false,
  service: null,
  user: null,
  loading: false,
  error: null,
  accessToken: null,
};

//리듀서
export default function signin(
  state: SigninState = initialState,
  action: SigninAction
): SigninState {
  switch (action.type) {
    case INITIALIZE_SIGNIN:
      return {
        ...state,
        service: action.payload,
        user: null,
        loading: false,
        error: null,
        accessToken: null,
      };
    case REQUEST_SIGNIN:
      return {
        ...state,
        loading: true,
      };
    case SIGNIN_SUCCESS:
      return {
        ...state,
        isSignin: true,
        user: action.payload.userdata,
        loading: false,
        error: null,
        accessToken: action.payload.accessToken,
      };
    case SIGNIN_ERROR:
      return {
        ...state,
        isSignin: false,
        loading: false,
        error: action.payload,
      };
    case VALID_TOKEN:
      return {
        ...state,
        isSignin: true,
        accessToken: action.payload.accessToken,
        user: action.payload.userdata,
      };
    case INVALID_TOKEN:
      return {
        ...initialState,
        service: state.service,
        error: getAuthErrMsg(action.payload),
      };
    default:
      return state;
  }
}