import {all, call, fork, put, take, select, cancel} from "redux-saga/effects";
import {
    SETTINGS_APPOINTMENTS_FETCHED,
    SETTINGS_APPOINTMENTS_NO_SCHEDULE,
    SETTINGS_GET_ALL,
    SETTINGS_GET_APPOINTMENTS,
    SETTINGS_APPTS_UPDATE_SLOT,
    SETTINGS_GET_SERVICES,
    SETTINGS_SERVICES_FETCHED_FAILED,
    SETTINGS_SERVICES_FETCHED,
    SETTINGS_SERVICES_FETCHED_FAILED_NO_ACCESS,
    SETTINGS_ADD_NEW_SERVICE_FAILED,
    SETTINGS_SERVICE_HANDLER,
    SETTINGS_DELETE_SERVICE,
    SETTINGS_UPDATE_SERVICE_FAILED,
    SETTINGS_DELETE_SERVICE_FAILED,
    SETTINGS_APPTS_CHANGE_TIMEZONE,
    SETTINGS_APPTS_UPDATE_SCHEDULE,
    SETTINGS_APPTS_SET_LOADER,
    SETTINGS_APPTS_TOGGLE_SLOT,
    SETTINGS_APPTS_ADD_SLOTS,
    SETTINGS_APPTS_DELETE_SLOT,
    SETTINGS_APPOINTMENTS_FETCH_FAILED, SETTINGS_APPTS_UPDATE_SCHEDULE_FAILED
} from "./actions";
import AppointmentService from "../../../services/AppointmentService";
import {ERROR_NOT_FOUND} from "../../../constants/CommonConstants";
import {AlertUtil} from "ch-mobile-shared";
import {APPOINTMENTS_FETCH_FAILED} from "../appointments/actions";
import ScheduleService from "../../../services/ScheduleService";
import {PROVIDER_LOGOUT} from "../auth/actions";

function* appointmentSettingsFetcher() {
    while (true) {
        yield take(SETTINGS_GET_APPOINTMENTS);
        const {userId} = yield select(state => state.auth.meta);
        let schedule = yield call(AppointmentService.getProviderSchedule,userId);
        if (!schedule.errors) {
            schedule = mergeAvailability(schedule);
            yield put({
                type: SETTINGS_APPOINTMENTS_FETCHED,
                payload: {
                    appointments: schedule
                }
            });
        } else {
            if (schedule.errors[0].errorCode === ERROR_NOT_FOUND) {
                yield put({
                    type: SETTINGS_APPOINTMENTS_NO_SCHEDULE,
                });
            } else {
                AlertUtil.showErrorMessage("Unable to fetch schedule for appointments");
                yield put({
                    type: SETTINGS_APPOINTMENTS_FETCH_FAILED,
                });
            }
        }
    }
}

function mergeAvailability(schedule) {
    if (schedule.planningHorizon) {
        schedule.planningHorizon = adjustHorizon(schedule.planningHorizon);
    }
    if (schedule.blockingHorizon) {
        schedule.blockingHorizon = adjustHorizon(schedule.blockingHorizon);
    }
    return schedule;
}

function adjustHorizon(horizons) {
    const newHorizons = {};
    horizons.forEach(horizon => {
        if (!newHorizons[horizon.day]) {
            newHorizons[horizon.day] = {
                active: horizon.active,
                availability: [horizon.availability[0]]
            };
        } else {
            newHorizons[horizon.day].availability.push(horizon.availability[0]);
        }
    });
    Object.keys(newHorizons).forEach(day => {
        const slots = newHorizons[day].availability;
        slots.sort((s1, s2) => {
            return s1.start - s2.start;
        });
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] && slots[i + 1]) {
                if (slots[i].end === slots[i + 1].start) {
                    const prev = slots[i];
                    const next = slots[i + 1];
                    slots.splice(i, 2);
                    slots.push({
                        start: prev.start,
                        end: next.end
                    })
                }
            }
            if (slots[i] && slots[i].start === slots[i].end) {
                slots.splice(i, 1);
            }
        }

        slots.sort((s1, s2) => {
            return s1.start - s2.start;
        });
        if(slots.length===0) {
            delete newHorizons[day];
        }
    });

    return newHorizons;
}

function* slotUpdater() {
    while (true) {
        yield take(SETTINGS_APPTS_UPDATE_SLOT);
        yield put({
            type: SETTINGS_APPTS_UPDATE_SCHEDULE
        });
    }
}

function* scheduleUpdater() {
    while (true) {
        yield take(SETTINGS_APPTS_UPDATE_SCHEDULE);
        try {
            let schedule = yield select(((state) => state.settings.appointments));
            let response = yield call(AppointmentService.updateProviderSchedule, schedule);
            if (response.errors) {
                const errorMessage = response.errors?.[0]?.endUserMessage?.includes("Requested slot changes can't be done as it's already exists in schedule.")
                    ? response.errors[0].endUserMessage : "Failed to update schedule, try again later";
                AlertUtil.showErrorMessage(errorMessage);
                yield put({
                    type: SETTINGS_APPTS_UPDATE_SCHEDULE_FAILED
                });
            } else {
                response = mergeAvailability(response);
                AlertUtil.showSuccessMessage("Schedule updated successfully");
                yield put({
                    type: SETTINGS_APPOINTMENTS_FETCHED,
                    payload: {
                        appointments: response
                    }
                });
            }
        } catch (e) {
            console.warn(e);
            AlertUtil.showErrorMessage("Failed to update schedule. Try again later");
            yield put({
                type: SETTINGS_APPTS_UPDATE_SCHEDULE_FAILED
            });
        }

    }
}

