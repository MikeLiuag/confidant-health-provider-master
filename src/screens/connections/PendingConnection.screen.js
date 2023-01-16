import React, {Component} from 'react';
import {NativeModules, StatusBar,} from 'react-native';
import {AlertUtil, PendingConnectionsComponent} from "ch-mobile-shared";
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import SplashScreen from "react-native-splash-screen";
import Analytics from '@segment/analytics-react-native';
import moment from "moment";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import {connectAuth} from "../../redux";

const AnimatedSplash = NativeModules.AnimatedSplash;
class PendingConnectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        SplashScreen.hide();
        if (Platform.OS === 'ios') {
            AnimatedSplash.hide();
        }
        this.state = {
            isLoading: true,
            pendingConnections: [],
        };
    }

    /**
     * @function getPendingConnections
     * @description This method is used to get pending connections list .
     */
    getPendingConnections = async () => {
        try {
            const connections = await ProfileService.getPendingConnections();
            if (connections.errors) {
                AlertUtil.showErrorMessage(connections.errors[0].endUserMessage);
                this.navigateToTabView();
            } else {
                if (connections.length <= 0) {
                    this.navigateToTabView();
                } else {
                    const pendingConnections = [];
                    connections.forEach(Connection => {
                        pendingConnections.push({
                            connectionId: Connection.connectionId,
                            joinedDate: Connection.joinedDate,
                            name: Connection.name,
                            profilePicture: Connection.profilePicture ? Connection.profilePicture : null,
                            type: Connection.type,
                            isConnected: true,
                        });
                    });

                    this.setState({pendingConnections: pendingConnections, isLoading: false});
                }
            }
        } catch (e) {
            console.warn(e);
            AlertUtil.showErrorMessage('Whoops ! something went wrong ! ');
            this.navigateToTabView();
        }
    }


    /**
     * @function navigateToTabView
     * @description This method is used to navigate to tab view
     */
    navigateToTabView = () => {
        this.props.navigation.replace(Screens.TAB_VIEW);
    }

    componentDidMount = async () => {
        await this.getPendingConnections();
    }

    /**
     * @function navigateToChatList
     * @description This method is used to send accepted/rejected connections & moved to next screen.
     */
    navigateToChatList = async () => {
        const {pendingConnections} = this.state;
        const acceptedConnections = [], rejectedConnections = [];
        pendingConnections.forEach(pendingConnection => {
            if (pendingConnection.isConnected === true) {
                acceptedConnections.push(pendingConnection.connectionId)
            } else {
                rejectedConnections.push(pendingConnection.connectionId)
            }
        });

        const response = await ProfileService.processPendingConnections({acceptedConnections, rejectedConnections})
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.navigateToTabView();
        } else {
            await this.newMemberSegmentEvents();
            this.navigateToTabView();
        }
    }


    /**
     * @function newProviderSegmentEvents
     * @description This method is used to send segment events for selected connections.
     */
    newMemberSegmentEvents = async ()=> {
        const {pendingConnections} = this.state;
        const segmentProviderList = pendingConnections.filter(connection => connection.isConnected && connection.type === 'PATIENT');
        if (segmentProviderList && segmentProviderList.length > 0) {
            segmentProviderList.forEach(connection => {
                const segmentPayload = {
                    providerId: this.props?.auth?.meta?.userId,
                    userId: connection?.connectionId,
                    connectedAt: moment.utc(Date.now()).format(),
                    providerName: connection?.name,
                    providerRole: connection?.designation
                };
                Analytics.track(SEGMENT_EVENT.NEW_MEMBER_CONNECTION, segmentPayload);
            })
        }
    }


    /**
     * @function stayConnected
     * @description This method is used to update pending connection status
     * @param connection
     */
    stayConnected = (item) => {
        const {pendingConnections} = this.state;
        pendingConnections.forEach(pendingConnection => {
            if (item.connectionId === pendingConnection.connectionId) {
                pendingConnection.isConnected = !pendingConnection.isConnected;
            }
        })
        this.setState({pendingConnections});
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <PendingConnectionsComponent
                connections={this.state.pendingConnections}
                navigateToChatList={this.navigateToChatList}
                stayConnected={this.stayConnected}
                isLoading={this.state.isLoading}
            />
        );
    }

}

export default connectAuth()(PendingConnectionScreen);
