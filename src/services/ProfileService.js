import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from "../constants/ApiEndpoints";

export default class ProfileService {

    static getProfile(){
        return HttpClient.getInstance().request(ApiEndpoints.PROVIDER_PROFILE);
    }

    static getConnections() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONNECTIONS);
    }

    static getSpecificConnection(userId, channelUrl) {
        let query = null;
        if(channelUrl) {
            query = {channelUrl};
        }
        return HttpClient.getInstance().request(ApiEndpoints.GET_SPECIFIC_CONNECTION, {userId}, query);
    }

    static disconnectMember(memberId) {
        return HttpClient.getInstance().request(ApiEndpoints.DISCONNECT_MEMBER, {memberId}, null, null, {});
    }

    static inviteMember(invitationParams) {
        return HttpClient.getInstance().request(ApiEndpoints.INVITE_MEMBER, null, null, null, invitationParams);
    }

    static inviteProvider(invitationParams) {
        return HttpClient.getInstance().request(ApiEndpoints.INVITE_PROVIDER, null, null, null, invitationParams);
    }
    static getPendingConnections() {
        return HttpClient.getInstance().request(ApiEndpoints.PENDING_CONNECTIONS, null, null, null, null);
    }
    static processPendingConnections(params) {
        return HttpClient.getInstance().request(ApiEndpoints.PROCESS_PENDING_CONNECTIONS, null, null, null, params);
    }

    static getUserActivity(userId, pageNumber =0 , pageSize = 3 ) {
        let query = null;
        if(pageNumber!==undefined && pageSize!==undefined) {
            query = {
                pageNumber, pageSize
            }
        }
        return HttpClient.getInstance().request(ApiEndpoints.USER_ACTIVITY, {userId}, query, null , null);
    }

    static getMarkedEducationalContent(markType) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_MARKED_EDUCATIONAL_CONTENT, null, {type: markType}, null , null);
    }

    static bookMarkEducationalContent(slug, isMark) {
        return HttpClient.getInstance().request(ApiEndpoints.BOOKMARK_EDUCATIONAL_CONTENT, {slug}, {mark: isMark}, null, null);
    }

    static searchProviderByCode(code) {
        return HttpClient.getInstance().request(ApiEndpoints.SEARCH_PROVIDER_BY_CODE, null, {code});
    }

    static connectWithUser(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.CONNECT, {userId}, null, null, {});
    }

    static getProviderProfile(providerId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PROVIDER_PROFILE, {providerId}, null, null, null);
    }
    static matchmakerAutoConnectionOnOff(providerId, matchmakerAutoConnectionRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.MATCHMAKER_AUTO_CONNECTION_ON_OFF, {providerId}, null, null, matchmakerAutoConnectionRequest);
    }
    static getSlugAssignedTo(slug) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_SLUG_ASSIGNED_TO, {slug}, null, null, null);
    }

    static getAssignedSlugs(connectionId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_ASSIGNED_SLUGS, {connectionId}, null, null, null);
    }

    static getContentAssignedByMe(connectionId, pageNumber, pageSize) {
        let query = null;
        if(pageNumber!==undefined && pageSize!==undefined) {
            query = {
                pageNumber, pageSize
            }
        }
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONTENT_ASSIGNED_BY_ME, {connectionId}, query, null, null);
    }

    static shareContentWithMember(params) {
        return HttpClient.getInstance().request(ApiEndpoints.SHARE_CONTENT, null, null, null, params);
    }

    static updateProfile(requestBody) {
        return HttpClient.getInstance().request(
            ApiEndpoints.UPDATE_PROFILE,
            null,
            null,
            null,
            requestBody,
            true,
            null,
            'profile'
        );
    }

    static getOutcomeDetail(contextId, dctId ) {
        return HttpClient.getInstance().request(
            ApiEndpoints.OUTCOME_DETAIL,
            {
                contextId,
                dctId,
            },
            null,
            null,
            null,
        );
    }

    static getDCTDetails(userId, dctId, pageNumber = 0, pageSize = 3) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DCT_REPORT_VIEW,
            {userId},
            {dctId: dctId, pageNumber: pageNumber, pageSize: pageSize},
            null,
            null,
        );
    }

    static getProviderFeedbackSummary(providerId, limit=3) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_FEEDBACK_SUMMARY,
            {providerId},
            {limit},
            null,
            null,
        );
    }


    static getProviderFeedback(providerId, currentPage) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_FEEDBACK,
            null,
            {
                providerId,
                pageNumber: currentPage
            },
            null,
            null,
        );
    }

    static async createGroup(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.CREATE_GROUP,
            null,
            null,
            null,
            payload,
            true,
            null,
            'group'
        );
    }


    static async suggestConnection(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.SUGGEST_CONNECTION_REQUEST,
            null,
            null,
            null,
            payload,
            null,
            null,
            null
        );
    }




    static async updateGroup(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.UPDATE_GROUP,
            null,
            null,
            null,
            payload,
            true,
            null,
            'group'
        );
    }

    static async addGroupMembers(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.ADD_GROUP_MEMBERS,
            null,
            null,
            null,
            payload
        );
    }

    static async removeMember(channelUrl,userId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.REMOVE_GROUP_MEMBER,
            {channelUrl, userId}
        );
    }


    static async deleteGroup(channelUrl) {
        return HttpClient.getInstance().request(ApiEndpoints.DELETE_GROUP, {
            channelUrl,
        });
    }



    static async getGroupDetails(channelUrl){
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_GROUP_DETAILS,
            {channelUrl},
            null,
            null,
            null,
            null,
            null,
            null,
        );
    }

    static async startOrJoinGroupCall(channelUrl) {
        return HttpClient.getInstance().request(
            ApiEndpoints.START_OR_JOIN_GROUP_CALL,
            {channelUrl},
            null,
            null,
            null,
            null,
            null,
            null,
        );
    }

    static getConnectionsByUserID(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONNECTIONS_BY_USER_ID,{userId},null,null,null,null,null,null);
    }

    static getCareTeam(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CARE_TEAM,{userId},null,null,null,null,null,null);
    }

    static getCompletedArticlesByMember(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_COMPLETED_ARTICLES_BY_MEMBER,{userId},null,null,null,null,null,null);
    }


 static getConnectionsByUserIDForAppointment(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CONNECTIONS_BY_USER_ID_FOR_APPOINTMENT,{userId},null,null,null,null,null,null);
    }


    static updateGroupRules(rules, groupId) {
        return HttpClient.getInstance().request(ApiEndpoints.SAVE_GROUP_RULE_SETTINGS,{groupId},null,null,rules,null,null,null);
    }

    static updateGroupDonations(settings, groupId) {
        return HttpClient.getInstance().request(ApiEndpoints.SAVE_GROUP_DONATION_SETTINGS,{groupId},null,null,settings,null,null,null);
    }

    static async sendAttachment(attachment) {
        return HttpClient.getInstance().request(
            ApiEndpoints.SEND_ATTACHMENT,
            null,
            null,
            null,
            attachment,
            true,
            null,
            "channel",
        );
    }

    static updateGroupAnonymity(updateGroupAnonymityRequest, groupId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.UPDATE_GROUP_ANONYMITY,
            {groupId},
            null,
            null,
            updateGroupAnonymityRequest,
            null,
            null,
            null);
    }

    static changeGroupType(groupId,publicGroup) {
        return HttpClient.getInstance().request(
            ApiEndpoints.UPDATE_GROUP_TYPE,
            {groupId},
            null,
            null,
            publicGroup);
    }

    static getUserGroups(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.USER_GROUPS, {userId}, null, null, null);
    }


    static getUserHistory(patientId) {
        return HttpClient.getInstance().request(ApiEndpoints.PATIENT_HISTORY, null, {patientId}, null, null);
    }


    static getUserAssociatedTags(patientId) {
        return HttpClient.getInstance().request(ApiEndpoints.PATIENT_ASSOCIATED_TAGS, null, {patientId}, null, null);
    }


    static getUserAssociatedTagDetails(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_ASSOCIATED_TAG_DETAIL, null, payload, null, null);
    }

    static getUserGroupDetails(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.GROUP_SESSION_DETAILS, null, payload, null, null);
    }

    static getUserChatbotDetails(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.CHATBOT_DETAILS, {userId}, null, null, null);
    }

    static async getAllGroups(userId, isPublic) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ALL_GROUPS,
            {userId},
            {isPublic},
            null,
            null,
            null,
            null,
            null,
        );
    }

    static updateProviderOperatingStates(providerOperatingStates) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_OPERATING_STATES, null, null, null, providerOperatingStates);
    }
    static updateChatStatus(connectionId, inActiveChat) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_CHAT_STATUS, {connectionId}, {inActiveChat}, null, null);
    }
    static getContactNotes(patientId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_CONTACT_NOTES, {patientId}, null, null, null);
    }
    static async addPatientContactNotes(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.ADD_PATIENT_CONTACT_NOTES,
            null,
            null,
            null,
            payload,
            null,
            null,
            null
        );
    }
    static async updatePatientContactNotes(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.UPDATE_PATIENT_CONTACT_NOTES,
            null,
            null,
            null,
            payload,
            null,
            null,
            null
        );
    }
    static async removePatientContactNotes(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.REMOVE_PATIENT_CONTACT_NOTES,
            null,
            null,
            null,
            payload
        );
    }

    static updateLevelOfEngagement(connectionId, engagementLevelId) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_LEVEL_OF_ENGAGEMENT,
            {connectionId,engagementLevelId},
            null, null, null);
    }

}
