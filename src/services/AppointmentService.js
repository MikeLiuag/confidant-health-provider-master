import {HttpClient} from 'ch-mobile-shared';
import {ApiEndpoints} from '../constants/ApiEndpoints';

export default class AppointmentService {

    static getAllAppointments() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_APPOINTMENTS);
    }

    static getAppointmentsV2(type='current', size=30, refDate,timezone,providerId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_APPOINTMENTS_V2, null, null,null,{type, size, refDate,timezone,providerId});
    }

    static getProviderServices(providerId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PROVIDER_SERVICES,{providerId});
    }

    static getAvailableSlots(participantId, serviceId, date, timeZone) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_AVAILABLE_SLOTS,null,null,null,{participantId,serviceId,date, timeZone});
    }

    static requestChanges(appointmentId, payload) {
        return HttpClient.getInstance().request(ApiEndpoints.REQUEST_APPOINTMENT_CHANGES,{appointmentId},null,null,payload);
    }


    static confirmAppointment(appointmentId) {
        return HttpClient.getInstance().request(ApiEndpoints.CONFIRM_APPOINTMENT,{appointmentId});
    }

    static cancelAppointment(appointmentId, reason) {
        return HttpClient.getInstance().request(ApiEndpoints.CANCEL_APPOINTMENT,{appointmentId},null,null, {reason});
    }

    static getProviderSchedule(providerId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PROVIDER_SCHEDULE,null,{providerId});
    }

    static updateProviderSchedule(schedule) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_PROVIDER_SCHEDULE, null,null,null,schedule);
    }
    static arriveForAppointment(appointmentId,Authorization){
        return HttpClient.getInstance().request(ApiEndpoints.ARRIVE_FOR_APPOINTMENT,{appointmentId},null,{Authorization});
    }
    static completeAppointment(appointmentId){
        return HttpClient.getInstance().request(ApiEndpoints.COMPLETE_APPOINTMENT,{appointmentId},null,null,null);
    }

    static saveProviderFeedback(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.SAVE_PROVIDER_FEEDBACK,null,null,null,payload);
    }


    static requestAppointment(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.REQUEST_APPOINTMENT,null,null,null,payload);
    }

    static getMutualAvailableSlots(date,memberId,providerId, serviceId,timeZone) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_MUTUAL_AVAILABLE_SLOTS,null,null,null,{date,memberId,providerId,serviceId,timeZone});
    }


    static requestMutualAppointment(appointmentRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.REQUEST_MUTUAL_APPOINTMENT,null,null,null,appointmentRequest);
    }

    static getMasterSchedule(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_MASTER_SCHEDULE,null,null,null,payload);
    }


}
