import {Screens} from '../constants/Screens';
import LoginScreen from './login/Login.screen';
import ProfileScreen from './profile/Profile.screen';
import ChatListScreen from './chat/ChatList.screen';
import ConnectionsScreen from './connections/Connections.screen';
import AccountRecoveryScreen from './account-recovery/AccountRecovery.screen';
import LiveChatScreen from "./chat/LiveChat.screen";
import TopicListScreen from "./learning-library/TopicListScreen";
import ContentSharingScreen from "./learning-library/ContentSharing.screen";
import TopicContentListScreen from "./learning-library/TopicContentList.screen";
import MemberDetailScreen from "./chat/MemberDetail.screen";
import ProviderDetailScreen from "./chat/ProviderDetail.screen";
import EducationalContentPiece from "./educational-content/content-pieces/EducationalContentPiece"
import TelehealthWelcomeScreen from "./tele-session/TelehealthWelcome.screen";
import VideoCallScreen from "./tele-session/VideoCall.screen";
import WaitingRoomScreen from "./tele-session/WaitingRoom.screen";
import CompletedSessionScreen from "./tele-session/CompletedSession.screen";
import InvitationScreen from "./connections/Invitation.screen";
import PendingConnectionScreen from "./connections/PendingConnection.screen";
import ProviderSearchScreen from "./connections/ProviderSearch.screen";
import OutcomeDetailScreen from './outcome/OutcomeDetail.screen';
import ProgressReportScreen from './progress-report/ProgressReport.screen';
import DCTReportViewScreen from './progress-report/DCTReportView.screen';
import ProgressReportSeeAllScreen from './progress-report/ProgressReportSeeAll.screen';
import ShareContentScreen from './share-content/ShareContent.screen';
import AppointmentsScreen from './appointments/Appointments.screen';
import SettingsScreen from './settings/Settings.screen';
import ChangePasswordScreen from './settings/ChangePassword.screen'
import AppointmentDetailsScreen from './appointments/AppointmentDetails.screen';
import AppointmentSelectServiceScreen from './appointments/ApptSelectService.screen';
import AppointmentSelectDateTimeScreen from './appointments/ApptSelectDateTime.screen';
import AppointmentEditMessageScreen from './appointments/ApptEditMessage.screen';
import AppointmentSubmittedScreen from "./appointments/AppointmentSubmitted.screen";
import NotificationScreen from "./settings/Notification.screen";
import AddServiceScreen from './settings/AddService.screen';
import Support from './settings/info/Support.screen';
import About from './settings/info/About.screen';
import {createStackNavigator} from "react-navigation-stack";
import {TimeZoneSelectionScreen} from "./settings/appointments/TimeZoneSelection.screen";
import AppointmentSettingsScreen from "./settings/appointments/AppointmentSettings.screen";
import BusinessHourSelectionScreen from "./settings/appointments/BusinessHourSelection.screen";
import ConfirmationNumberScreen from './confirmation-number/ConfirmationNumber.screen';
import NewPasswordScreen from './new-password/NewPassword.screen';
import ServicesScreen from "./settings/Services.screen";
import SectionListScreen from "./learning-library/SectionList.screen";
import ReviewDetailScreen from "./chat/ReviewDetail.screen";
import AppointmentSelectMemberScreen from "./appointments/ApptSelectMember.screen";
import AppointmentConfirmDetailsScreen from "./appointments/ApptConfirmDetails.screen";
import PrivacyPolicy from './privacy-policy/PrivacyPolicy';
import TermsOfService from './terms-of-service/TermsOfService';
import CreateGroupScreen from "./group/CreateGroup.screen";
import AddMembersScreen from "./group/AddMembers.screen";
import GroupDetailScreen from './group/GroupDetails.screen';
import AddNotesScreen from './tele-session/AddNotes.screen';
import AssignAssessmentScreen from "./chat/AssignAssessment.screen";
import ActivityListScreen from "./activity-feed/FeedList.screen";
import SessionNotesScreen from "./activity-feed/SessionNotes.screen";
import ConvoFeedScreen from "./activity-feed/ConvoFeed.screen";
import ConvoFeedListScreen from "./activity-feed/ConvoFeedList.screen";
import ConvoDetailsScreen from "./activity-feed/ConvoDetailsScreen";
import EducationFeedListScreen from "./activity-feed/EducationFeedList.screen";
import AppointmentFeedListScreen from "./activity-feed/AppointmentFeedList.screen";
import UserAppointmentListScreen from "./activity-feed/UserAppointmentList.screen";
import GroupCallScreen from "./group/GroupCall.screen";
import AppointmentUserListScreen from './chat/request-appointment/ApptSelectUser.screen';
import AppointmentServiceScreen from './chat/request-appointment/ApptService.screen';
import AppointmentDateTimeScreen from './chat/request-appointment/ApptDateTime.screen';
import RequestAppointmentConfirmDetailsScreen from './chat/request-appointment/RequestApptConfirmDetails.screen';
import SuggestSecondConnectionScreen from "./matchmaker-connection/SuggestSecondConnection.screen";
import ConnectionRequestScreen from "./matchmaker-connection/ConnectionRequest.screen";
import {EditGroupRulesScreen} from "./group/EditGroupRules.screen";
import {EditGroupDonationsScreen} from "./group/EditGroupDonations.screen";
import ProviderProgressScreen from "./progress-report/ProviderProgress.screen";
import MediaViewScreen from "./chat/MediaViewScreen";
import StripeConnectFlowScreen from "./profile/StripeConnectFlow.screen";
import SessionQualityScreen from "./appointment-recap/SessionQuality.screen";
import AppointmentRecapScreen from "./appointment-recap/AppointmentRecap.screen";
import InterestInOtherScreen from "./appointment-recap/InterestInOther.screen";
import ScheduleNextAppointment from "./appointment-recap/ScheduleNextAppointment.screen";
import ApptOverviewScreen from "./pre-appointment-flow/ApptOverview.screen";
import PastApptListScreen from "./pre-appointment-flow/PastApptList.screen";
import ReviewGroupListScreen from "./pre-appointment-flow/ReviewGroupList.screen";
import ReviewChatbotListScreen from "./pre-appointment-flow/ReviewChatbotList.screen";
import ReviewHistoryScreen from "./pre-appointment-flow/ReviewHistory.screen";
import ReviewSocialDeterminantScreen from "./pre-appointment-flow/ReviewSocialDeterminant.screen";
import ReviewLifeEventScreen from "./pre-appointment-flow/ReviewLifeEvent.screen";
import ReviewSymptomScreen from "./pre-appointment-flow/ReviewSymptom.screen";
import RateCallQualityScreen from "./post-appointment-flow/RateCallQuality.screen";
import DataDomainListScreen from "./post-appointment-flow/DataDomainList.screen";
import DomainGroupsScreen from "./post-appointment-flow/DomainGroupsScreen";
import AssignDomainElementScreen from "./post-appointment-flow/AssignDomainElementScreen";
import AddMedicalHistoryScreen from "./post-appointment-flow/AddMedicalHistoryScreen";
import SubstanceUseListScreen from "./pre-appointment-flow/SubstanceUseList.screen";
import ReviewDiagnosesScreen from "./pre-appointment-flow/ReviewDiagnoses.screen";
import ReviewMedicationsScreen from "./pre-appointment-flow/ReviewMedications.screen";
import AddAppointmentNotesScreen from "./post-appointment-flow/AddAppointmentNotes.screen";
import NewGroupDetailsScreen from "./group/NewGroupDetails.screen";
import NewEditGroupDetailsScreen from "./group/NewEditGroupDetails.screen";
import ManageGroupMembersScreen from "./group/ManageGroupMembers.screen";
import TelehealthSessionV2Screen from './tele-session/TelehealthSessionV2.screen';
import MemberEMRDetailsScreen from "./connections/MemberEMRDetails.screen";
import ReviewSingleDomainType from "./pre-appointment-flow/ReviewSingleDomainType";
import CareTeamMembersScreen from "./connections/CareTeamMembers.screen";
import {MemberContactInfoScreen} from "./connections/MemberContactInfo.screen";
import {MemberCompletedArticles} from "./connections/MemberCompletedArticles.screen";
import {AddPlanItemsScreen} from "./connections/AddPlanItems.screen";
import OperatingStates from "./settings/operating-states/OperatingStates";

