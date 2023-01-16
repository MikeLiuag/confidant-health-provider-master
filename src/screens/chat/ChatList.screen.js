import React, {Component} from 'react';
import {NativeModules, StatusBar, StyleSheet, Platform} from 'react-native';
import {Container, Header, Icon, View} from 'native-base';
import {
    AddConnectionsOverlay, addTestID, AlertUtil, ConfidantChatRoaster, isIphoneX, SearchFloatingButton,
    SliderSearch, getHeaderHeight, isTimeElapsed, Colors, TextStyles, CommonSegmentHeader, CommonStyles,CONNECTION_TYPES
} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import AuthStore from './../../utilities/AuthStore';
import NotificationListeners from '../../components/NotificationListeners';
import {sortConnections} from "../../redux/modules/connections/reducer";
import {isEqual} from 'lodash';
import {ProviderChatRoaster} from "../../components/ProviderChatRoaster";
const AnimatedSplash = NativeModules.AnimatedSplash;
const HEADER_SIZE = getHeaderHeight();

class ChatListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();

        if (Platform.OS === 'ios') {
            AnimatedSplash.hide();
        }
        super(props);
        this.navLock = false;
        this.state = {
            modalVisible: false,
            activeConnections: this.props.connections.activeConnections,
            filterType: 'ALL',
            activeSegmentId: 'members'
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.connections.activeConnections.length !== this.props.connections.activeConnections.length) {
            this.setState({
                activeConnections: this.props.connections.activeConnections
            });
        } else {
            for(let i =0;i<this.props.connections.activeConnections.length;i++) {
                const current = this.props.connections.activeConnections[i];
                const prev = prevProps.connections.activeConnections[i];
                if(!isEqual(current, prev)) {
                    this.setState({
                        activeConnections: this.props.connections.activeConnections
                    });
                    break;
                }
            }
        }
    }

    componentDidMount = async () => {
        NotificationListeners.subscribeToOneSignal();
        this.props.fetchAppointments();
        if(this.props.connections.connectionsFetchedFor !== this.props.auth.meta.userId) {
            this.props.fetchConnections();
        } else {
            this.props.refreshConnections();
        }
        this.props.fetchProfile();
        this.props.fetchSettings();
        this.props.fetchEducationMarkers();
        this.props.registerTokenRefreshTask();
        const activeSession = await AuthStore.hasActiveTelesession();
        if (activeSession) {
            this.props.navigation.navigate(
                Screens.TELEHEALTH_WELCOME,
                JSON.parse(activeSession),
            );
        }
    };

    closeDrawer() {
        if (this._drawer) {
            this._drawer._root.close();
        }
    }

    openDrawer = () => {
        this._drawer._root.open();
    };

    openChatWith = item => {
        if(this.props.chat.sendbirdStatus===2) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: item,
            });
        } else {
            AlertUtil.showErrorMessage("Please wait until chat service is connected");
        }

    };

    // navigateToLearningLibrary = () => {
    //   this.props.navigation.navigate(Screens.TOPIC_LIST_SCREEN, {
    //     forAssignment: false
    //   });
    // };

    navigateToProgressReports = () => {
        this.props.navigation.navigate(Screens.PROGRESS_REPORT_SCREEN);
    };

    getSections = () => {
        let connections = this.state.activeConnections;
        if(this.state.activeSegmentId === 'members') {
            connections = connections.filter(connection=>connection.type===CONNECTION_TYPES.PATIENT);
            const activeInActiveConnections = this.getActiveInActiveConnections(connections);
            const unReadConnections = this.getUnreadConnections(connections)
            return [
                {
                    title: "activeInActiveConnections",
                    count: activeInActiveConnections?.length,
                    data: activeInActiveConnections,
                },
                {
                    title: "unReadConnections",
                    count: unReadConnections?.length,
                    data: unReadConnections,
                },

            ];
            /*let {filters} = this.state;
            if(filters.length>0) {
                if(filters.includes("PROVIDERS")) {
                    filters = [...filters, 'PRACTITIONER', 'MATCH_MAKER'];
                }
                connections = connections.filter(connection=>filters.includes(connection.type));
            }*/
        } else if(this.state.activeSegmentId === 'providers') {
            connections = connections.filter(connection=>connection.type === 'PRACTITIONER' || connection.type === 'MATCH_MAKER');

        } else {
            connections = connections.filter(connection=>connection.type === 'CHAT_GROUP');
        }
        const unReadMessage = connections.filter(connection => connection.lastMessageUnread === true)
        return [{
            title: "",
            count: connections.length,
            unReadMessage: unReadMessage.length > 0,
            data: sortConnections(connections),
        }];
    };

    getActiveInActiveConnections = (connections) => {
        if(connections && connections.length > 0){
            const activeConnections = connections.filter(connection => connection.inActiveChat === true && connection.lastMessageUnread === false);
            const inActiveConnections = connections.filter(connection => connection.inActiveChat === false && connection.lastMessageUnread === false);
            return [
                {
                    title: "Active chats",
                    count: activeConnections.length,
                    data: sortConnections(activeConnections),
                },
                {
                    title: "Inactive chats",
                    count: inActiveConnections.length,
                    data: sortConnections(inActiveConnections),
                },
            ];
        }

    };

    getUnreadConnections = (connections) => {
        if(connections && connections.length > 0){
            const unReadConnections = connections.filter(connection => connection.lastMessageUnread === true);
             return [
                {
                    title: "",
                    count: unReadConnections.length,
                    data: sortConnections(unReadConnections),
                }
            ];
        }

    };

    propagate = result => {
        this.setState({
            activeConnections: result.active,
        });
    };

    filter = filterType => {
        this.setState({filterType: filterType});
    };

    navigateToInvitation = (invitationType) => {
        this.closeOverlay();
        this.props.navigation.navigate(Screens.INVITATION, {
            invitationType,
        });
    };

    showProviderSearch = () => {
        this.closeOverlay();
        this.props.navigation.navigate(Screens.PROVIDER_SEARCH_SCREEN);
    };

    closeOverlay = () => {
        this.setState({modalVisible: false});
    };

    createGroup = () => {
        this.closeOverlay();
        this.props.navigation.navigate(Screens.NEW_EDIT_GROUP_DETAILS_SCREEN);
    };

    showAddConnectionsOverlay = () => {
        if (!this.navLock) {
            this.setState({modalVisible: true});
        }
    };

    requestAppointment = (connection)=>{
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
            selectedMember: connection
        });
    }

    render() {
        let bookedAppointments = this.props.appointments.currentAppointments || [];
        if (bookedAppointments.length > 0) {
            bookedAppointments = bookedAppointments.filter(appt => (appt.status === "PROPOSED" || appt.status === "BOOKED") && !isTimeElapsed(appt.startTIme));
        }
        if (this.props.connections.error) {
            setTimeout(
                () => AlertUtil.showErrorMessage(this.props.connections.error),
                0,
            );
        }
        const sections = this.getSections();
        const {activeSegmentId} = this.state;

        console.log({sections : sections})

        return (
            /*<Drawer
              ref={ref => {
                this._drawer = ref;
              }}
              content={
                <Setting
                  componentId={this.props.componentId}
                  navigator={this._navigator}
                  closeDrawer={this.closeDrawer}
                  navigation={this.props.navigation}
                />
              }
              onClose={() => this.closeDrawer()}
              tapToClose={true}
              openDrawerOffset={0.2} // 20% gap on the right side of drawer
              panCloseMask={0.2}
              closedDrawerOffset={-3}
              tweenHandler={ratio => ({
                main: {opacity: (2 - ratio) / 2},
              })}>*/
            <Container style={styles.container}>
                <Header
                    {...addTestID("Header")}
                    noShadow transparent style={styles.chatHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <SliderSearch
                        options={{
                            screenTitle: 'Chats',
                            searchFieldPlaceholder: 'Search Chats',
                            listItems: {
                                active: this.props.connections.activeConnections,
                            },
                            leftIcon: <Icon type="Feather" name="users"
                                            style={{...styles.starIcon, color: '#3fb2fe'}}/>,
                            leftIconClicked: ()=>{
                                this.props.navigation.navigate(Screens.CONNECTIONS);
                            },
                            filter: (connections, query) => {
                                const active = connections.active.filter(connection =>
                                    connection.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );
                                return {active: active};

                            },
                            // backClicked: this.openDrawer,
                            // isDrawer: true,
                        }}
                        propagate={this.propagate}
                    />
                </Header>
                <AddConnectionsOverlay
                    modalVisible={this.state.modalVisible}
                    closeOverlay={this.closeOverlay}
                    createGroup={this.createGroup}
                    navigateToInvitation={this.navigateToInvitation}
                    showProviderSearch={this.showProviderSearch}
                    providerApp
                />
                <View
                    style={{paddingHorizontal: 24,
                        ...CommonStyles.styles.headerShadow,
                        // marginBottom: 16
                    }}>
                    <CommonSegmentHeader
                        segments={[
                            {title: 'Members', segmentId: 'members'},
                            {title: 'Providers', segmentId: 'providers'},
                            {title: 'Groups', segmentId: 'groups'},
                        ]}
                        segmentChanged={(segmentId) => {
                            this.setState({activeSegmentId: segmentId});
                        }}
                        sections = {sections?.[0]?.count !== 0 ? sections : null}
                    />
                </View>
                <View
                    style={{ flex: 1 }}
                >
                    {/*<ConfidantChatRoaster
                        activeSegmentId={activeSegmentId}
                        activeSections={sections[0].count !== 0 ? sections : null}
                        appointments={bookedAppointments}
                        requestAppointment={this.requestAppointment}
                        navigateToConnection={this.openChatWith}
                        onRefresh={this.props.refreshConnections}
                        isLoading={this.props?.connections?.isLoading}
                        providerApp
                    />*/}
                    <ProviderChatRoaster
                        activeSegmentId={activeSegmentId}
                        activeSections={sections?.[0]?.count !== 0 ? sections : null}
                        appointments={bookedAppointments}
                        requestAppointment={this.requestAppointment}
                        navigateToConnection={this.openChatWith}
                        onRefresh={this.props.refreshConnections}
                        isLoading={this.props?.connections?.isLoading}
                        providerApp
                        allAppointments = {this.props.appointments}
                        tz = {this.props?.settings?.appointments?.timezone}
                    />
                </View>
                <SearchFloatingButton
                    icon="plus"
                    onPress={() => {
                        this.showAddConnectionsOverlay();
                    }}
                    isFiltering={this.state.modalVisible}
                />
            </Container>
            //</Drawer>
        );
    }
}

