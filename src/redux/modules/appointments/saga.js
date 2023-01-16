import {all, call, fork, put, take, takeLatest, select, cancel} from "redux-saga/effects";
import {
    APPOINTMENTS_ADD_TO_CALENDER, APPOINTMENTS_CURRENT_FETCHED,
    APPOINTMENTS_FETCH, APPOINTMENTS_FETCH_CURRENT, APPOINTMENTS_FETCH_CURRENT_FAILED,
    APPOINTMENTS_FETCH_FAILED, APPOINTMENTS_FETCH_PAST, APPOINTMENTS_FETCH_PAST_FAILED, APPOINTMENTS_FETCH_SILENT, APPOINTMENTS_PAST_FETCHED
} from "./actions";
import AppointmentService from "../../../services/AppointmentService";
import moment from "moment-timezone";
import {AlertUtil, getAvatar,getDSTOffset} from "ch-mobile-shared";
import {
    SETTINGS_APPOINTMENTS_FETCH_FAILED,
    SETTINGS_APPOINTMENTS_FETCHED,
    SETTINGS_APPOINTMENTS_NO_SCHEDULE,
    SETTINGS_GET_APPOINTMENTS
} from "../settings/actions";
import {PROVIDER_LOGOUT} from "../auth/actions";
import * as AddCalendarEvent from "react-native-add-calendar-event";
import AuthStore from '../../../utilities/AuthStore';

function* appointmentsChannel() {
    yield takeLatest([APPOINTMENTS_FETCH, APPOINTMENTS_FETCH_SILENT], appointmentsCombinedFetcher);
}

function* appointmentsCombinedFetcher(action) {
    try {
        let refresh = false;
        if (action.type === APPOINTMENTS_FETCH_SILENT) {
            refresh = true;
        }
        yield put({
            type: APPOINTMENTS_FETCH_CURRENT,
            payload: {size: 30, refresh}
        });
        yield put({
            type: APPOINTMENTS_FETCH_PAST,
            payload: {size: 30, refresh}
        });
    } catch (e) {
        console.log(e);
        yield put({type: APPOINTMENTS_FETCH_FAILED, errorMsg: e});
    }
}

function* fetchAppointments(args,action) {
    const {type, successAction, failAction} = args[0];
    const {payload} = action;
    const {size} = payload;
    const refDate = moment();
    yield call(fetchAppointmentsByType, type, size, refDate, successAction, failAction, true);
}

function* fetchCurrentAppointments() {
        yield takeLatest(APPOINTMENTS_FETCH_CURRENT, fetchAppointments, [{type: 'current', successAction: APPOINTMENTS_CURRENT_FETCHED, failAction: APPOINTMENTS_FETCH_CURRENT_FAILED}]);
}

function* fetchPastAppointments() {
    yield takeLatest(APPOINTMENTS_FETCH_PAST, fetchAppointments, [{type: 'past', successAction: APPOINTMENTS_PAST_FETCHED, failAction: APPOINTMENTS_FETCH_PAST_FAILED}]);
}

function* fetchAppointmentsByType(type, size, refDate, successAction, failAction, initialFetch = false) {
    try {
        const {userId} = yield select(state => state.auth.meta);
        let tz = yield select((state) => state.settings.appointments.timezone);
        if (!tz) {
            yield put({
                type: SETTINGS_GET_APPOINTMENTS
            });
            const waitAction = yield take([SETTINGS_APPOINTMENTS_FETCHED, SETTINGS_APPOINTMENTS_NO_SCHEDULE, SETTINGS_APPOINTMENTS_FETCH_FAILED, PROVIDER_LOGOUT]);
            tz = yield select((state) => state.settings.appointments.timezone);
            if (!tz) {
                if (waitAction.type === PROVIDER_LOGOUT) {
                } else if (waitAction.type === SETTINGS_APPOINTMENTS_FETCH_FAILED) {
                    AlertUtil.showErrorMessage("Unable to retrieve Provider timezone, setting phone timezone as fallback");
                }
                tz = moment.tz.guess(true);
            }
        }
        let response = yield call(AppointmentService.getAppointmentsV2, type, size, refDate.format('DD-MM-yyyy'),tz,userId);
        if (response.errors) {
            yield put({
                type: failAction,
                errorMsg: response.errors[0].endUserMessage
            });
        } else {
            if (!response.singleAppointments) {
                response.singleAppointments = [];
            }
            let appointments = response.singleAppointments;
            appointments = yield call(Promise.all, appointments.map(async appointment => {
                const dstOffset = getDSTOffset();
                let startMoment = moment.tz(appointment.startTime,tz).utcOffset(dstOffset);
                let endMoment = moment.tz(appointment.endTime,tz).utcOffset(dstOffset);
                appointment.date = startMoment.format("DD");
                appointment.month = startMoment.format("MMM");
                appointment.startText = startMoment.format("h:mm a");
                appointment.endText = endMoment.format("h:mm a");
                appointment.year = startMoment.format("YYYY");
                appointment.profilePicture = appointment.participantImage;
                appointment.avatar = appointment.profilePicture ? getAvatar(appointment) : null;
                const inCalender = await AuthStore.hasCalendarEvent(appointment.appointmentId);
                appointment.addedInCalendar = !!(inCalender && inCalender === appointment.appointmentId);
                return appointment;
            }));
            if (appointments.length > 0) {
                yield put({
                    type: successAction,
                    payload: {appointments: appointments, initialFetch},
                });
                if (response.hasMore) {
                    if (type === 'current') {
                        refDate = refDate.add('days', 30);
                    } else {
                        refDate = refDate.subtract('days', 30);
                    }
                    yield call(fetchAppointmentsByType, type, size + 30, refDate, successAction, failAction, false);
                }
            } else {
                if (response.hasMore) {
                    yield call(fetchAppointmentsByType, type, size + 30, refDate, successAction, failAction, initialFetch);
                } else {
                    yield put({
                        type: successAction,
                        payload: {appointments: [], initialFetch},
                    });
                }
            }
        }
    } catch (e) {
        console.log(e);
        yield put({type: failAction, errorMsg: e});
    }
}

function* sagaEffects() {
    yield all([
        fork(appointmentsChannel),
        fork(addToCalenderHandler),
        fork(fetchCurrentAppointments),
        fork(fetchPastAppointments)
    ]);
}


function* addToCalenderHandler() {
    while (true) {
        const {payload} = yield take(APPOINTMENTS_ADD_TO_CALENDER);
        try {
            const eventInfo = yield call(AddCalendarEvent.presentEventCreatingDialog, payload);

            if (eventInfo.action === 'SAVED') {
                yield call(AuthStore.setCalendarEvent, payload.appointmentId);
                AlertUtil.showSuccessMessage('Appointment Successfully saved in calendar.');
                yield put({type: APPOINTMENTS_FETCH});
            }
        } catch (error) {
            AlertUtil.showErrorMessage('Permission not granted.');
            console.log(error);
        }

    }
}

export default function* appointmentSaga() {
    while (true) {
        const sagas = yield fork(sagaEffects);
        yield take(PROVIDER_LOGOUT);
        yield cancel(sagas);
    }
}
