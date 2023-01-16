import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, Platform, TouchableOpacity, Linking} from 'react-native';
import {Container, Content, Text, View, Button, Left, Body, Title, Right, Header, Icon} from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    getAvatar,
    AlertUtil, isTimeElapsed, valueExists, getHeaderHeight, SocketClient
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import FeatherIcons from 'react-native-vector-icons/Feather';
import {getTimeDifference, getTimeByDSTOffset} from 'ch-mobile-shared/src/utilities/CommonUtils'
import { connectConnections} from '../../redux'
import EntypoIcons from "react-native-vector-icons/Entypo";
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import AntIcons from "react-native-vector-icons/AntDesign";
import Modal from "react-native-modalbox";
import AppointmentService from "../../services/AppointmentService";
import Loader from "../../components/Loader";
import AuthStore from "../../utilities/AuthStore";
import moment from "moment";
import momentTimeZone from "moment-timezone";
const HEADER_SIZE = getHeaderHeight();
class ApptOverviewScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null),
        this.sessionId = navigation.getParam('sessionId', null);
        this.token = navigation.getParam('token', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.sessionStarted = navigation.getParam('sessionStarted', null);
        this.encounterId = navigation.getParam('encounterId', null);
        this.groupCall = navigation.getParam('groupCall', false);
        this.connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: false
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.PAST_APPOINTMENT_LIST_SCREEN, {
            connection : this.connection
        });
    };


    componentDidMount(): void {
        if (this.appointment.status === 'BOOKED') {
            this.iv = setInterval(() => {
                this.setState({
                    ...this.state,
                });
            }, 1000);
        }
    }


    componentWillUnmount(): void {
        if (this.iv) {
            clearInterval(this.iv);
            this.iv = null;
        }
    }

    markAsNoShow = async ()=>{
        this.setState({
            isLoading: true
        });
        const response = await AppointmentService.cancelAppointment(this.appointment.appointmentId, 'NO_SHOW');
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({ isLoading: false });
        } else {
            AlertUtil.showSuccessMessage("Appointment cancelled");
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }
    };



    gotoChatWithMatchmaker = (matchmakerId)=>{
        const connection = this.props.connections.activeConnections.filter(connection=>connection.connectionId===matchmakerId)[0];
        if(connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: connection,
            });
        } else {
            AlertUtil.showErrorMessage("Cannot start chat, participant isn't connected");
        }

    };

    completeViaPhone = async ()=>{
        this.setState({isLoading: true});
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit('fullfil-appointment', {
                appointmentId: this.appointment.appointmentId,
                from: {
                    userId: this.props?.auth.meta.userId,
                },
                authToken: await AuthStore.getAuthToken(),
            });

        }
        const response = AppointmentService.completeAppointment(this.appointment.appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            const { appointment} = this;
            const { participantId, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment } = appointment;
            const segmentSessionCompletedPayload = {
                userId: this.props?.auth?.meta?.userId,
                providerId: participantId,
                startTime: startTime,
                endTime: endTime,
                appointmentName: serviceName,
                appointmentDuration: serviceDuration,
                appointmentCost: serviceCost,
                paymentAmount: prePayment.amountPaid,
                completedAt: moment.utc(Date.now()).format(),
                completionMethod: 'Via Phone',
                isProviderApp : true
            };

            this.props.navigation.replace(Screens.RATE_CALL_QUALITY_SCREEN, {
                appointment,
                referrerScreen: this.referrerScreen,
                completedAt: moment.utc(Date.now()).format(),
                segmentSessionCompletedPayload: segmentSessionCompletedPayload,
                completedViaPhone: true
            });
        }
    }

    closeActionMenu = () => {
        this.setState({
            actionMenu: false
        })
    };

    getDSTOffsetDetails = (time)=>{
        const tz = this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true);
        let apptStartTime;
        let dateAfterDSTOffset = getTimeByDSTOffset(time).utcOffset();
        let dateBeforeDSTOffset = moment(time).utcOffset();
        if(dateAfterDSTOffset === dateBeforeDSTOffset){
            apptStartTime =  moment(time).format('YYYY-MM-DDTHH:mm:ss.sssZ');
        }
        else if(dateAfterDSTOffset<dateBeforeDSTOffset){
            apptStartTime =  moment(time).subtract(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
        }else{
            apptStartTime =  moment(time).add(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
        }
        return apptStartTime;
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading) {
            return <Loader/>
        }
        const startTime = this.getDSTOffsetDetails(moment(this.appointment?.startTime,'YYYY-MM-DDTHH:mm:ss.sssZ').format('YYYY-MM-DDTHH:mm:ss.sssZ'));
        const timeDifference = getTimeDifference(startTime);
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Header transparent noShadow={false}
                        style={styles.headerWrap}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <Button
                            onPress={this.backClicked}
                            transparent
                            style={styles.backButton}>
                            <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                        </Button>
                    </Left>
                    <Body style={styles.bodyWrap}>
                        <Title style={styles.headerTitle}>Appointment Overview</Title>
                    </Body>
                    <Right>
                        <Button transparent
                                onPress={()=>{this.setState({actionMenu: true})}}>
                            <Icon name={'more-horizontal'} type={'Feather'} style={styles.moreIcon}/>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <View style={styles.imgWrapper}>
                        <View style={styles.colorImgBG}>
                            <Image
                                {...addTestID('profile-image')}
                                style={styles.patientImg}
                                resizeMode={'cover'}
                                source={{uri: getAvatar({profilePicture: this.appointment.profilePicture})}}
                                />
                            <View style={styles.statusDot}/>

                        </View>
                        <Text style={styles.providerTitle}>{this.appointment.participantName}</Text>
                    </View>

                    <View style={styles.highlightBox}>
                        <View style={styles.innerWrap}>
                            <Text style={styles.highlightText}>{this.appointment.serviceName}</Text>
                            {
                                isTimeElapsed(startTime) ? (
                                    <Text style={styles.highlightTimer}>Session Time Started</Text>
                                ): (
                                    <Text style={styles.highlightTimer}>
                                        {timeDifference.days > 0 && (
                                            <Text
                                                style={styles.pink}>{timeDifference.days + 'd : '}</Text>)}
                                        {timeDifference.hours >= 0 && (
                                            <Text style={styles.pink}>{timeDifference.hours + 'h : '}</Text>
                                        )}
                                        {timeDifference.minutes >= 0 && (
                                            <Text style={styles.pink}>{timeDifference.minutes}m</Text>
                                        )}
                                        {timeDifference.days <= 0 && timeDifference.seconds > 0 && (

                                            <Text style={styles.pink}> : {timeDifference.seconds}s</Text>)}

                                    </Text>
                                )
                            }

                        </View>
                    </View>

                    <View style={styles.patientDetails}>
                        <View style={styles.singlePatientInfo}>
                            <View>
                                <Text style={styles.infoTitle}>Primary reason for appointment</Text>
                                <Text style={styles.infoContent}>{valueExists(this.appointment.primaryConcern)?this.appointment.primaryConcern: 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.singlePatientInfo}>
                            <View>
                                <Text style={styles.infoTitle}>Matchmaker</Text>
                                <Text style={styles.infoContent}>{this.connection.matchMakerName ? this.connection.matchMakerName : 'N/A'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => this.connection.matchMakerId ? this.gotoChatWithMatchmaker(this.connection.matchMakerId) : null}>
                            <View style={styles.iconWrap}>
                                <FeatherIcons size={25} color={Colors.colors.primaryText} name="message-circle" />
                            </View>
                            </TouchableOpacity>

                        </View>

                        <View style={[styles.singlePatientInfo, {  borderBottomWidth: 0}]}>
                            <View>
                                <Text style={styles.infoTitle}>Phone number</Text>
                                <Text style={styles.infoContent}>{this.connection.phone ? this.connection.phone : 'N/A'}</Text>
                            </View>
                            {this.connection.phone &&
                            <TouchableOpacity onPress={() => {
                                Linking.openURL(`tel:${this.connection.phone}`)
                            }}>
                                <View style={styles.iconWrap}>
                                    <FeatherIcons size={25} color={Colors.colors.primaryText} name="phone-call"/>
                                </View>
                            </TouchableOpacity>

                            }

                        </View>

                    </View>
                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId = "continue"
                        onPress={() => {this.navigateToNextScreen();}}
                        text="Continue"
                    />
                </View>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.closeActionMenu}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '30%',
                    }}
                    isOpen={this.state.actionMenu}
                    entry={'bottom'}
                    position={'bottom'} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View
                            // onLayout={(event) => this.onLayout(event)}
                            style={styles.bookActionList}>


                                    <View style={styles.singleAction}>
                                        <TransactionSingleActionItem
                                            title={'Mark as No Show'}
                                            iconBackground={Colors.colors.errorBG}
                                            styles={styles.gButton}
                                            onPress={this.markAsNoShow}
                                            renderIcon={(size, color) =>
                                                <AntIcons size={22} color={Colors.colors.errorIcon} name="closecircleo"/>
                                            }
                                        />
                                    </View>

                            <View style={styles.singleAction}>
                                <TransactionSingleActionItem
                                    title={`Completed via Phone Call`}
                                    iconBackground={Colors.colors.secondaryColorBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.secondaryIcon} name="phone-call"/>
                                    }
                                    onPress={this.completeViaPhone}
                                />
                            </View>

                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 18,
        paddingRight: 18,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        width: 35,
        paddingLeft: 0,
        paddingRight: 0
    },
    bodyWrap: {
        flex: 4,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    headerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        flex: 1
    },
    imgWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorImgBG: {
        width: 112,
        height: 112,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Colors.colors.shadowColor,
        marginBottom: 16,
        marginTop: 20,
        position: 'relative'
    },
    patientImg: {
        width: 112,
        height: 112,
        borderRadius: 95,
    },
    statusDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 4,
        position: 'absolute',
        bottom: 5,
        right: 8
    },
    providerTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        marginBottom: 4
    },
    providerRole: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM
    },
    highlightBox: {
        paddingHorizontal: 24,
        marginVertical: 32
    },
    innerWrap: {
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.colors.mainPink40,
        paddingHorizontal: 30,
        paddingVertical: 16
    },
    highlightText: {
        textAlign: 'center',
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 4
    },
    highlightTimer: {
        textAlign: 'center'
    },
    pink: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3
    },
    patientDetails: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 40
    },
    singlePatientInfo: {
        borderBottomColor: Colors.colors.borderColor,
        borderBottomWidth: 1,
        paddingBottom: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 4
    },
    moreIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30,
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS
    },
    iconWrap: {
        backgroundColor: Colors.colors.primaryColorBG,
        borderRadius: 8,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        ...CommonStyles.styles.stickyShadow
    },
    bookActionList: {},
    singleAction: {
        marginBottom: 16,
    },
});

export default connectConnections()(ApptOverviewScreen);

