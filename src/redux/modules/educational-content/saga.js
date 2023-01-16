import {all, call, fork, put, take} from "redux-saga/effects";

import {
    EDUCATIONAL_BOOKMARK_CONTENT,
    EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
    EDUCATIONAL_CONTENT_BOOKMARKED,
} from "./actions";
import ProfileService from "../../../services/ProfileService";


function* bookmarkHandler() {
    while (true) {
        const {payload} = yield take(EDUCATIONAL_BOOKMARK_CONTENT);
        const {slug, topicName, shouldMark} = payload;
        const markInfo = {
            topicName, slug
        };
        console.log(markInfo);
        const apiParam = markInfo.slug;
        console.log(apiParam);
        const response = yield call(ProfileService.bookMarkEducationalContent, apiParam, shouldMark);

        if (response.errors) {
            yield put({
                type: EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
                errorMsg: response.errors[0].endUserMessage
            });
        }
        else {
            yield put({
                type: EDUCATIONAL_CONTENT_BOOKMARKED,
                payload: {
                    markInfo,
                    shouldMark

                }
            });
        }
    }

}

export default function* educationalSaga() {
    yield all([
        fork(bookmarkHandler),
    ]);
}
