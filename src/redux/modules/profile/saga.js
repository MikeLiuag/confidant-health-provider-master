import {take, put, call, all, fork, cancel} from "redux-saga/effects";
import {
    GET_PROFILE,
    PROFILE_FETCH_FAILED,
    PROFILE_FETCH_SUCCESSFUL,
    PROFILE_GET_EDUCATION_STATUS_FAILED,
    PROFILE_GET_MARKED_EDUCATION_CONTENT,
    PROFILE_MARKED_EDUCATION_CONTENT,
    PROFILE_UPDATE,
    PROFILE_UPDATE_FAILED,
    PROFILE_UPDATED
} from "./actions";
import ProfileService from "../../../services/ProfileService";
import {AlertUtil} from "ch-mobile-shared";
import Instabug from 'instabug-reactnative';
function* profileFetcher() {
    while (true) {
        yield take(GET_PROFILE);
        const response = yield call(ProfileService.getProfile);
        if (response.errors) {
            yield put({
                type: PROFILE_FETCH_FAILED,
                errorMsg: response.errors[0].endUserMessage
            });
        } else {
            Instabug.identifyUser(response.emailAddress, response.fullName);
            yield put({
                type: PROFILE_FETCH_SUCCESSFUL,
                profile: response
            });
        }
    }
}

function* markedEducationalContentFetcher() {
    while (true) {
        try {
            yield take(PROFILE_GET_MARKED_EDUCATION_CONTENT);
            let bookmarkedContentResponse = yield call(ProfileService.getMarkedEducationalContent, "bookmarked");

            if (bookmarkedContentResponse.errors) {
                yield put({
                    type: PROFILE_GET_EDUCATION_STATUS_FAILED,
                    errorMsg: bookmarkedContentResponse.errors[0].endUserMessage
                });
            }
            else {
                bookmarkedContentResponse = bookmarkedContentResponse.map(slug => {
                    return {slug}
                });
                yield put({
                    type: PROFILE_MARKED_EDUCATION_CONTENT,
                    payload: {bookmarkedContentResponse}
                });
            }
        } catch (error) {
            console.warn(error);
            yield put({type: PROFILE_GET_EDUCATION_STATUS_FAILED, errorMsg: error});
        }
    }
}

function* profileUpdateHandler() {
    while (true) {
        try {
            const {payload} = yield take(PROFILE_UPDATE);
            const response = yield call(ProfileService.updateProfile, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: PROFILE_UPDATE_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                AlertUtil.showSuccessMessage("Profile updated successfully");
                yield put({
                    type: PROFILE_UPDATED,
                    payload: response
                });
            }
        } catch (e) {
            AlertUtil.showErrorMessage(e);
            yield put({type: PROFILE_UPDATE_FAILED, errorMsg: e});
        }
    }
}


export default function* profileSaga() {
    yield all([
        fork(profileFetcher),
        fork(profileUpdateHandler),
        fork(markedEducationalContentFetcher)
    ]);
}
