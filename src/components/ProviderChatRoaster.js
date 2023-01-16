import React, {Component} from 'react';
import {AppState, Image, ScrollView, SectionList, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import moment from 'moment';
import {addTestID, ContentLoader, getAvatar, getDSTOffset, isIphoneX, valueExists} from 'ch-mobile-shared';
import LottieView from 'lottie-react-native';
import alfieCan from '../assets/animations/Dog_with_Can';
import {APPOINTMENT_STATUS, CONTACT_NOTES_FLAGS, DEFAULT_AVATAR_COLOR} from '../constants/CommonConstants';
import {Accordion, Icon} from "native-base";
import {TextStyles, CommonStyles, Colors} from "ch-mobile-shared/src/styles";
import {CONNECTION_TYPES} from "ch-mobile-shared/src/constants/CommonConstants";

export class ProviderChatRoaster extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            activeConnectionsVisible: true,
            appState: AppState.currentState,
            isRefreshing: false,
            activeSections: this.props.activeSections,
        };
    }


    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
            if (this.animation1) {
                this.animation1.play();
            }
        }
    };

    _renderHeader = (item, expanded) => {
        return (
            <View style={{
                flexDirection: "row",
                marginBottom: expanded ? 8 : 32,
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Text style={styles.headMainText}>{item.title}</Text>
                <View>
                    {expanded
                        ? <Icon type={'SimpleLineIcons'} style={{fontSize: 18, ...Colors.colors.neutral50Icon}} name="arrow-up"/>
                        : <Icon type={'SimpleLineIcons'} style={{fontSize: 18, ...Colors.colors.neutral50Icon}} name="arrow-down"/>}
                </View>
            </View>
        );
    }


    _renderContent = (item) => {
        return (
            item && item.data.length > 0 ?
                <SectionList
                    style={{ paddingTop: 24}}
                    showsVerticalScrollIndicator={false}
                    sections={[item]}
                    keyExtractor={(item, index) => item + index}
                    refreshing={this.state.isRefreshing}
                    onRefresh={() => {
                        this.props.onRefresh();
                        this.setState({isRefreshing: true});
                        setTimeout(() => {
                            this.setState({isRefreshing: false});
                        }, 3000);
                    }}
                    renderItem={this.renderListItem}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({section: {title, count}}) => null}
                    ListEmptyComponent={this.emptyState}
                /> :
                <View style={styles.noRecordWrapper}>
                    <Text style={styles.noRecordText}>{"No members in " + item.title + " group"}</Text>
                </View>

        );
    }


    renderListItem = ({item, index}) => {
        const appointments = this.props.appointments;
        const requestedAppointment = appointments.filter(appointment => appointment.participantId === item.connectionId && appointment.status === APPOINTMENT_STATUS.PROPOSED)
        const bookedAppointment = appointments.filter(appointment => appointment.participantId === item.connectionId && appointment.status === APPOINTMENT_STATUS.BOOKED )
        let firstAppointmentDate , firstAppointmentTime = '';
        if(bookedAppointment.length > 0 ){
            const firstAppointment = bookedAppointment?.[0];
            firstAppointmentDate = `${moment().month(firstAppointment.month).format("M")}/${firstAppointment?.date}`
            firstAppointmentTime = firstAppointment.startText.replace(":00","");
        }
        const pastAppointments = this.props.allAppointments.pastAppointments.filter(pastAppointment => pastAppointment.participantId === item.connectionId);
        const hasBookedAppt = bookedAppointment?.length >  0;
        const profileHighlightedColor = item?.profileHighlightedColor !== Colors.colors.white ? item.profileHighlightedColor : null;

        return (
                <TouchableOpacity
                    {...addTestID('user-chat-' + (index+1))}
                    activeOpacity={0.8}
                    style={styles.singleItem}
                    onPress={() => {
                        this.props.navigateToConnection(item);
                    }}>
                        <View style={styles.avatarContainer}>
                            {item.profilePicture ?
                                <View style={{
                                    ...styles.proBgBorder,
                                    borderWidth: profileHighlightedColor ? 2 : 0 ,
                                    borderColor: profileHighlightedColor ? profileHighlightedColor : "transparent"
                                }}>
                                    <Image
                                        resizeMode={'cover'}
                                        style={styles.avatarImage} source={{uri: getAvatar(item)}}/>
                                </View>
                                :
                                <View style={{
                                    ...styles.proBgBorder,
                                    borderWidth : profileHighlightedColor ? 2 : 0,
                                    borderColor : profileHighlightedColor ? profileHighlightedColor : "transparent"
                                }}>
                                    <View style={{
                                        ...styles.proBg,
                                        backgroundColor: item.colorCode ? item.colorCode : DEFAULT_AVATAR_COLOR,
                                    }}>
                                        <Text style={styles.proLetter}>{item?.name?.charAt(0).toUpperCase()}</Text></View>
                                </View>

                            }
                        </View>
                        <View style={styles.memberInfo}>
                        <View style={styles.infoTop}>
                            <View style={styles.namesWrapper}>
                                <Text style={styles.nickNameText} numberOfLines={1}>{item?.name + " "}</Text>
                                {(valueExists(item?.firstName) && valueExists(item?.lastName)) && (
                                    <Text style={styles.fullNameText} numberOfLines={1}>{item?.firstName + " " + item?.lastName}</Text>
                                )}
                            </View>
                            <View style={styles.contactMetaContainer}>
                                <View style={styles.contactMetaWrapper}>
                                    {item.lastMessageTimestamp ? (
                                        <Text style={styles.lastMessageTimestamp}>
                                            {/*{moment(item.lastMessageTimestamp).fromNow()}*/}
                                            {moment(item.lastMessageTimestamp).format('h:mma')}
                                        </Text>
                                    ) : null}
                                </View>

                                <View>
                                    {
                                        item.lastMessageUnread ?
                                            <View style={styles.orangeDot}>
                                                <Text style={styles.unreadText}>{/*1*/}</Text>
                                            </View> : null
                                    }
                                    {/*<Button transparent style={styles.launchChatButton}>*/}
                                    {/*  <AntIcon name="right" size={16} color="#25345C" />*/}
                                    {/*</Button>*/}
                                </View>
                            </View>
                        </View>
                        <View style={styles.contact}>
                            <View style={styles.appointmentType}>
                                {
                                    item.lastMessage && (
                                        <Text style={styles.subText} numberOfLines={1}>
                                            {item.lastMessage || ''}
                                        </Text>

                                    )
                                }
                                {
                                    bookedAppointment && bookedAppointment.length >  0 && (
                                        <Text style={{...styles.typeText, color: Colors.colors.successText}} numberOfLines={1}>
                                            {"Appointment " + firstAppointmentDate + ' @ ' + firstAppointmentTime}
                                        </Text>

                                    )
                                }
                                {
                                    pastAppointments && pastAppointments.length >  0 && !hasBookedAppt && requestedAppointment.length < 1 && (
                                        <Text style={{...styles.typeText, color: Colors.colors.primaryText}} numberOfLines={1}>
                                            {pastAppointments.length + ` past appointment${pastAppointments?.length>1?'s':''}`}
                                        </Text>

                                    )
                                }
                                {
                                    requestedAppointment && requestedAppointment.length >  0 && !hasBookedAppt && (
                                        <Text style={{...styles.typeText, color: Colors.colors.warningText}} numberOfLines={1}>
                                            {"Appointment requested"}
                                        </Text>
                                    )
                                }
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
        );
    };

    emptyState = () => {
        let emptyStateMsg = '';
        let emptyStateHead = '';
        switch (this.props.filterType) {
            case
            'ALL'
            :
                emptyStateHead = 'You Have No Chats Right Now';
                emptyStateMsg = 'You do not have any chats available right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
                break;
            case
            'MEMBERS'
            :
                emptyStateHead = 'You Have No Chats with Members';
                emptyStateMsg = 'You don’t have any active chats with members right now. Members are other people like yourself using the Confidant app. If you know someone you’d like to communicate with in Confidant, you can invite them in the Connections section.';
                break;
            case
            'PROVIDERS'
            :
                emptyStateHead = 'You Have No Chats With Providers';
                emptyStateMsg = 'You don’t have any active chats with providers right now. Providers are the doctors, nurses, and therapists you can speak with to help you reach your goals. You can connect directly with your providers or through your matchmaker.';
                break;
            case
            'BOTS'
            :
                emptyStateHead = 'You Have No Active ChatBots';
                emptyStateMsg = 'You do not have any chats available right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
                break;
            default :
                emptyStateHead = 'You Have No Chats Right Now';
                emptyStateMsg = 'You do not have any chats available right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
                break;
        }
        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfieCan}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };


    render() {
        const {activeSegmentId} = this.props;
        const activeInActiveConnections  = this.props.activeSections?.[0]?.data;
        const unReadConnections  = this.props.activeSections?.[1]?.data;
        return (
            <View style={styles.segmentItems}>
                {this.props.isLoading || this.state.isRefreshing ? (
                    <ContentLoader type="chat" numItems="9"/>
                ) : (
                    activeSegmentId !== "members" ?
                    <SectionList
                        showsVerticalScrollIndicator={false}
                        sections={this.props.activeSections}
                        keyExtractor={(item, index) => item + index}
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => {
                            this.props.onRefresh();
                            this.setState({isRefreshing: true});
                            setTimeout(() => {
                                this.setState({isRefreshing: false});
                            }, 3000);
                        }}
                        renderItem={this.renderListItem}
                        stickySectionHeadersEnabled={false}
                        renderSectionHeader={({section: {title, count}}) => null}
                        ListEmptyComponent={this.emptyState}
                    />
                    : <ScrollView
                            style={{flex: 1 }}
                            showsVerticalScrollIndicator={false}
                        >
                        <View >
                            <SectionList
                                style={{ paddingTop: 24}}
                                showsVerticalScrollIndicator={false}
                                sections={unReadConnections}
                                keyExtractor={(item, index) => item + index}
                                refreshing={this.state.isRefreshing}
                                onRefresh={() => {
                                    this.props.onRefresh();
                                    this.setState({isRefreshing: true});
                                    setTimeout(() => {
                                        this.setState({isRefreshing: false});
                                    }, 3000);
                                }}
                                renderItem={this.renderListItem}
                                stickySectionHeadersEnabled={false}
                                renderSectionHeader={({section: {title, count}}) => null}
                                ListEmptyComponent={this.emptyState}
                            />
                        </View>
                        <Accordion
                            dataArray={activeInActiveConnections}
                            animation={true}
                            expanded={0}
                            showsVerticalScrollIndicator={false}
                            style={{borderTopColor: Colors.colors.borderColor, marginBottom: 8}}
                            renderHeader={this._renderHeader}
                            renderContent={(item) => this._renderContent(item)}
                        />
                        </ScrollView>
                )}


            </View>
        );
    }
}