import ProviderDetailScreenV2 from "./chat/ProviderDetailV2.screen";
import ProviderDailyScheduleScreen from "./schedule/ProviderDailySchedule.screen";
import ProviderAllScheduleScreen from "./schedule/ProviderAllSchedule.screen";
import ApptCompletedNotesScreen from "./appointments/ApptCompletedNotes.screen";

import NotesScreen from "./contact-notes/Notes.screen";
import AddEditContactNotesScreen from "./contact-notes/AddEditContactNotes.screen";
import RemoveNotesScreen from "./contact-notes/RemoveNotes.screen";
import PatientProhibitiveScreen from "./appointments/PatientProhibitiveScreen";

export function getAuthScreens() {
    const authScreens = {};
// Mapping Screen Ids with Screen Components
    authScreens[Screens.LOGIN_SCREEN] = LoginScreen;
    authScreens[Screens.ACCOUNT_RECOVERY_SCREEN] = AccountRecoveryScreen;
    authScreens[Screens.CONFIRM_NUMBER_SCREEN] = ConfirmationNumberScreen;
    authScreens[Screens.NEW_PASSWORD_SCREEN] = NewPasswordScreen;

    return authScreens;
}

export function getAppScreens() {
    const appScreens = {};

    //appScreens[Screens.CHAT_LIST] = ChatListScreen;
    //appScreens[Screens.CONNECTIONS] = ConnectionsScreen;

    appScreens[Screens.LIVE_CHAT] = LiveChatScreen;
    appScreens[Screens.TOPIC_CONTENT_LIST_SCREEN] = TopicContentListScreen;
    appScreens[Screens.EDUCATIONAL_CONTENT_PIECE] = EducationalContentPiece;
    appScreens[Screens.TOPIC_LIST_SCREEN] = TopicListScreen;
    appScreens[Screens.MEMBER_DETAIL_SCREEN] = MemberDetailScreen;
    appScreens[Screens.TELEHEALTH_WELCOME] = TelehealthWelcomeScreen;
    appScreens[Screens.VIDEO_CALL] =  {
        name: Screens.VIDEO_CALL,
        screen: VideoCallScreen,
        navigationOptions: {
            gesturesEnabled: false,
        },
    };
    appScreens[Screens.WAITING_ROOM] = WaitingRoomScreen;
    appScreens[Screens.TELEHEALTH_COMPLETED] = CompletedSessionScreen;
    appScreens[Screens.INVITATION] = InvitationScreen;
    appScreens[Screens.PROGRESS_REPORT_SCREEN] = ProgressReportScreen;
    appScreens[Screens.PENDING_CONNECTIONS_SCREEN] = PendingConnectionScreen;
    appScreens[Screens.PROVIDER_SEARCH_SCREEN] = ProviderSearchScreen;
    appScreens[Screens.PROVIDER_PROFILE_SCREEN] = ProviderDetailScreen;
    appScreens[Screens.PROGRESS_REPORT_SEE_ALL_SCREEN] = ProgressReportSeeAllScreen;
    appScreens[Screens.PROGRESS_REPORT_SEE_ALL_SCREEN_DCT] = ProgressReportSeeAllScreen;
    appScreens[Screens.ASSIGNABLE_CONTENT_LIST] = ContentSharingScreen;
    appScreens[Screens.SHARE_CONTENT_SCREEN] = ShareContentScreen;
    appScreens[Screens.OUTCOME_DETAIL_SCREEN] = OutcomeDetailScreen;
    appScreens[Screens.DCT_REPORT_VIEW_SCREEN] = DCTReportViewScreen;
    appScreens[Screens.CHANGE_PASSWORD_SCREEN] = ChangePasswordScreen;
    appScreens[Screens.APPOINTMENT_DETAILS_SCREEN] = AppointmentDetailsScreen;
    appScreens[Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN] = AppointmentSelectServiceScreen;
    appScreens[Screens.MEMBER_PROHIBITIVE_SCREEN] = PatientProhibitiveScreen;
    appScreens[Screens.REQUEST_APPT_SELECT_MEMBER_SCREEN] = AppointmentSelectMemberScreen;
    appScreens[Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN] = AppointmentConfirmDetailsScreen;
    appScreens[Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN] = AppointmentSelectDateTimeScreen;
    appScreens[Screens.REQUEST_APPT_EDIT_MESSAGE_SCREEN] = AppointmentEditMessageScreen;
    appScreens[Screens.APPOINTMENT_SUBMITTED] =  {
        name: Screens.APPOINTMENT_SUBMITTED,
        screen: AppointmentSubmittedScreen,
        navigationOptions: {
            gesturesEnabled: false,
        },
    };
    appScreens[Screens.ASSIGN_ASSESSMENT] = AssignAssessmentScreen;
    appScreens[Screens.REVIEW_DETAIL_SCREEN] = ReviewDetailScreen;
    appScreens[Screens.CREATE_GROUP_SCREEN] = CreateGroupScreen;
    appScreens[Screens.ADD_MEMBERS_SCREEN] = AddMembersScreen;
    appScreens[Screens.GROUP_DETAIL_SCREEN] = GroupDetailScreen;
    appScreens[Screens.ADD_NOTES_SCREEN] = AddNotesScreen;
    appScreens[Screens.SESSION_NOTES_SCREEN] = SessionNotesScreen;
    appScreens[Screens.CONVO_FEED_SCREEN] = ConvoFeedScreen;
    appScreens[Screens.CONVO_FEED_LIST_SCREEN] = ConvoFeedListScreen;
    appScreens[Screens.CONVO_DETAILS_SCREEN] = ConvoDetailsScreen;
    appScreens[Screens.EDUCATION_FEED_LIST_SCREEN] = EducationFeedListScreen;
    appScreens[Screens.APPOINTMENT_FEED_LIST_SCREEN] = AppointmentFeedListScreen;
    appScreens[Screens.USER_APPOINTMENT_LIST_SCREEN] = UserAppointmentListScreen;
    appScreens[Screens.CONNECTIONS] = ConnectionsScreen;
    appScreens[Screens.SUGGEST_SECOND_CONNECTION_SCREEN] = SuggestSecondConnectionScreen;
    appScreens[Screens.CONNECTION_REQUEST_SCREEN] = ConnectionRequestScreen;
    appScreens[Screens.SETTINGS_SCREEN] = SettingsScreen;
    appScreens[Screens.PROFILE] = ProfileScreen;
    appScreens[Screens.NOTIFICATION_SCREEN] = NotificationScreen;
    appScreens[Screens.CHANGE_PASSWORD_SCREEN] = ChangePasswordScreen;
    appScreens[Screens.TIME_ZONE_SELECTION] = TimeZoneSelectionScreen;
    appScreens[Screens.APPOINTMENTS_SETTINGS] = AppointmentSettingsScreen;
    appScreens[Screens.BUSINESS_HOUR_SELECTION] = BusinessHourSelectionScreen;
    appScreens[Screens.ADD_SERVICE_SCREEN] = AddServiceScreen;
    appScreens[Screens.SERVICES_SCREEN] = ServicesScreen;
    appScreens[Screens.OPERATING_STATES] = OperatingStates;
    appScreens[Screens.SUPPORT_SCREEN] = Support;
    appScreens[Screens.ABOUT_SCREEN] = About;
    appScreens[Screens.PRIVACY_POLICY_SCREEN] = PrivacyPolicy;
    appScreens[Screens.TERMS_OF_SERVICE_SCREEN] = TermsOfService;

    appScreens[Screens.GROUP_CALL_SCREEN] =  {
        name: Screens.GROUP_CALL_SCREEN,
        screen: GroupCallScreen,
        navigationOptions: {
            gesturesEnabled: false,
        },
    };
    appScreens[Screens.APPT_COMPLETED_NOTES_SCREEN] = ApptCompletedNotesScreen;
    appScreens[Screens.APPT_USER_LIST_SCREEN] = AppointmentUserListScreen;
    appScreens[Screens.APPT_SERVICE_SCREEN] = AppointmentServiceScreen;
    appScreens[Screens.APPT_DATE_TIME_SCREEN] = AppointmentDateTimeScreen;
    appScreens[Screens.APPT_CONFIRM_DETAILS_SCREEN] = RequestAppointmentConfirmDetailsScreen;
    appScreens[Screens.EDIT_GROUP_RULES_SCREEN] = EditGroupRulesScreen;
    appScreens[Screens.EDIT_GROUP_DONATIONS_SCREEN] = EditGroupDonationsScreen;
    appScreens[Screens.GENERIC_MEDIA_VIEW] = MediaViewScreen;
    appScreens[Screens.STRIPE_CONNECT_FLOW] = StripeConnectFlowScreen;

    appScreens[Screens.SESSION_QUALITY_SCREEN] = SessionQualityScreen;
    appScreens[Screens.APPOINTMENT_RECAP_SCREEN] = AppointmentRecapScreen;
    appScreens[Screens.INTEREST_IN_OTHER] = InterestInOtherScreen;
    appScreens[Screens.SCHEDULE_NEXT_APPOINTMENT] = ScheduleNextAppointment;
    appScreens[Screens.APPOINTMENT_OVERVIEW_SCREEN] = ApptOverviewScreen;
    appScreens[Screens.PAST_APPOINTMENT_LIST_SCREEN] = PastApptListScreen;
    appScreens[Screens.REVIEW_GROUP_LIST_SCREEN] = ReviewGroupListScreen;
    appScreens[Screens.REVIEW_CHATBOT_LIST_SCREEN] = ReviewChatbotListScreen;
    appScreens[Screens.REVIEW_HISTORY_SCREEN] = ReviewHistoryScreen;
    appScreens[Screens.REVIEW_SOCIAL_DETERMINANT_SCREEN] = ReviewSocialDeterminantScreen;
    appScreens[Screens.REVIEW_LIFE_EVENT_SCREEN] = ReviewLifeEventScreen;
    appScreens[Screens.REVIEW_SYMPTOMS_SCREEN] = ReviewSymptomScreen;
    appScreens[Screens.NEW_GROUP_DETAILS_SCREEN] = NewGroupDetailsScreen;
    appScreens[Screens.NEW_EDIT_GROUP_DETAILS_SCREEN] = NewEditGroupDetailsScreen;
    appScreens[Screens.MANAGE_GROUP_MEMBERS_SCREEN] = ManageGroupMembersScreen;
    appScreens[Screens.RATE_CALL_QUALITY_SCREEN] = {
        name: Screens.RATE_CALL_QUALITY_SCREEN,
        screen: RateCallQualityScreen,
        navigationOptions: {
            gesturesEnabled: false,
        },
    };
    appScreens[Screens.DATA_DOMAIN_LIST_SCREEN] = {
        name: Screens.DATA_DOMAIN_LIST_SCREEN,
        screen: DataDomainListScreen,
        navigationOptions: {
            gesturesEnabled: false,
        }
    };
    appScreens[Screens.DOMAIN_GROUPS_SCREEN] = DomainGroupsScreen;
    appScreens[Screens.ASSIGN_DOMAIN_ELEMENT_SCREEN] = AssignDomainElementScreen;
    appScreens[Screens.ADD_MEDICAL_HISTORY_SCREEN] = AddMedicalHistoryScreen;
    appScreens[Screens.SUBSTANCE_USE_LIST_SCREEN] = SubstanceUseListScreen;
    appScreens[Screens.REVIEW_DIAGNOSES_SCREEN] = ReviewDiagnosesScreen;
    appScreens[Screens.REVIEW_MEDICATIONS_SCREEN] = ReviewMedicationsScreen;
    appScreens[Screens.MEMBER_EMR_DETAILS_SCREEN] = MemberEMRDetailsScreen;
    appScreens[Screens.REVIEW_SINGLE_DOMAIN_TYPE] = ReviewSingleDomainType;
    appScreens[Screens.CARE_TEAM_MEMBERS_SCREEN] = CareTeamMembersScreen;
    appScreens[Screens.MEMBER_CONTACT_INFO_SCREEN] = MemberContactInfoScreen;
    appScreens[Screens.MEMBER_COMPLETED_ARTICLES] = MemberCompletedArticles;
    appScreens[Screens.ADD_PLAN_ITEMS_SCREEN] = AddPlanItemsScreen;
    appScreens[Screens.ADD_APPOINTMENT_NOTES_SCREEN] = AddAppointmentNotesScreen;

    appScreens[Screens.TELE_SESSION_V2] =  {
        name: Screens.TELE_SESSION_V2,
        screen: TelehealthSessionV2Screen,
        navigationOptions: {
            gesturesEnabled: false,
        }
    };
    appScreens[Screens.PROVIDER_DETAIL_SCREEN_V2] = ProviderDetailScreenV2;
    appScreens[Screens.PROVIDER_DAILY_SCHEDULE_SCREEN] = ProviderDailyScheduleScreen
    appScreens[Screens.PROVIDER_ALL_SCHEDULE_SCREEN] = ProviderAllScheduleScreen
    appScreens[Screens.PROVIDER_DAILY_SCHEDULE_SCREEN] = ProviderDailyScheduleScreen;
    appScreens[Screens.PROVIDER_ALL_SCHEDULE_SCREEN] = ProviderAllScheduleScreen;
    appScreens[Screens.NOTES_SCREEN] = NotesScreen;
    appScreens[Screens.ADD_NEW_NOTES_SCREEN] = AddEditContactNotesScreen;
    appScreens[Screens.REMOVE_NOTES_SCREEN] = RemoveNotesScreen;
    return appScreens;
}

