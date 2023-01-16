export const ApiEndpoints = {
    REFRESH_AUTH_TOKEN: {
        path: "/auth/token/refresh",
        method: "GET"
    },
    PROVIDER_LOGIN: {
        path: "/auth/login",
        method: "POST"
    },
    REMOVE_PLAYERID: {
        path: "/auth/removePlayer/{playerId}",
        method: "DELETE"
    },
    PROVIDER_PROFILE: {
        path: "/profile/provider",
        method: "GET"
    },
    GET_CONNECTIONS: {
        path: "/profile/connections",
        method: "GET"
    },
    GET_SPECIFIC_CONNECTION: {
        path: "/profile/connections/{userId}",
        method: "GET"
    },
    INVITE_MEMBER: {
        path: "/profile/invite/member",
        method: "POST"
    },
    INVITE_PROVIDER: {
        path: "/profile/invite/provider",
        method: "POST"
    },
    GET_MARKED_EDUCATIONAL_CONTENT: {
        path: "/profile/education/markedSlugs",
        method: "GET"
    },
    BOOKMARK_EDUCATIONAL_CONTENT: {
        path: "/profile/education/{slug}/bookmark",
        method: "POST",
    },
    DISCONNECT_MEMBER: {
        path: "/profile/connections/{memberId}/disconnect",
        method: "POST"
    },
    REGISTER_PLAYERID: {
        path: "/auth/player/{playerId}",
        method: "POST"
    },
    PENDING_CONNECTIONS: {
        path: "/profile/connections/pending",
        method: "GET"
    },
    PROCESS_PENDING_CONNECTIONS: {
        path: "/profile/connections/pending/process",
        method: "POST"
    },
    USER_ACTIVITY: {
        path: "/audit/getUserActivity/{userId}",
        method: "GET"
    },
    SEARCH_PROVIDER_BY_CODE: {
        path: "/profile/provider/searchByCode",
        method: "GET"
    },
    CONNECT: {
        path: "/profile/connections/{userId}/connect",
        method: "POST"
    },
    GET_PROVIDER_PROFILE: {
        path: "/profile/provider/{providerId}",
        method: "GET"
    },
    MATCHMAKER_AUTO_CONNECTION_ON_OFF: {
        path: "/profile/provider/{providerId}/autoConnection",
        method: "POST"
    },
    GET_CONTENT_ASSIGNED_BY_ME: {
        path: "/profile/education/{connectionId}/assignedByMe",
        method: "GET"
    },
    GET_ASSIGNED_SLUGS: {
        path: "/profile/education/{connectionId}/assignedSlugs",
        method: "GET"
    },
    SHARE_CONTENT: {
        path: "/profile/education/assign",
        method: "POST"
    },
    GET_CHANNEL_URL: {
        path: "/conversation/liveChat/{connectionId}/channelUrl",
        method: "GET"
    },
    GET_SLUG_ASSIGNED_TO: {
        path: "/profile/education/{slug}/assignedTo",
        method: "GET"
    },
    UPDATE_PROFILE: {
        path: "/profile/profile/update",
        method: "POST"
    },
    OUTCOME_DETAIL: {
        path: "/profile/profile/outcomeDetails/{contextId}/{dctId}",
        method: "GET"
    },
    GET_DCT_REPORT_VIEW: {
        path: "/profile/profile/dctDetails/{userId}",
        method: "GET"
    },
    CHANGE_PASSWORD: {
        path: '/auth/changePassword',
        method: 'POST'
    },
    GET_ALL_APPOINTMENTS: {
        path: '/scheduling/appointment/list',
        method: 'GET'
    },
    GET_ALL_APPOINTMENTS_V2: {
        path: '/scheduling/appointment/list/v2',
        method: 'POST'
    },
    GET_PROVIDER_SERVICES: {
        path: '/scheduling/appointment/services/{providerId}',
        method: 'GET',
    },
    GET_AVAILABLE_SLOTS: {
        path: '/scheduling/appointment/getAvailableSlots',
        method: 'POST'
    },
    REQUEST_APPOINTMENT_CHANGES: {
        path: '/scheduling/appointment/{appointmentId}/requestChanges',
        method: 'POST'
    },
    CONFIRM_APPOINTMENT: {
        path: '/scheduling/appointment/{appointmentId}/confirm',
        method: 'PUT'
    },
    CANCEL_APPOINTMENT: {
        path: '/scheduling/appointment/{appointmentId}/cancel',
        method: 'PUT'
    },
    GET_PROVIDER_SCHEDULE: {
        path: '/scheduling/schedule',
        method: 'GET',
    },
    UPDATE_PROVIDER_SCHEDULE: {
        path: '/scheduling/schedule',
        method: 'PUT',
    },
    GET_ALL_PROVIDER_SERVICES: {
        path: "/scheduling/schedule/providerService",
        method: "GET"
    },
    UPDATE_SERVICE_STATUS: {
        path: "/scheduling/schedule/updateProviderServiceStatus",
        method: "POST"
    },
    ADD_NEW_SERVICE: {
        path: '/scheduling/schedule/service',
        method: 'POST'
    },
    UPDATE_SERVICE: {
        path: '/scheduling/schedule/service',
        method: 'PUT'
    },
    GET_NOTIFICATION_SETTINGS: {
        path: "/profile/settings/notifications",
        method: "GET"
    },
    UPDATE_NOTIFICATION_SETTINGS: {
        path: "/profile/settings/notifications",
        method: "POST"
    },
    DELETE_SERVICE: {
        path: "/scheduling/schedule/deleteService/{serviceId}",
        method: "DELETE"
    },
    ARRIVE_FOR_APPOINTMENT: {
        path: "/scheduling/appointment/{appointmentId}/join",
        method: "POST"
    },
    COMPLETE_APPOINTMENT: {
        path: "/scheduling/appointment/complete/{appointmentId}",
        method: "POST"
    },
    GET_FEEDBACK_SUMMARY: {
        path: '/profile/telehealth/feedback/summary/{providerId}',
        method: 'GET',
    },
    GET_FEEDBACK: {
        path: '/profile/telehealth/feedback',
        method: 'GET',
    },
    SAVE_PROVIDER_FEEDBACK: {
        path: '/scheduling/appointment/providerFeedback',
        method: 'POST',
    },
    REQUEST_APPOINTMENT: {
        path: '/scheduling/appointment/request',
        method: 'POST'
    },
    CREATE_GROUP: {
        path: "/profile/group",
        method: "POST"
    },
    GET_GROUP_DETAILS: {
        path: "/profile/group/{channelUrl}",
        method: "GET"
    },
    ADD_GROUP_MEMBERS: {
        path: "/profile/group/members",
        method: "PUT"
    },
    UPDATE_GROUP: {
        path: "/profile/group",
        method: "PUT"
    },
    REMOVE_GROUP_MEMBER: {
        path: "/profile/group/{channelUrl}/{userId}/leave",
        method: "POST"
    },

    DELETE_GROUP: {
        path: "/profile/group/{channelUrl}/delete",
        method: "DELETE"
    },

    CONVERSATION_LIST: {
        path: '/conversation/conversation/list',
        method: 'GET',
    },
    GET_ASSIGNED_PLAN: {
        path: '/conversation/revamp/assignedPlan',
        method: 'GET',
    },
    ADD_ITEMS_TO_PLAN: {
        path: '/conversation/revamp/assignedPlan',
        method: 'POST',
    },
    GET_PLAN_ITEMS: {
        path: "/conversation/revamp/revampPlanItems",
        method: "GET"
    },
    SELF_ASSIGN_CONVERSATION: {
        path: '/conversation/conversation/assign',
        method: 'POST',
    },
    USER_ACTIVITY_FEED: {
        path: "/audit/activityFeed/realtimeActivityFeed",
        method: "GET"
    },
    USER_ACTIVITY_FEED_RECAPS: {
        path: "/audit/activityFeed/activityRecap",
        method: "GET"
    },
    EDUCATION_ACTIVITY_DETAIL: {
        path: "/audit/activityFeed/educationActivityDetails",
        method: "GET"
    },

    GET_MEMBER_CONVERSATION_FEED: {
        path: "/audit/activityFeed/{userId}/conversations",
        method: "GET"
    },

    GET_CONVERSATION_FEED: {
        path: "/audit/activityFeed/conversations",
        method: "GET"
    },
    GET_APPOINTMENT_FEED: {
        path: "/audit/activityFeed/appointmentActivityDetails",
        method: "GET"
    },

    GET_CONVERSATION_FEED_RESPONSES: {
        path: "/conversation/activityFeed/responses/{contextId}",
        method: "GET"
    },

    GET_MEMBER_APPOINTMENT_FEED: {
        path: "/audit/activityFeed/{memberId}/appointments",
        method: "GET"
    },

    GET_APPOINTMENT_DETAIL_FEED: {
        path: "/audit/activityFeed/{appointmentId}/detail",
        method: "GET"
    },

    USER_ACCOUNT_RECOVERY: {
        path: '/auth/recoverAccount',
        method: 'POST',
    },

    VERIFY_CONFIRMATION_CODE: {
        path: '/auth/verificationCode',
        method: 'POST',
    },

    UPDATE_PASSWORD: {
        path: '/auth/recoverAccount/setup/newPassword',
        method: 'POST',
    },

    RESEND_VERIFICATION_CODE: {
        path: '/auth/resend/verificationCode',
        method: 'POST',
    },
    START_OR_JOIN_GROUP_CALL: {
        path: "/profile/group/{channelUrl}/startOrJoinCall",
        method: "POST"
    },

    GET_CONNECTIONS_BY_USER_ID: {
        path: "/profile/connections/activeConnectionList/{userId}",
        method: "GET"
    },
    GET_CARE_TEAM: {
        path: "/profile/connections/careTeam/{userId}",
        method: "GET"
    },
    GET_COMPLETED_ARTICLES_BY_MEMBER: {
        path: '/profile/education/completed/{userId}',
        method: 'GET',
    },
    GET_CONNECTIONS_BY_USER_ID_FOR_APPOINTMENT: {
        path: "/profile/connections/list/{userId}",
        method: "GET"
    },

    GET_MUTUAL_AVAILABLE_SLOTS: {
        path: '/scheduling/appointment/getMutualAvailableSlots',
        method: 'POST'
    },

    REQUEST_MUTUAL_APPOINTMENT: {
        path: '/scheduling/appointment/mutual/request',
        method: 'POST'
    },
    SUGGEST_CONNECTION_REQUEST: {
        path: '/profile/connections/suggestConnection',
        method: 'POST'
    },
    SAVE_GROUP_RULE_SETTINGS: {
        path: '/profile/group/rules/{groupId}',
        method: 'PUT'
    },
    SAVE_GROUP_DONATION_SETTINGS: {
        path: '/profile/group/donations/{groupId}',
        method: 'PUT'
    },
    SEND_ATTACHMENT: {
        path: "/profile/media/chat/sendAttachment",
        method: "POST"
    },
    ONBOARD_STRIPE_CONNECT: {
        path: "/billing/connect/onboard",
        method: "GET"
    },
    GET_STRIPE_CONNECT_DETAILS: {
        path: "/billing/connect/details",
        method: "GET"
    },
    UPDATE_GROUP_ANONYMITY: {
        path: "/profile/group/{groupId}/anonymity",
        method: "POST"
    },
    UPDATE_GROUP_TYPE: {
        path: "/profile/group/type/{groupId}",
        method: "PUT"
    },
    GET_PROVIDER_SERVICE_TYPE: {
        path: "/scheduling/schedule/providerServiceTypes",
        method: "GET"
    },
    GET_SERVICE_RECAP_POINTS:{
        path: "/scheduling/schedule/recaps/{serviceId}",
        method: "GET"
    },
    GET_POST_APPOINTMENT_PATHWAYS:{
        path: "/scheduling/schedule/postAppointmentPathways",
        method: "GET"
    },
    GET_ASSOCIATED_TAGS_LIST: {
        path: "/conversation/builder/postapp/associatedTags",
        method: "GET"
    },
    GET_ASSOCIATED_TAG_DETAIL: {
        path: "/conversation/builder/postapp/associatedTag",
        method: "GET"
    },
    GET_DOMAIN_GROUPS_BY_TYPE_ID: {
        path: "/conversation/builder/domainGroups/name/{typeId}",
        method: "GET"
    },
    GET_ASSIGNED_DOMAIN_ELEMENTS_BY_PATIENT: {
        path: "/conversation/builder/postapp/associatedTags/{type}",
        method: "GET"
    },
    GET_DOMAIN_ELEMENTS_BY_TYPE_ID: {
        path: "/conversation/builder/domainElements/byType/{typeId}",
        method: "GET"
    },
    GET_DOMAIN_LOOKUPS: {
        path: "/conversation/builder/domain/lookup",
        method: "GET"
    },
    GET_DOMAIN_ELEMENT_BY_ID: {
        path: "/conversation/builder/domainElement/{domainElementId}",
        method: "GET"
    },
    GET_DOMAIN_TYPE_BY_ID: {
        path: "/conversation/builder/domainType/{domainTypeId}",
        method: "GET"
    },
    ASSOCIATE_DOMAIN_ELEMENT: {
        path: "/conversation/builder/postapp/associatedTag",
        method: "POST"
    },
    RESOLVE_DOMAIN_ELEMENT: {
        path: "/conversation/builder/postapp/associatedTag",
        method: "PUT"
    },
    FETCH_MEDICAL_HISTORY: {
        path: "/conversation/builder/postapp/associatedTag/history",
        method: "GET"
    },
    GET_PAST_APPOINTMENTS: {
        path: '/scheduling/schedule',
        method: 'GET',
    },

    COMPLETED_APPOINTMENTS: {
        path: '/scheduling/appointment/past/{userId}',
        method: 'GET',
    },

    USER_GROUPS: {
        path: '/profile/groups/joined/{userId}',
        method: 'GET',
    },

    GROUP_SESSION_DETAILS: {
        path: '/profile/group/sessionHistory',
        method: 'GET',
    },

    CHATBOT_DETAILS: {
        path: '/conversation/chatbots/{userId}',
        method: 'GET',
    },

    PATIENT_HISTORY: {
        path: '/conversation/builder/postapp/associatedTag/history',
        method: 'GET',
    },
    PATIENT_ASSOCIATED_TAGS: {
        path: "/conversation/builder/postapp/associatedTags",
        method: "GET"
    },

    GET_PATIENT_ASSOCIATED_TAG_DETAIL: {
        path: "/conversation/builder/postapp/associatedTag",
        method: "GET"
    },

    ADD_APPOINTMENT_NOTES: {
        path: "/scheduling/appointment/addNote/{appointmentId}",
        method: "POST"
    },
    GET_MASTER_SCHEDULE: {
        path: '/scheduling/appointment/masterSchedule',
        method: 'POST'
    },
    GET_ALL_GROUPS: {
        path: "/profile/groups/all/{userId}",
        method: 'GET'
    },

    GET_WEEKLY_SCHEDULE : {
        path: '/scheduling/schedule/week',
        method: 'POST'
    },

    UPDATE_SLOT_BY_DATE : {
        path: '/scheduling/schedule/slot/change',
        method: 'PUT'
    },
    REMOVE_SLOT_BY_DATE : {
        path: '/scheduling/schedule/slot/remove',
        method: 'PUT'
    },
    ADD_SLOT_BY_DATE : {
        path: '/scheduling/schedule/slot/add',
        method: 'POST'
    },
    REMOVE_ALL_SLOT_BY_WEEK : {
        path: '/scheduling/schedule/slot/removeAll',
        method: 'POST'
    },
    UPDATE_OPERATING_STATES: {
        path: '/profile/provider/operatingStates',
        method: 'PUT'
    },
    UPDATE_CHAT_STATUS: {
        path: "/profile/connections/updateChatStatus/{connectionId}",
        method: "PUT"
    },
    ADD_SUPERVISOR_NOTES: {
        path: "/scheduling/appointment/{appointmentId}/supervisorNotes",
        method: "PUT"
    },
    FETCH_BEFORE_AFTER_MEDICAL_HISTORY: {
        path: "/conversation/builder/postapp/associatedTag/histories",
        method: "GET"
    },
    GET_PATIENT_CONTACT_NOTES: {
        path: "/profile/profile/{patientId}/contactNotes",
        method: "GET"
    },
    ADD_PATIENT_CONTACT_NOTES: {
        path: "/profile/profile/contactNotes",
        method: "POST"
    },
    UPDATE_PATIENT_CONTACT_NOTES: {
        path: "/profile/profile/contactNotes",
        method: "PUT"
    },
    REMOVE_PATIENT_CONTACT_NOTES: {
        path: "/profile/profile/removeContactNotes",
        method: "POST"
    },
    UPDATE_LEVEL_OF_ENGAGEMENT: {
        path: "/profile/connections/updateLevelOfEngagement/{connectionId}/{engagementLevelId}",
        method: "PUT"
    },
    GET_LEVEL_OF_ENGAGEMENTS: {
        path: "/conversation/builder/levelOfEngagements",
        method: "GET"
    },
    GET_COMPARED_ASSOCIATED_TAGS_LIST: {
        path: "/conversation/builder/postapp/associatedTags/compared",
        method: "GET"
    },
};
