import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from "../constants/ApiEndpoints";

export default class ScheduleService {

    static getAllProviderServices() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_PROVIDER_SERVICES);
    }

    static updateProviderServiceStatus(serviceId, active) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_SERVICE_STATUS, null, null, null, {
            serviceId,
            active
        });
    }

    static addNewService(addServiceRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.ADD_NEW_SERVICE, null, null, null, addServiceRequest);
    }

    static updateService(updateServiceRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_SERVICE, null, null, null, updateServiceRequest);
    }

    static deleteService(serviceId) {
        return HttpClient.getInstance().request(ApiEndpoints.DELETE_SERVICE, {serviceId}, null, null, null);
    }

    static getProviderServiceTypes() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PROVIDER_SERVICE_TYPE);
    }

    static getServiceRecapPoints(serviceId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_SERVICE_RECAP_POINTS,{serviceId});
    }
    static getPostAppointmentPathways() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_POST_APPOINTMENT_PATHWAYS);
    }

    static getPastAppointments(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.COMPLETED_APPOINTMENTS, {userId});
    }

    static addAppointmentNotes(appointmentId, payLoad) {
        return HttpClient.getInstance().request(ApiEndpoints.ADD_APPOINTMENT_NOTES, {appointmentId}, null, null, payLoad);
    }

    static getWeeklySchedule(weekScheduleFetchRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_WEEKLY_SCHEDULE, null, null, null, weekScheduleFetchRequest);
    }

    static updateSlotByDate(payLoad) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_SLOT_BY_DATE, null, null, null, payLoad);
    }

    static addSlotByDate(payLoad) {
        return HttpClient.getInstance().request(ApiEndpoints.ADD_SLOT_BY_DATE, null, null, null, payLoad);
    }

    static removeSlotByDate(payLoad) {
        return HttpClient.getInstance().request(ApiEndpoints.REMOVE_SLOT_BY_DATE, null, null, null, payLoad);
    }

    static removeAllSlotsByWeek(payLoad) {
        return HttpClient.getInstance().request(ApiEndpoints.REMOVE_ALL_SLOT_BY_WEEK, null, null, null, payLoad);
    }

    static saveSupervisorNotes(payload,appointmentId){
        return HttpClient.getInstance().request(
            ApiEndpoints.ADD_SUPERVISOR_NOTES,
            {appointmentId},
            null,
            null,
            payload,
        );
    }
}