function* timezoneUpdater() {
    while (true) {
        yield take(SETTINGS_APPTS_CHANGE_TIMEZONE);
        yield put({
            type: SETTINGS_APPTS_UPDATE_SCHEDULE,
            payload: {
                timezoneChanged: true
            }
        })
    }
}

function* slotDeleteHandler() {
    while (true) {
        yield take(SETTINGS_APPTS_DELETE_SLOT);
        yield put({
            type: SETTINGS_APPTS_UPDATE_SCHEDULE,
        })
    }
}

function* slotToggleUpdater() {
    while (true) {
        yield take(SETTINGS_APPTS_TOGGLE_SLOT);
        yield put({
            type: SETTINGS_APPTS_UPDATE_SCHEDULE,
        })
    }
}

function* addSlotHandler() {
    while (true) {
        yield take(SETTINGS_APPTS_ADD_SLOTS);
        yield put({
            type: SETTINGS_APPTS_UPDATE_SCHEDULE,
        })
    }
}

function* allSettingsFetcher() {
    while (true) {
        yield take(SETTINGS_GET_ALL);
        yield put({
            type: SETTINGS_GET_APPOINTMENTS,
        });
        yield put({
            type: SETTINGS_GET_SERVICES,
        });

    }
}

function* servicesSettingFetcher() {
    while (true) {
        yield take(SETTINGS_GET_SERVICES);
        const services = yield call(ScheduleService.getAllProviderServices);
        if (!services.errors) {

            const data = services.map(service => {
                service.durationText = getDurationText(service.duration);
                return service;
            });
            const defaultServices = getFilteredResult(data, true);
            const customServices = getFilteredResult(data, false);

            yield put({
                type: SETTINGS_SERVICES_FETCHED,
                payload: {
                    hasAccess: true,
                    providerDefaultServices: defaultServices ? defaultServices : [],
                    providerCustomServices: customServices ? customServices : [],
                }

            });
        } else {
            if (services.errors[0].errorCode === 'FORBIDDEN') {
                AlertUtil.showErrorMessage(services.errors[0].endUserMessage)
                yield put({
                    type: SETTINGS_SERVICES_FETCHED_FAILED_NO_ACCESS,
                    payload: {
                        errorMsg: services.errors[0].endUserMessage,
                        hasAccess: false
                    }
                });

            } else if (services.errors[0].errorCode === 'VALIDATION_FAILURE') {
                AlertUtil.showErrorMessage(services.errors[0].endUserMessage)
                yield put({
                    type: SETTINGS_SERVICES_FETCHED_FAILED_NO_ACCESS,
                    payload: {
                        errorMsg: services.errors[0].endUserMessage,
                        hasAccess: false
                    }
                });

            } else {
                AlertUtil.showErrorMessage(services.errors[0].errorMsg)
                yield put({
                    type: SETTINGS_SERVICES_FETCHED_FAILED,
                    payload: {
                        errorMsg: services.errors[0].endUserMessage,
                    }
                });
            }

        }

    }
}

function* serviceHandler() {
    while (true) {
        const {payload} = yield take(SETTINGS_SERVICE_HANDLER);
        const shouldUpdate = payload.serviceRequest.shouldUpdate;
        const response = yield call(shouldUpdate ? ScheduleService.updateService : ScheduleService.addNewService, payload.serviceRequest);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            yield put({
                type: shouldUpdate ? SETTINGS_UPDATE_SERVICE_FAILED : SETTINGS_ADD_NEW_SERVICE_FAILED,
                payload: {
                    errorMsg: response.errors[0].endUserMessage
                }
            })
        } else {
            AlertUtil.showSuccessMessage(shouldUpdate ? "Service updated successfully" : "New service added successfully");
            yield put({
                type: SETTINGS_GET_SERVICES,
            });
            if (payload.serviceRequest.onSuccess) {
                payload.serviceRequest.onSuccess();
            }

        }

    }
}

function* deleteServiceHandler() {
    while (true) {
        const {payload} = yield take(SETTINGS_DELETE_SERVICE);
        const response = yield call(ScheduleService.deleteService, payload.serviceId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            yield put({
                type: SETTINGS_DELETE_SERVICE_FAILED,
                payload: {
                    errorMsg: response.errors[0].endUserMessage
                }
            })

        } else {
            AlertUtil.showSuccessMessage("Service deleted successfully");
            yield put({
                type: SETTINGS_GET_SERVICES,
            });
        }

    }
}

function getFilteredResult(data, status) {
    return data.filter(x => x.systemService === status);
}

function getDurationText(duration) {
    const minText = ' min';
    const hourText = ' Hour';
    if (duration < 60) {
        return duration + minText;
    }
    const hour = parseInt(duration / 60);
    const min = duration % 60;
    let text = hour + hourText;
    if (min > 0) {
        text = text + ' ' + min + minText;
    }
    return text;
}

function* tasks() {
    yield all([
        fork(appointmentSettingsFetcher),
        fork(allSettingsFetcher),
        fork(slotUpdater),
        fork(servicesSettingFetcher),
        fork(serviceHandler),
        fork(deleteServiceHandler),
        fork(scheduleUpdater),
        fork(slotToggleUpdater),
        fork(addSlotHandler),
        fork(slotDeleteHandler),
        fork(timezoneUpdater)
    ]);
}


export default function* settingsSaga() {
    while (true) {
        const tasksHandle = yield fork(tasks);
        yield take(PROVIDER_LOGOUT);
        yield cancel(tasksHandle);
    }
}
