import {PROVIDER_LOGOUT} from "../auth/actions";
import {
    SETTINGS_ADD_NEW_SERVICE_FAILED,
    SETTINGS_APPOINTMENTS_FETCHED,
    SETTINGS_APPOINTMENTS_NO_SCHEDULE,
    SETTINGS_APPTS_ADD_SLOTS,
    SETTINGS_APPTS_CHANGE_TIMEZONE, SETTINGS_APPTS_DELETE_SLOT, SETTINGS_APPTS_SET_LOADER,
    SETTINGS_APPTS_TOGGLE_SLOT, SETTINGS_APPTS_UPDATE_SCHEDULE, SETTINGS_APPTS_UPDATE_SCHEDULE_FAILED,
    SETTINGS_APPTS_UPDATE_SLOT, SETTINGS_DELETE_SERVICE, SETTINGS_DELETE_SERVICE_FAILED,
    SETTINGS_GET_APPOINTMENTS,
    SETTINGS_GET_SERVICES, SETTINGS_SERVICE_HANDLER,
    SETTINGS_SERVICES_FETCHED,
    SETTINGS_SERVICES_FETCHED_FAILED,
    SETTINGS_SERVICES_FETCHED_FAILED_NO_ACCESS, SETTINGS_UPDATE_SERVICE_FAILED
} from "./actions";
import moment from "moment-timezone";

export const DEFAULT = {
    isLoading: false,
    appointments: {},
    previousSchedule: {},
    providerDefaultServices: {},
    providerCustomServices: {},
    error: false,
    errorMsg: null,
    hasAccess: false,
};

export default function settingsReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case SETTINGS_GET_APPOINTMENTS: {
            return {
                ...state,
                isLoading: true
            };
        }
        case SETTINGS_GET_SERVICES: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case SETTINGS_APPOINTMENTS_FETCHED: {
            return {
                ...state,
                appointments: payload.appointments,
                previousSchedule: JSON.parse(JSON.stringify(payload.appointments)),
                isLoading: false
            };
        }
        case SETTINGS_APPOINTMENTS_NO_SCHEDULE: {
            return {
                ...state,
                isLoading: false,
                appointments: {},
                previousSchedule: {}
            };
        }

        case SETTINGS_APPTS_UPDATE_SCHEDULE_FAILED: {
            return {
                ...state,
                isLoading: false,
                appointments: JSON.parse(JSON.stringify(state.previousSchedule))
            };
        }
        case SETTINGS_APPTS_UPDATE_SLOT: {
            const {appointments} = state;
            let horizon;
            if (payload.isBusiness) {
                horizon = appointments.planningHorizon;
            } else {
                horizon = appointments.blockingHorizon;
            }
            if (horizon[payload.day]) {
                if(payload?.selectedSlot) {
                    const index = horizon[payload.day].availability.findIndex(availableSlot => (availableSlot.start === payload.selectedSlot.start && availableSlot.end === payload.selectedSlot.end));
                    if (index > -1) {
                        horizon[payload.day].availability[index] = payload.slot;
                    }
                }else {
                    horizon[payload.day].availability = [payload.slot];
                    horizon[payload.day].active = payload.active;
                }
            } else {
                horizon[payload.day] = {
                    active: payload.active,
                    availability: [payload.slot]
                };
            }
            return {
                ...state,
                appointments
            };
        }
        case SETTINGS_APPTS_TOGGLE_SLOT: {
            const {appointments} = state;
            let horizon;
            if (payload.isBusiness) {
                horizon = appointments.planningHorizon;
            } else {
                horizon = appointments.blockingHorizon;
            }
            if (horizon[payload.day]) {
                horizon[payload.day].active = payload.active;
            }
            return {
                ...state,
                appointments
            };
        }
        case SETTINGS_APPTS_CHANGE_TIMEZONE: {
            if (payload.prevZone === payload.newZone) {
                return state;
            } else {
                const {appointments} = state;
                appointments.timezone = payload.newZone;
                return {
                    ...state,
                    appointments
                };
            }
        }
        case SETTINGS_APPTS_ADD_SLOTS: {
            const {appointments} = state;
            let horizon;
            if (payload.isBusiness) {
                horizon = appointments.planningHorizon;
                if(!horizon) {
                    horizon = {};
                    appointments.planningHorizon = horizon;
                }
            } else {
                horizon = appointments.blockingHorizon;
                if(!horizon) {
                    horizon = {};
                    appointments.blockingHorizon = horizon;
                }
            }
            payload.days.forEach(day => {
                if(horizon[day]) {
                    horizon[day] = {
                        active: true,
                        availability: [...horizon[day].availability, payload.slot]
                    }
                }else{
                    horizon[day] = {
                        active: true,
                        availability: [payload?.slot]
                    }
                }
            });
            return {
                ...state,
                appointments
            };
        }

        case SETTINGS_APPTS_UPDATE_SCHEDULE: {
            const {appointments} = state;
            if(!appointments.timezone) {
                appointments.timezone = moment.tz.guess();
            }
            return {
                ...state,
                appointments,
                isLoading: true
            };
        }
        case SETTINGS_SERVICES_FETCHED_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            }

        }

        case SETTINGS_SERVICES_FETCHED_FAILED_NO_ACCESS: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
                hasAccess: payload.hasAccess,

            }
        }
        case SETTINGS_SERVICES_FETCHED: {
            return {
                ...state,
                isLoading: false,
                error: false,
                errorMsg: null,
                providerDefaultServices: payload.providerDefaultServices ? payload.providerDefaultServices : [],
                providerCustomServices: payload.providerCustomServices ? payload.providerCustomServices : [],
                hasAccess: payload.hasAccess,
            }
        }

        case SETTINGS_SERVICE_HANDLER: {
            return {
                ...state,
                isLoading: true,
            }
        }

        case SETTINGS_DELETE_SERVICE: {
            return {
                ...state,
                isLoading: true,
            }
        }

        case SETTINGS_ADD_NEW_SERVICE_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            }
        }

        case SETTINGS_UPDATE_SERVICE_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,

            }
        }
        case SETTINGS_DELETE_SERVICE_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            }
        }
        case SETTINGS_APPTS_DELETE_SLOT: {
            const {appointments} = state;
            let horizon;
            if (payload.isBusiness) {
                horizon = appointments.planningHorizon;
            } else {
                horizon = appointments.blockingHorizon;
            }
            if (horizon[payload.day]) {
                if(payload?.slot) {
                    const index = horizon[payload.day].availability.findIndex(availableSlot => (availableSlot.start === payload.slot.start && availableSlot.end === payload.slot.end));
                    if (index > -1) {
                        horizon[payload.day].availability.splice(index, 1);
                    }
                }else{
                    delete horizon[payload.day];
                }
            }
            return {
                ...state,
                appointments
            };
        }
        case SETTINGS_APPTS_SET_LOADER: {
            return {
                ...state,
                isLoading: payload.isLoading
            }
        }
        case PROVIDER_LOGOUT: {
            return DEFAULT;
        }
        default: {
            return state;
        }
    }
}
