import {fork, all} from "redux-saga/effects";
import {authSaga, profileSaga, connectionsSaga, chatSaga, educationalSaga, appointmentSaga, settingsSaga} from "../modules";

export default function* rootSaga(store) {
    yield all([
        fork(authSaga),
        fork(profileSaga),
        fork(appointmentSaga),
        fork(settingsSaga),
        fork(connectionsSaga, store),
        fork(educationalSaga),
        fork(chatSaga, store),
    ]);
}