export function getTabScreens() {
    const tabScreens = {};
    tabScreens[Screens.APPOINTMENTS_SCREEN] = AppointmentsScreen;
    tabScreens[Screens.ACTIVITY_FEED_LIST_SCREEN] = ActivityListScreen;
    tabScreens[Screens.CHAT_LIST] = ChatListScreen;
    tabScreens[Screens.SECTION_LIST_SCREEN] = SectionListScreen;
    tabScreens[Screens.PROVIDER_DETAIL_SCREEN_V2] = ProviderDetailScreenV2;
    //tabScreens[Screens.PROVIDER_PROGRESS_SCREEN] = ProviderProgressScreen;
    // tabScreens[Screens.SETTINGS_STACK] = createStackNavigator(getSettingsStack(),{initialRouteName: Screens.SETTINGS_SCREEN,headerMode: 'none'});
    return tabScreens;
}

function getSettingsStack() {
    const settingsScreens = {};

    settingsScreens[Screens.PROFILE] = ProfileScreen;
    settingsScreens[Screens.NOTIFICATION_SCREEN] = NotificationScreen;
    settingsScreens[Screens.CHANGE_PASSWORD_SCREEN] = ChangePasswordScreen;
    settingsScreens[Screens.TIME_ZONE_SELECTION] = TimeZoneSelectionScreen;
    settingsScreens[Screens.APPOINTMENTS_SETTINGS] = AppointmentSettingsScreen;
    settingsScreens[Screens.BUSINESS_HOUR_SELECTION] = BusinessHourSelectionScreen;
    settingsScreens[Screens.ADD_SERVICE_SCREEN] = AddServiceScreen;
    settingsScreens[Screens.SERVICES_SCREEN] = ServicesScreen;
    settingsScreens[Screens.SUPPORT_SCREEN] = Support;
    settingsScreens[Screens.ABOUT_SCREEN] = About;
    settingsScreens[Screens.PRIVACY_POLICY_SCREEN] = PrivacyPolicy;
    settingsScreens[Screens.TERMS_OF_SERVICE_SCREEN] = TermsOfService;
    return settingsScreens;
}
