import { createAction } from "redux-actions";
export const GET_APPT_PARTICIPANT = 'connections/GET';

export const APPOINTMENTS_FETCH = 'appointments/FETCH';
export const APPOINTMENTS_FETCH_CURRENT = 'appointments/FETCH_CURRENT';
export const APPOINTMENTS_FETCH_PAST = 'appointments/FETCH_PAST';
export const APPOINTMENTS_CURRENT_FETCHED = 'appointments/CURRENT_FETCHED';
export const APPOINTMENTS_PAST_FETCHED = 'appointments/PAST_FETCHED';
export const APPOINTMENTS_FETCH_CURRENT_FAILED = 'appointments/FETCH_CURRENT_FAILED';
export const APPOINTMENTS_FETCH_PAST_FAILED = 'appointments/FETCH_PAST_FAILED';
export const APPOINTMENTS_FETCH_SILENT = 'appointments/FETCH_SILENT';
export const APPOINTMENTS_FETCHED = 'appointments/FETCHED';
export const APPOINTMENTS_FETCH_FAILED = 'appointments/FETCH_FAILED';
export const APPOINTMENTS_ADD_TO_CALENDER = 'appointments/ADD_TO_CALENDER';


export const appointmentsActionCreators = {
    fetchAppointments: createAction(APPOINTMENTS_FETCH),
    refreshAppointments: createAction(APPOINTMENTS_FETCH_SILENT),
    addToCalender: createAction(APPOINTMENTS_ADD_TO_CALENDER),
    fetchParticipant: createAction(GET_APPT_PARTICIPANT)
};