const styles = StyleSheet.create({
    iconStyle: {
        color: "#d1d1d1",
        fontSize: 25,
    },
    searchField: {
        fontFamily: "Titillium-Web-Light",
        color: "#B3BEC9",
        fontSize: 14,
        fontWeight: "100",
        marginTop: 16,
        marginBottom: 10,
        marginLeft: 8,
        marginRight: 8,
        paddingLeft: 15,
        borderRadius: 4,
        borderColor: "#B7D2E5",
        backgroundColor: "#FFF",
    },
    searchIcon: {
        width: 18,
        height: 18,
        marginRight: 15,
    },
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: Colors.colors.screenBG,
    },
    chatHeader: {
        // backgroundColor: "#fff",
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 18,
        elevation: 0,
        height: HEADER_SIZE,
    },
    searchBox: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    mainImagesView: {
        height: 200,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingTop: 20,
        backgroundColor: "#fff",
    },
    filtersView: {
        flexGrow: 0,
        flexShrink: 0,
        flexDirection: "row",
        flexWrap: "nowrap",
        paddingLeft: 16,
        backgroundColor: "#ffffff",
        height: 60,
        paddingBottom: 24,
    },
    filterBtn: {
        paddingLeft: 0,
        paddingRight: 6,
        marginRight: 0
    },
    filterIcon: {
        width: 24
    },
    filterText: {
        color: "#515d7d",
        fontFamily: "Roboto-Bold",
        fontWeight: "600",
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.54,
        textTransform: "capitalize",
    },
    filterBtnSelected: {
        height: 32,
        borderWidth: 0.5,
        borderColor: "#f5f5f5",
        shadowColor: "#f5f5f5",
        shadowOffset: {
            width: 5,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2,
        backgroundColor: "#515d7d",
        marginRight: 8,
    },
    userIconBtn: {
        alignItems: 'flex-end',
        paddingRight: 0,
        paddingLeft:0,
        width: 35
    },
    userIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 24
    },
    starIcon: {
        color: "#d1d1d1",
        fontSize: 24,
        backgroundColor: "rgba(255,255,255, 0.45)",
    },
    filterTextSelected: {
        color: "#FFF",
        fontFamily: "Roboto-Bold",
        fontWeight: "600",
        lineHeight: 16,
        fontSize: 14,
        letterSpacing: 0.54,
        textTransform: "capitalize",
    },
    addIcon: {
        width: 5,
        height: 10,
    },
    headerRow: {
        flex: 3,
        alignItems: 'center'
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    filterOverlay: {
        height: 'auto',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
        left: 0,
        right: 0,
        top: 145,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 12
    },
    innerMain: {
        position: 'relative',
    },
    filterTopHead: {
        flexDirection: 'row',
        marginBottom: 24,
        justifyContent: 'space-between'
    },
    filterHeadText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3
    },
    filterTotalText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        marginLeft: 8
    },
    mainHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    countText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    checkBoxSectionMain: {
        // paddingTop: 40
    },
    checkBoxSectionText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 32,
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        backgroundColor: Colors.colors.whiteColor
    },
    multiList: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
});

export default connectConnections()(ChatListScreen);
