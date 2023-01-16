import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from './../constants/ApiEndpoints'

export default class ConversationService {

    static async getChannelUrl(connectionId) {
        if(!connectionId) {
            console.error('No Connection Id');
        }
        return HttpClient.getInstance().request(ApiEndpoints.GET_CHANNEL_URL, {connectionId}, null, null, null);
    }


    static async getConversations() {
        return HttpClient.getInstance().request(
            ApiEndpoints.CONVERSATION_LIST,
            null,
            null,
            null,
            null,
        );
    }

    static async getAssignedPlanItems(userId) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_ASSIGNED_PLAN, null, {userId});
    }

    static async addItemsToPlan(request) {
        return HttpClient.getInstance().request(ApiEndpoints.ADD_ITEMS_TO_PLAN, null, null, null, request);
    }

    static async getPlanItemsList() {
        const searchQuery = '';
        const pageNumber = 0
        const pageSize = 10000
        const orderBy = ''
        const sortBy = []
        const queryParams = {searchQuery, pageNumber, pageSize, orderBy, sortBy};
        return new HttpClient().request(ApiEndpoints.GET_PLAN_ITEMS, null, queryParams);
    }

    static async assignConversation(conversationId, organizationId, patientUserId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.SELF_ASSIGN_CONVERSATION,
            null,
            null,
            null,
            {
                conversationId,
                organizationId,
                patientUserId
            },
        );
    }

    static async getAssociatedTagsList(patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ASSOCIATED_TAGS_LIST,
            null,
            {patientId},
            null,
            null,
        );
    }

    static async getDomainTypes() {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ASSOCIATED_TAGS_LIST,
            null,
            null,
            null,
            null,
        );
    }

    static async getDomainGroupsByTypeId(typeId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DOMAIN_GROUPS_BY_TYPE_ID,
            {typeId},
            null,
            null,
            null,
        );
    }

    static async getDomainElementAssociationByPatient(type, patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ASSIGNED_DOMAIN_ELEMENTS_BY_PATIENT,
            {type},
            {patientId},
            null,
            null,
        );
    }
    static async getDomainElementsByTypeId(typeId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DOMAIN_ELEMENTS_BY_TYPE_ID,
            {typeId},
            null,
            null,
            null,
        );
    }

    static async getDomainLookups() {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DOMAIN_LOOKUPS,
            null,
            null,
            null,
            null,
        );
    }

    static async getTagAssociationDetail(associatedTagId,patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ASSOCIATED_TAG_DETAIL,
            null,
            {associatedTagId,patientId},
            null,
            null,
        );
    }

    static async getDomainElementById(domainElementId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DOMAIN_ELEMENT_BY_ID,
            {domainElementId},
            null,
            null,
            null,
        );
    }
    static async getDomainTypeById(domainTypeId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_DOMAIN_TYPE_BY_ID,
            {domainTypeId},
            null,
            null,
            null,
        );
    }

    static async associateDomainElement(payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.ASSOCIATE_DOMAIN_ELEMENT,
            null,
            null,
            null,
            payload,
        );
    }

    static async resolveAssociatedTag(associatedTagId, payload) {
        return HttpClient.getInstance().request(
            ApiEndpoints.RESOLVE_DOMAIN_ELEMENT,
            null,
            {associatedTagId},
            null,
            payload,
        );
    }

    static async getMedicalHistory(patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.FETCH_MEDICAL_HISTORY,
            null,
            {patientId},
            null,
            null,
        );
    }

    static async getBeforeAfterMedicalHistory(patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.FETCH_BEFORE_AFTER_MEDICAL_HISTORY,
            null,
            {patientId},
            null,
            null,
        );
    }

    static async getLevelOfEngagementsList(searchQuery, pageNumber, pageSize, orderBy, sortBy) {
        searchQuery = searchQuery ? searchQuery : ''
        pageNumber = pageNumber ? pageNumber : 0
        pageSize = pageSize ? pageSize : 10000
        orderBy = orderBy ? orderBy : ''
        sortBy = sortBy ? sortBy : []
        const queryParams = {searchQuery, pageNumber, pageSize, orderBy, sortBy};
        return new HttpClient().request(ApiEndpoints.GET_LEVEL_OF_ENGAGEMENTS, null, queryParams);
    }

    static async getComparedAssociatedTagsForPatient(patientId) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_COMPARED_ASSOCIATED_TAGS_LIST,
            null,
            {patientId},
            null,
            null,
        );
    }
}
