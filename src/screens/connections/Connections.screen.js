import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AlertUtil, AlfieLoader, CONNECTION_TYPES, ConnectionsV2Component} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import moment from "moment";
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import ProfileService from "../../services/ProfileService";
import {PENDING_CONNECTION_STATUS} from "ch-mobile-shared/src/constants/CommonConstants";

class ConnectionsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.navLock = false;
        this.state = {};
    }

    componentDidMount(): void {
        this.connectionRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.props.fetchConnections();
            },
        );
    }

    componentWillUnmount(): void {
        if (this.connectionRefresher) {
            this.connectionRefresher.remove();
        }
    }

    goToSuggestProviders = (selectedConnection) => {
        this.props.navigation.navigate(Screens.SUGGEST_SECOND_CONNECTION_SCREEN, {
            selectedConnection: {
                ...selectedConnection,
                userId: selectedConnection.connectionId,
            },
            filterPredicate: (connection=>connection.type===CONNECTION_TYPES.PRACTITIONER || connection.type===CONNECTION_TYPES.MATCH_MAKER)
        });

    }

    goToSuggestMembers = (selectedConnection) => {
        this.props.navigation.navigate(Screens.SUGGEST_SECOND_CONNECTION_SCREEN, {
            selectedConnection: {
                ...selectedConnection,
                userId: selectedConnection.connectionId,
            },
            filterPredicate: (connection=>connection.type===CONNECTION_TYPES.PATIENT)
        });

    }



    /**
     * @function backClicked
     * @description This method is used to navigate back.
     */
    backClicked = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function navigateToConnection
     * @description This method is used to navigate to profile based on connection type.
     */
    navigateToConnection = connection => {
        this.navLock = true;
        if (connection.type ===  CONNECTION_TYPES.PATIENT ) {
            connection.userId = connection.connectionId;
            this.props.navigation.navigate(Screens.MEMBER_EMR_DETAILS_SCREEN, {
                connection
            })
        } else if (connection.type ===  CONNECTION_TYPES.PRACTITIONER  || connection.type ===  CONNECTION_TYPES.MATCH_MAKER) {
            this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
                providerId: connection.connectionId,
                type: connection.type,
            });
        } else if (connection.type ===  CONNECTION_TYPES.CHAT_GROUP) {
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                ...connection
            })
        }
        setTimeout(() => {
            this.navLock = false;
        }, 1000);
    };

    /**
     * @function connect
     * @description This method is used to send connect request.
     */
    connect = (connection) => {
        this.props.connect({userId: connection.connectionId});
    };


    /**
     * @function disconnect
     * @description This method is used to send disconnect request.
     */
    disconnect = (connection) => {
        this.props.disconnect({userId: connection.connectionId});
    };


    /**
     * @function navigateToChat
     * @description This method is used to navigate to live chat
     */
    navigateToChat = (connection) => {
        this.props.navigation.navigate(Screens.LIVE_CHAT, {
            connection,
        });
    };


    /**
     * @function navigateToRequestAppointment
     * @description This method is used to navigate to select service screen.
     */
    navigateToRequestAppointment = (connection) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
            selectedMember: connection
        });
    };

    /**
     * @function newProviderSegmentEvents
     * @description This method is used to send segment events for selected member.
     */
    newMemberSegmentEvent = async (connection) => {
        if (connection.type === CONNECTION_TYPES.PATIENT) {
            const segmentPayload = {
                providerId: this.props?.auth?.meta?.userId,
                userId: connection?.connectionId,
                connectedAt: moment.utc(Date.now()).format(),
                providerName: connection?.name,
                providerRole: connection?.designation
            };
            await Analytics.track(SEGMENT_EVENT.NEW_MEMBER_CONNECTION, segmentPayload);
        }
    }

    /**
     * @function navigateToTabView
     * @description This method is used to navigate to Tab view
     */
    navigateToTabView = () => {
        this.props.navigation.replace(Screens.TAB_VIEW);
    }

    /**
     * @function updatePendingConnections
     * @description This method is used to accept new connections
     * @param connection , connectionStatus
     */
    updatePendingConnections = async (connection,connectionStatus) => {
        this.setState({ isLoading : true });
        const {connections} = this.props;
        let acceptedConnections = [] , rejectedConnections = [];
        if(connectionStatus === PENDING_CONNECTION_STATUS.ACCEPTED){
            acceptedConnections.push(connection.connectionId);
        }else{
            const newConnection = connections?.pendingConnections?.find(connection => connection.connectionId === connection.connectionId);
            rejectedConnections.push(newConnection.connectionId);
        }
        const response = await ProfileService.processPendingConnections({acceptedConnections, rejectedConnections})
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.navigateToTabView();
        } else {
            this.props.fetchConnections();
            await this.newMemberSegmentEvent(connection);
            this.setState({isLoading:false})
        }
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.connections.isLoading) {
            return <AlfieLoader/>;
        }
        return (
            <ConnectionsV2Component
                isLoading={this.state.isLoading}
                connections={this.props.connections}
                navigateToProfile={this.navigateToConnection}
                navigateToChat={this.navigateToChat}
                navigateToRequestAppointment={this.navigateToRequestAppointment}
                connect={this.connect}
                disconnect={this.disconnect}
                backClicked={this.backClicked}
                updatePendingConnections={this.updatePendingConnections}
                goToSuggestProviders={this.goToSuggestProviders}
                goToSuggestMembers={this.goToSuggestMembers}
                isProviderApp
            />
        );
    }
}

export default connectConnections()(ConnectionsScreen);
