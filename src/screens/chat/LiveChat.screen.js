import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {connectChatWithAuth} from "../../redux";
import LiveChatComponent from "ch-mobile-shared/src/components/LiveChat.component";
import {getAvatar, isTelehealthConfigured, AlfieLoader, Colors} from "ch-mobile-shared";
import {AlertUtil} from "ch-mobile-shared";
import moment from 'moment';
import AppointmentService from "../../services/AppointmentService";
import AuthStore from '../../utilities/AuthStore';
import ProfileService from "../../services/ProfileService";
import Analytics from '@segment/analytics-react-native';
import BranchLinksService from "../../services/BranchLinksService";
import {CONTACT_NOTES_FLAGS, CONTACT_NOTES_STATUS, SEGMENT_EVENT} from "../../constants/CommonConstants";
import momentTimeZone from "moment-timezone";
import {CONNECTION_TYPES} from "ch-mobile-shared/src/constants/CommonConstants";

class LiveChatScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    connectionStatus = {
        "0": "Connecting...",
        "1": "Chat Connected",
        "2": "Fetching Messages",
        "3": "Privacy Prompt Required",
        "4": "Ready to Chat",
        "5": "Failed to connect",
        "6": "Closed"
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const connection = navigation.getParam('connection', null);
        this.connection = connection;
        this.connection.userId = this.connection.connectionId;
        this.referrer = navigation.getParam('referrer', null);
        this.state = {
            startingSession: false,
            connection : connection,
        };