const styles = StyleSheet.create({
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    emptyAnim: {
        width: '100%',
    },
    emptyTextMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0.5,
        lineHeight: 15,
        marginBottom: 20,
    },
    emptyTextDes: {
        color: '#969FA8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
    segmentItems: {
        flex: 1,
        paddingHorizontal: 24,
    },
    singleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 8,
        marginBottom: 32,
    },
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 25,
        borderColor: Colors.colors.borderColor,
        borderWidth: 2,
    },
    contact: {
        flex: 1,
    },
    contactUsername: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    memberInfo:{
        flexDirection: 'column',
        flex: 1,
        marginLeft: 16,
    },
    infoTop:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    namesWrapper:{
      flexDirection: 'row',
      alignItems: 'center',
        // flex: 1,
        maxWidth: '50%',
    },
    appointmentType:{
        flex: 1,
    },
    nickNameText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        paddingRight: 8
    },
    fullNameText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.inputLabel,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    typeText:{
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    contactMetaContainer: {
    },
    contactMetaWrapper: {
    },
    lastMessageTimestamp: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.overlineTextS,
        ...TextStyles.mediaTexts.manropeLight,
    },
    launchChatButton: {
        width: 13,
        height: 20,
        marginLeft: 35,
        paddingLeft: 0,
        paddingTop: 0,
        marginTop: 5,
        marginRight: 12,
    },
    orangeDot: {
        width: 24,
        height: 24,
        backgroundColor: Colors.colors.secondaryColorBG,
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginRight: 5,
    },
    unreadText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    proBgBorder: {
        width: 58,
        height: 58,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "transparent"
    },
    proBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    headMainText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
    },
    noRecordWrapper:{
        paddingTop: 16,
        paddingBottom: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noRecordText:{
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.subTextS,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center'
    },
});
