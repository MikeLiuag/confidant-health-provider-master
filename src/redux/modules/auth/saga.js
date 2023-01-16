import {take, put, call, all, fork, cancel} from "redux-saga/effects";

import {
    PROVIDER_LOGIN,
    PROVIDER_LOGOUT,
    PROVIDER_LOGIN_FAILED,
    PROVIDER_LOGIN_SUCCESSFUL,
    PROVIDER_VERIFY_CODE,
    PROVIDER_VERIFICATION_FAILED,
    PROVIDER_CODE_VERIFICATION_SUCCESSFUL,
    PROVIDER_UPDATE_PASSWORD,
    PROVIDER_UPDATE_PASSWORD_FAILED,
    PROVIDER_PASSWORD_UPDATED
} from './actions';

import AuthService from "../../../services/AuthService";
import AuthStore from "../../../utilities/AuthStore";

import KeyValueStorage from "react-native-key-value-storage";
import {GET_PROFILE} from "../profile/actions";
import {SEGMENT_EVENT, VERIFICATION_CODE_TYPE} from "../../../constants/CommonConstants";
import {AlertUtil, SocketClient} from "ch-mobile-shared";
import Analytics from "@segment/analytics-react-native";
import moment from "moment";
import Instabug from 'instabug-reactnative';
function* loginHandler() {
    while (true) {

        const {payload} = yield take(PROVIDER_LOGIN);
        let isLoggedIn = false;
        try {
            const response = yield call(AuthService.login, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: PROVIDER_LOGIN_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                yield call(saveAuthToken, response);
                Analytics.track(SEGMENT_EVENT.NEW_LOGIN, {
                    providerId: response?.userId,
                    loggedInAt : moment.utc(Date.now()).format()
                });
                yield put({
                    type: PROVIDER_LOGIN_SUCCESSFUL,
                    data: response
                });
                isLoggedIn = true;

            }

        } catch (error) {
            yield put({
                type: PROVIDER_LOGIN_FAILED,
                errorMsg: error
            });
        }
        if(isLoggedIn){

            yield put({
                type: GET_PROFILE
            });
        }
    }
}

function* logoutHandler() {
    yield take(PROVIDER_LOGOUT);
    SocketClient.getInstance().unregisterConnectivityCallbacks("GlobalSocketWatcher");
    let playerId = yield call(KeyValueStorage.get, 'playerId');
    if (playerId) {
        const response = yield call(AuthService.removePlayerId, {'playerId': playerId});
        if (response.errors) {
            console.log(response.errors[0].endUserMessage)
        } else {
            try {
                yield call(KeyValueStorage.remove, 'playerId');
                console.log('PLAYER ID SUCCESSFULLY REMOVED');
            } catch (e) {
                console.log('Error removing player Id');
                console.log(e);
            }
        }
    }
    yield call(AuthService.logout);
    yield call(Instabug.logOut);
}

function* saveAuthToken({accessToken, expiration, tokenType}) {
        yield call(AuthStore.setAuthToken, accessToken, expiration, tokenType);
}

function* codeVerificationHandler() {

    while (true) {
        const {payload} = yield take(PROVIDER_VERIFY_CODE);
        try {
            const response = yield call(AuthService.verifyConfirmationCode, payload);
            if (response.errors) {
                yield put({
                    type: PROVIDER_VERIFICATION_FAILED, errorMsg: response.errors[0].endUserMessage
                });
            } else {
                if (payload.codeType === VERIFICATION_CODE_TYPE.ONE_TIME_PASSWORD) {
                    yield call(saveAuthToken, response);
                    yield put({type: PROVIDER_LOGIN_SUCCESSFUL, data: response});
                } else {
                    yield put({type: PROVIDER_CODE_VERIFICATION_SUCCESSFUL});
                }
            }
        } catch (error) {
            yield put({type: PROVIDER_VERIFICATION_FAILED, errorMsg: error});
        }
    }
}


function* updatePasswordHandler() {
    while (true) {
        const {payload} = yield take(PROVIDER_UPDATE_PASSWORD);
        try {
            const response = yield call(AuthService.updatePassword, payload);
            if (response.errors) {
                yield put({
                    type: PROVIDER_UPDATE_PASSWORD_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                yield put({type: PROVIDER_PASSWORD_UPDATED});
            }
        } catch (error) {
            yield put({type: PROVIDER_UPDATE_PASSWORD_FAILED, errorMsg: error});
        }
    }
}

export default function* authSaga() {
    yield all([
        fork(loginHandler),
        fork(logoutHandler),
        fork(codeVerificationHandler),
        fork(updatePasswordHandler)
    ]);
}