        this.props.initChat({
            payload: {
                channelUrl: this.connection.channelUrl,
                connection: {
                    ...connection,
                    nickname: this.connection.nickName
                },
                currentUser: {
                    userId: this.props.auth.meta.userId,
                    nickname: this.props.auth.meta.nickName
                }
            }
        });
    }


    componentDidMount = async () =>{

        if(this.connection.type === CONNECTION_TYPES.CHAT_GROUP) {
            await this.getGroupDetails();
            await this.groupQRCode();
        }

        this.groupChatRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                if(this.connection.type === CONNECTION_TYPES.CHAT_GROUP) {
                    this.getGroupDetails();
                }
            }
        );

    };

    componentWillUnmount() {
        // this.props.exitChat();
        if (this.groupChatRefresher) {
            this.groupChatRefresher.remove();
        }
    }


    getGroupDetails = async () => {
        this.setState({isLoading: true});
        try {
            const groupsResponse = await ProfileService.getGroupDetails(this.connection.channelUrl);
            if (groupsResponse.errors) {
                console.log(groupsResponse.errors);
                AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
                this.props.navigation.navigate(Screens.TAB_VIEW);
            } else {
                this.setState({isLoading: false, groupsResponse: groupsResponse});
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage('Whoops ! something went wrong ! ');
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }

    };

    leaveGroup = async () => {
        this.setState({isLoading: true});
        const response = await ProfileService.removeMember(this.connection.channelUrl, this.props.auth.meta.userId);
        if (response.errors) {
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({isLoading: false});
            AlertUtil.showSuccessMessage('You are no longer participant of ' + this.connection.name + ' group');
            this.props.fetchConnections();
            this.goBack();
        }
    }


    deleteGroup = async () => {
        this.setState({isLoading: true});
        const response = await ProfileService.deleteGroup(this.connection.channelUrl);
        if (response.errors) {
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({isLoading: false});
            AlertUtil.showSuccessMessage('Group deleted successfully.');
            this.props.fetchConnections();
            this.goBack();
        }
    }



    goBack = () => {
        if (this.referrer) {
            if (this.referrer === 'SessionNotesScreen') {
                this.props.navigation.goBack();
            } else {
                this.props.navigation.replace(this.referrer);
            }
        } else {
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }
    };

    showConnectionProfile = (isChatOpen) => {
        if (this.connection.type === CONNECTION_TYPES.PRACTITIONER || this.connection.type === CONNECTION_TYPES.MATCH_MAKER) {
            this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
                providerId: this.connection?.connectionId || this.connection?.userId,
                type: this.connection.type,
            });
        } else if (this.connection.type === CONNECTION_TYPES.PATIENT) {
            this.props.navigation.navigate(Screens.MEMBER_EMR_DETAILS_SCREEN, {
                connection: this.connection
            })
        } else if (this.connection.type === CONNECTION_TYPES.CHAT_GROUP) {
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN,
                {
                    name: this.connection.name,
                    profilePicture: this.connection.profilePicture,
                    channelUrl: this.connection.channelUrl,
                    publicGroupType : this.state.groupsResponse.groupTypePublic,
                    publicGroupLink : this.state.groupLink,

                });
        }
    };

    shareProviderProfile = async (channel) => {
        await Analytics.track(SEGMENT_EVENT.APP_SHARED,{
            userId : this.props.auth?.meta?.userId,
            screenName: 'LiveChatScreen',
            isProviderApp : true
        });
        await BranchLinksService.shareProviderProfileLink(channel, this.state.connection.userId);
    };

    shareGroup = async (channel) => {
        setTimeout(async ()=>{
            await BranchLinksService.shareGroupLink(channel, this.connection.channelUrl);
        },500);
    };

    groupQRCode = async () => {
        const groupLink = await BranchLinksService.groupQRCodeLink( this.connection.channelUrl);
        this.setState({groupLink : groupLink});
    }


    navigateToTelehealth = async () => {
        const isConfigured = await isTelehealthConfigured();
        this.props.navigation.navigate(!isConfigured ? Screens.TELEHEALTH_WELCOME : Screens.TELE_SESSION_V2, {
            connection: this.connection,
        });
    };

    dataSharingPromptAnswered = (data) => {

    };

    assignContent = () => {

        this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN, {
            forAssignment: true,
            connection: this.connection,
            fromChat: true,
        });
    };

    sendMessage = (payload) => {
        if (this.connection.type === 'CHAT_GROUP') {
            const createdAt = payload?.payload?.message?.createdAt;
            const segmentPayload = {
                userId: this.props.auth?.meta?.userId,
                groupName: this.connection.name,
                groupId: this.connection.channelUrl,
                messageSentDateTime: createdAt,
                isProviderApp : true
            };
            Analytics.track(SEGMENT_EVENT.GROUP_CHAT_MESSAGE_SENT, segmentPayload);
        }
        this.props.sendMessage(payload);
    };

    findConnectionAvatar = (connectionId) => {
        let avatar = this._findAvatar(connectionId, this.props.connections.activeConnections);
        if (!avatar) {
            avatar = this._findAvatar(connectionId, this.props.connections.pastConnections);
        }
        return avatar ? getAvatar({profilePicture: avatar}) : null;
    };

    _findAvatar(connectionId, connections) {
        const filtered = connections.filter(conn => conn.connectionId === connectionId);
        if (filtered.length > 0) {
            return filtered[0].profilePicture;
        }
    }

    startSession = async (appointment) => {
        if (!this.state.startingSession) {
            this.setState({startingSession: true});
            const appointmentId = appointment.appointmentId;
            const authToken = await AuthStore.getAuthToken();
            try {
                const response = await AppointmentService.arriveForAppointment(appointmentId, authToken);
                if (response.errors) {
                    AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                    this.setState({startingSession: false})
                }
                else {
                    AuthStore.setAppointmentDetails({
                        appointment,
                        sessionId: response.telesessionId,
                        token: response.telesessionToken,
                        sessionStarted: response.sessionStarted,
                        encounterId: response.encounterId,
                        appointmentStatus: appointment.status
                    }).then(() => {
                        console.log('Current Appointment Details Stored Temporarily');
                    });

                    this.props.navigation.navigate(Screens.APPOINTMENT_OVERVIEW_SCREEN, {
                        appointment,
                        sessionId: response.telesessionId,
                        token: response.telesessionToken,
                        sessionStarted: response.sessionStarted,
                        encounterId: response.encounterId,
                        connection : this.connection,
                    });
                    setTimeout(() => {
                        this.setState({
                            startingSession: false,
                        });
                    }, 1000);

                }
            } catch (e) {
                console.log(e);
                this.setState({
                    startingSession: false,
                });
                AlertUtil.showErrorMessage("Something went wrong, please try later");
            }
        }
    };

    checkNextAppointmentForToday = () => {
        this.setState({
            ...this.state
        });
    };


    isMissed = (appt) => {
        return moment.utc(appt.endTime).diff(moment.utc(), 'minutes') < 0;
    };

    assignAssessment = () => {
        this.props.navigation.navigate(Screens.ASSIGN_ASSESSMENT, {
            connectionId: this.connection.connectionId
        })
    };

    isToday = (appointment) => {
        return moment.utc().isSame(moment.utc(appointment.startTime), 'days')
            && !this.isMissed(appointment);
    };

    getBookedAppointments = () => {
        const {appointments} = this.props;
        if (this.connection.type === 'PATIENT') {
            const filteredAppointments = appointments.appointments.filter(appt => {
                return appt.status === 'BOOKED' && appt.participantId === this.connection.connectionId && this.isToday(appt)
            });
            return filteredAppointments.sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
        } else {
            return [];
        }

    };


    startGroupCall= async () => {
        const isConfigured = await isTelehealthConfigured();
        this.props.navigation.navigate(!isConfigured ? Screens.TELEHEALTH_WELCOME : Screens.GROUP_CALL_SCREEN, {
            connection: {...this.connection,...this.state.groupsResponse},
            groupCall: true
        });
    };

    checkPatientProhibitive = () =>{
        const contactNotes=this.connection?.contactNotes
        let isPatientProhibitive = false
        for (let contactNote of contactNotes) {
            if(contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status===CONTACT_NOTES_STATUS.ACTIVE)
            {
                isPatientProhibitive=true;
                break;
            }
        }
        return isPatientProhibitive;
    }

    requestAppointmentByMatchmaker = () => {
        const isPatientProhibitive=this.checkPatientProhibitive()
        if(isPatientProhibitive)
        {
            this.props.navigation.navigate(Screens.MEMBER_PROHIBITIVE_SCREEN, {
                selectedMember: this.connection
            });
        }else
        {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                selectedMember: this.connection
            });
        }
    }
   /* requestAppointmentByMatchmaker = () => {
        this.props.navigation.navigate(Screens.APPT_USER_LIST_SCREEN, {
            connection: {
                name: this.connection.name,
                userId: this.connection.connectionId,
                profilePicture: this.connection.avatar,
                referrerScreen: Screens.LIVE_CHAT,
                type: this.connection.type
            },
        });
    }
*/

    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
        const connections = nextProps.connections.activeConnections.filter(connection=>connection.connectionId===this.connection.connectionId);
        if(connections.length===0) {
            AlertUtil.showErrorMessage("You're disconnected from this chat.");
            this.goBack();
            return false;
        }
        return true;
    }




    openImage = (url)=> {
        this.props.navigation.navigate(Screens.GENERIC_MEDIA_VIEW, {
            type: 'image',
            uri: url
        })
    };

    openVideo = (url)=> {
        this.props.navigation.navigate(Screens.GENERIC_MEDIA_VIEW, {
            type: 'video',
            uri: url
        })
    };

    bookAppointmentWithMember = ()=>{
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
            selectedMember: this.state.connection
        });
    };

    navigateToManageGroupScreen = () => {
        this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN,
            {
                name: this.connection.name,
                profilePicture: this.connection.profilePicture,
                channelUrl: this.connection.channelUrl,
                publicGroupType : this.state.groupsResponse.groupTypePublic,
                publicGroupLink : this.state.groupLink,

            });
    };

    findConnection = (connectionId)=>{
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId ===connectionId);
        if(connection && connection.length<1){
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId ===connectionId);
        }

        return connection;
    }

    /**
     * @function updateChatStatus
     * @description This method is used to update chat status
     */
    updateChatStatus = async (activeInActiveChatStatus) => {
        const {connectionId} = this.state.connection;
        const inActiveChat = activeInActiveChatStatus[0].value === true;
        this.setState({isLoading: true});

        try {
            let response = await ProfileService.updateChatStatus(connectionId, inActiveChat);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({
                    isLoading: false
                });
            } else {
                AlertUtil.showSuccessMessage("Chat Status updated successfully");
                this.props.refreshConnections();
                this.setState({
                    isLoading: false
                })
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    }

    render() {
        if(this.state.isLoading  || this.props.connections.isLoading || this.state.startingSession) {
            return (<AlfieLoader/>);
        }
        const appts = this.getBookedAppointments();
        let appointment = null;
        if (appts.length > 0) {
            console.log(appts[0]);
            appointment = appts[0];
        }
        const connections = this.findConnection(this.connection?.connectionId);
        if (connections.length > 0) {
            const connection = connections[0];
            this.connection = {...connection, avatar: getAvatar(connection), userId: connection.connectionId};
        }

        return (
            <LiveChatComponent
                connectionStatus={this.props.chat.connectionStatus}
                goBack={this.goBack}
                showConnectionProfile={this.showConnectionProfile}
                shareProviderProfile={this.shareProviderProfile}
                connection={this.connection}
                startSession={this.startSession}
                appointment={appointment}
                checkNextAppointmentForToday={this.checkNextAppointmentForToday}
                isTelehealthEnabled={this.connection.type === 'PATIENT'}
                navigateToTelehealth={this.navigateToTelehealth}
                navigateToGroupCall={this.startGroupCall}
                userId={this.props.auth.meta.userId}
                nickName={this.props.auth.meta.nickName}
                messages={this.props.chat.messages}
                findConnectionAvatar={this.findConnectionAvatar}
                dataSharingPromptAnswered={this.dataSharingPromptAnswered}
                providerListScreen={""}
                isProviderApp={true}
                sendMessage={this.sendMessage}
                leaveGroup={this.leaveGroup}
                deleteGroup={this.deleteGroup}
                shareGroup={this.shareGroup}
                openImage={this.openImage}
                openVideo={this.openVideo}
                assignContent={this.assignContent}
                assignAssessment={this.assignAssessment}
                bookAppointmentWithMember={this.bookAppointmentWithMember}
                educationContentScreen={""}
                navigation={this.props.navigation}
                requestAppointmentByMatchmaker={this.requestAppointmentByMatchmaker}
                isMatchmaker={this.props.profile.profile.matchmaker}
                groupResponse={this.state.groupsResponse}
                navigateToManageGroupScreen={this.navigateToManageGroupScreen}
                tz={this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)}
                connections = {this.props?.connections}
                updateChatStatus = {this.updateChatStatus}
            />
        );
    }

}

export default connectChatWithAuth()(LiveChatScreen);
