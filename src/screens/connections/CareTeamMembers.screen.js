import React, {Component} from 'react';
import {FlatList, Image, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Container, Content, Header, Icon, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    BackButton,
    Colors,
    CommonStyles,
    getAvatar,
    getHeaderHeight,
    TextStyles
} from 'ch-mobile-shared';
import GenericActionButton from 'ch-mobile-shared/src/components/GenericActionButton';
import AwesomeFonts from 'react-native-vector-icons/FontAwesome';
import FeatherIcons from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modalbox';
import moment from "moment";
import {Screens} from "../../constants/Screens";
import Loader from '../../components/Loader';
import ProfileService from "../../services/ProfileService";
import BranchLinksService from "../../services/BranchLinksService";
import Fontisto from "react-native-vector-icons/Fontisto";
import {connectConnections} from "../../redux";
import {NavigationActions, StackActions} from "react-navigation";

const HEADER_SIZE = getHeaderHeight();
class CareTeamMembersScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const connection = this.props.navigation.getParam('connection', null);
        this.state = {
            isLoading: true,
            careTeamList : [],
            selectedCareTeamDetails : null,
            modalOpen: false,
            connection,
            modalHeightProps: {
                height: 50
            }
        };
    }

    componentDidMount() {
        this.fetchCareTeam();
    }

    fetchCareTeam = async () => {
        const response = await ProfileService.getCareTeam(this.state.connection.connectionId);

        if (response.errors) {
            AlertUtil.showErrorMessage(groupsData.errors[0].endUserMessage);
            this.setState({
                isLoading: false
            })
        } else {
            this.setState({
                careTeamList: response,
                isLoading: false
            })
        }
    }


    renderAppointmentView = (item) => {
        if(!item.nextAppointment) {
            return null;
        }
        return <View style={styles.nextApptWrap}>
            <Text style={styles.nextApptTitle}>
                Next Appointment
            </Text>
            <Text style={styles.nextApptDate}>{this.getAppointmentTimeString(item.nextAppointment)}</Text>
        </View>;

    };

    getAppointmentTimeString = (appt) => {
        const appointmentMoment = moment(appt.startTime);
        return (appointmentMoment.calendar().includes('Today') || appointmentMoment.calendar().includes('Tomorrow')) ?
            appointmentMoment.calendar() : appointmentMoment.format('DD MMM') + ' at ' + appointmentMoment.format('h:mm A');
    };


    openChat = (item) => {
        this.props.navigation.navigate(Screens.LIVE_CHAT, {
            connection: item,
        });
    }

    navigateBack() {
        this.props.navigation.goBack();
    }

    showDetails = (item) => {
        this.setState({selectedCareTeamDetails : item, modalOpen: true})
    }

    detailDrawerClose = () => {
        this.setState({selectedCareTeamDetails : null, modalOpen: false})
    };

    navigateToNextScreen = () => {
        // this.props.navigation.navigate(Screens.SOCIAL_DETERMINANTS_SCREEN);
    };

    recommendProvider = async (provider) => {
        let providerId = provider.connectionId;
        await BranchLinksService.recommendProviderProfileLink(
            'facebook',
            providerId
        );
    };

    goToProviderChat = async (provider) => {
        const activeConnection = this.props.connections.activeConnections.find(connection => connection?.connectionId === provider?.connectionId)
        this.detailDrawerClose();
        if(activeConnection){
            if(this.props.chat.sendbirdStatus===2) {
                /* this.props.navigation.navigate(Screens.LIVE_CHAT, {
                     connection: activeConnection,
                 });*/
                const resetAction = StackActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({ routeName: Screens.TAB_VIEW}),
                        NavigationActions.navigate({ routeName: Screens.LIVE_CHAT, params:  {
                                connection: activeConnection
                            }}),
                    ],
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                AlertUtil.showErrorMessage("Please wait until chat service is connected");
            }
        }else{
            AlertUtil.showErrorMessage("Connection is not in active chat");
        }
    };

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };

        this.setState({ modalHeightProps: newLayout });
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading) {
            return <Loader/>
        }
        const userId = this.props.auth.meta.userId;
        const careTeamMembers = this.state.careTeamList;

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                    </Body>
                    <Right/>
                </Header>
                <Content  showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Care team
                        </Text>

                        <Text style={styles.memberCount}>{careTeamMembers.length} members</Text>

                    </View>

                    {careTeamMembers.length > 0 &&
                    <View style={styles.teamWrapper}>
                        <FlatList
                            data={careTeamMembers}
                            renderItem={({item, index}) =>
                                <TouchableOpacity
                                    style={styles.singleTeamItem}
                                    onPress={() => {
                                        this.showDetails(item)
                                    }}
                                >
                                    <View style={styles.teamUpperInfo}>
                                        <View style={styles.teamImgWrap}>
                                            <Image
                                                style={styles.teamImg}
                                                resizeMode={'cover'}
                                                source={{uri: getAvatar(item)}}/>
                                            {/*<View style={styles.statusDot}></View>*/}
                                        </View>
                                        <View style={styles.teamDetails}>
                                            <Text style={styles.infoTitle}>{item.name}</Text>
                                            <Text style={styles.infoContent}>{item.designation}</Text>
                                        </View>
                                        <View style={styles.domainIcon}>
                                            <FeatherIcons size={30} color={Colors.colors.mainBlue}
                                                          name="more-horizontal"/>
                                        </View>
                                    </View>
                                    {this.renderAppointmentView(item)}
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
                    }
                </Content>



                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: this.state.selectedCareTeamDetails?.connectionId !== userId ? '60%': '40%' }}
                    entry={"bottom"}
                    isOpen={this.state.modalOpen}
                    position={"bottom"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    {this.state.selectedCareTeamDetails &&
                    <Content showsVerticalScrollIndicator={false}>
                        <View>
                            <View style={styles.contentWrapper}>
                                <View style={styles.teamImgWrapModal}>
                                    <Image
                                        style={styles.teamImgModal}
                                        resizeMode={'cover'}
                                        source={{uri: getAvatar(this.state.selectedCareTeamDetails)}}/>
                                    {/*<View style={styles.statusDotModal}></View>*/}
                                </View>
                                <View style={styles.teamDetails}>
                                    <Text style={styles.infoTitleModal}>{this.state.selectedCareTeamDetails.name}</Text>
                                    <Text style={styles.infoContentModal}>{this.state.selectedCareTeamDetails.designation}</Text>
                                </View>
                            </View>
                            <View style={styles.actionList}>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        title={'Recommend'}
                                        onPress={()=> {this.recommendProvider(this.state.selectedCareTeamDetails)}}
                                        iconBackground={Colors.colors.warningBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <Fontisto
                                                reversed
                                                name='share-a'
                                                size={22} color={Colors.colors.warningIcon}
                                            />
                                        }
                                    />
                                </View>
                                {this.state.selectedCareTeamDetails.connectionId !== userId && (
                                    <View style={styles.singleActionItem}>
                                        <GenericActionButton
                                            title={'Go To Chat'}
                                            onPress={()=> {this.goToProviderChat(this.state.selectedCareTeamDetails)}}
                                            iconBackground={Colors.colors.primaryColorBG}
                                            styles={styles.gButton}
                                            renderIcon={(size, color) =>
                                                <Icon name={'message-circle'} type={'Feather'} size={22}
                                                      style={{color: Colors.colors.primaryIcon, fontSize: 22}}
                                                />
                                            }
                                        />
                                    </View>
                                )}

                            </View>
                        </View>

                    </Content>
                    }
                </Modal>

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        // paddingTop: 30,
        paddingLeft: 24,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    titleWrap: {
        marginBottom: 16
    },
    memberCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        marginTop: -20
    },
    teamWrapper: {
        marginBottom: 40
    },
    singleTeamItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        marginBottom: 8
    },
    teamUpperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    domainIcon: {

    },
    nextApptWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor:  Colors.colors.mediumContrastBG
    },
    nextApptTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    nextApptDate: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    modalStatus: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    teamImgWrap: {
        width: 48,
        height: 48
    },
    teamImgWrapModal: {
        width: 68,
        height: 68
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    statusDotModal: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 3,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    teamImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    teamImgModal: {
        width: 68,
        height: 68,
        borderRadius: 34
    },
    teamDetails: {
        paddingLeft: 12,
        flex: 1
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoTitleModal: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingLeft: 4
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    infoContentModal: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        paddingLeft: 4
    },
    actionList: {
        marginTop: 24
    },
    singleActionItem: {
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 12,
        marginBottom: 16
    }
});

export default connectConnections()(CareTeamMembersScreen);
