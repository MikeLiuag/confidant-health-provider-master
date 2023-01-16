import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from "../constants/ApiEndpoints";

export default class ActivityFeedService {

    static getUserActivityFeed(pageNumber=0) {
        return HttpClient.getInstance().request(ApiEndpoints.USER_ACTIVITY_FEED, null, {pageNumber});
    }
    static getUserActivityFeedRecaps() {
        return HttpClient.getInstance().request(ApiEndpoints.USER_ACTIVITY_FEED_RECAPS, null);
    }

    static getEducationActivityDetails(timestamp,recapPeriod) {
        return HttpClient.getInstance().request(ApiEndpoints.EDUCATION_ACTIVITY_DETAIL, null,{timestamp,recapPeriod});
    }
    static getMemberConversationFeed(userId,timestamp,recapPeriod) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_MEMBER_CONVERSATION_FEED,{userId},{timestamp,recapPeriod},{});
    }

    static getConversationFeed(timestamp,recapPeriod) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONVERSATION_FEED,null,{timestamp,recapPeriod});
    }

    static getAppointmentFeed( timestamp,recapPeriod,type ) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_APPOINTMENT_FEED, null, {timestamp,recapPeriod,type});
    }

    static getConversationFeedResponses(contextId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONVERSATION_FEED_RESPONSES,{contextId},null,{});
    }

    static getMemberAppointmentFeed(memberId, timestamp, type,recapPeriod) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_MEMBER_APPOINTMENT_FEED,{memberId},{timestamp,type,recapPeriod},{});
    }


    static getAppointmentDetailFeed(appointmentId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_APPOINTMENT_DETAIL_FEED,{appointmentId},null,{});
    }





}
