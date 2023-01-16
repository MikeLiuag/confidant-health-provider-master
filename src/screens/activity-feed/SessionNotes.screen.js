import React, {Component} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Segment, Text, Title} from 'native-base';
import {addTestID, AlertUtil, DEFAULT_IMAGE, getAvatar, getHeaderHeight} from "ch-mobile-shared";
import {Rating} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from "react-native-linear-gradient";
import Anticon from 'react-native-vector-icons/AntDesign';
import Loader from "../../components/Loader";
import ActivityFeedService from "../../services/ActivityFeedService";
import moment from "moment";
import {connectConnections} from "../../redux";
import ProfileService from "../../services/ProfileService";
import {DEFAULT_AVATAR_COLOR, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {Screens} from "../../constants/Screens";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";

const HEADER_SIZE = getHeaderHeight();

class SessionNotesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointmentId = navigation.getParam('appointmentId', null);
        const sessionCost = navigation.getParam('sessionCost', null);
        this.state = {
            sessionFeedDetail: null,
            activeSegment1: true,
            activeSegment2: false,
            isLoading: true,
            sessionCost: sessionCost,
        };
    }


    getProviderInfo = async (providerId) => {
        const provider = await ProfileService.getProviderProfile(providerId);
        if (provider.errors) {
            console.log(provider.errors[0].endUserMessage);
        } else {
            return provider;
        }
    };

    getSessionCost = () => {
        let sessionCostDecimal = this.state.sessionCost.toString().indexOf('.') > -1;
        if (sessionCostDecimal) {
            let sessionCost = this.state.sessionCost.toString().split('.');
            if (parseInt(sessionCost[1]) < 1) {
                this.setState({sessionCost: sessionCost[0]});
            }
        }
    }

    getAppointmentDetailFeed = async () => {
        if (this.state.sessionCost !== null && this.state.sessionCost > 0) {
            this.getSessionCost();
        }
        try {
            let data = await ActivityFeedService.getAppointmentDetailFeed(this.appointmentId);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            } else {
                const provider = this.findConnectionDetails(data.providerId);
                const member = this.findConnectionDetails(data.memberId);
                if (member.length > 0) {
                    data.memberProfilePic = member[0].profilePicture ? getAvatar({profilePicture: member[0].profilePicture}) : null;
                    if (!data.memberProfilePic) {
                        data.memberColorCode = member[0].colorCode ? member[0].colorCode : DEFAULT_AVATAR_COLOR;
                    }
                }
                if (provider.length > 0) {
                    data.providerProfilePic = provider[0].profilePicture ? getAvatar({profilePicture: provider[0].profilePicture}) : null;
                    if (!data.providerProfilePic) {
                        data.providerColorCode = provider[0].colorCode ? provider[0].colorCode : DEFAULT_AVATAR_COLOR;
                    }
                } else {
                    let provider = await this.getProviderInfo(data.providerId);
                    if (provider) {
                        data.providerProfilePic = provider.profileImage ? getAvatar({profilePicture: provider.profileImage}) : null;
                        if (!data.providerProfilePic) {
                            data.providerColorCode = DEFAULT_AVATAR_COLOR;
                        }
                    }
                }
                this.setState({sessionFeedDetail: data, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }

    }


    async componentDidMount(): void {
        await this.getAppointmentDetailFeed();
    }

    findConnectionDetails = (connectionId) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }

        return connection;
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    getDurationText = (duration) => {
        const minText = ' minute';
        const hourText = ' Hour';
        if (duration < 60) {
            let getMintText = duration === 1 ? minText : minText + 's';
            return duration + getMintText;
        }
        const hour = parseInt(duration / 60);
        const min = duration % 60;
        let text = hour + hourText;
        if (min > 0) {
            let getMintText = min === 1 ? minText : minText + 's';
            text = text + ' ' + min + getMintText;
        }
        return text;
    };


    showConnectionProfile = (connectionId) => {
        this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
            providerId: connectionId,
            type: "PRACTITIONER",
        });
    };


    findConnection = (connectionId, connections) => {
        const filtered = connections.filter(conn => conn.connectionId === connectionId);
        if (filtered.length > 0) {
            return filtered[0];
        }

    }

    navigateToChatScreen = (connectionId, type) => {

        let connection = this.findConnection(connectionId, this.props.connections.activeConnections);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: {...connection, profilePicture: getAvatar(connection)},
                referrer: Screens.SESSION_NOTES_SCREEN
            });
        } else {
            if (type === 'PRACTITIONER') {
                this.showConnectionProfile(connectionId);
            } else {
                AlertUtil.showErrorMessage("Cannot start chat,member isn't connected");
            }
        }
    };

    emptyState = () => {
        let emptyStateMsg = 'You do not have any record right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>

                <Text style={styles.emptyTextMain}>You Have No Record</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>
        }

        const isFulFilled = this.state.sessionFeedDetail && this.state.sessionFeedDetail.appointmentStatus && this.state.sessionFeedDetail.appointmentStatus === 'FULFILLED';
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#F7F9FF', '#F7F9FF']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <Left>
                            <Button
                                {...addTestID('back')}
                                onPress={this.backClicked}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body style={{flex: 2}}>
                            <Title
                                {...addTestID('session-notes')}
                                style={styles.headTitle}>Session Notes</Title>
                        </Body>
                        <Right/>
                    </Header>
                    {this.state.sessionFeedDetail ?
                        <Content
                            {...addTestID('session-feed-detail-content')}
                        >
                            <View style={styles.sessionInfo}
                            >
                                <Text
                                    {...addTestID('tele-session-text')}
                                    style={styles.sessionTitle}>Telehealth Session</Text>
                                <Text
                                    style={styles.sessionDuration}>{this.getDurationText(this.state.sessionFeedDetail.serviceDuration)}</Text>
                                <Text
                                    style={styles.sessionTime}>{moment.utc(this.state.sessionFeedDetail.serviceDate).format('dddd, MMMM D, YYYY')}</Text>
                                <View style={styles.ratingWrapper}>
                                    <Rating
                                        readonly
                                        type="star"
                                        showRating={false}
                                        ratingCount={5}
                                        imageSize={25}
                                        selectedColor={'#ffca00'}
                                        startingValue={this.state.sessionFeedDetail.memberFeedback && this.state.sessionFeedDetail.memberFeedback.rating ? this.state.sessionFeedDetail.memberFeedback.rating : 0}
                                        fractions={2}
                                    />
                                </View>
                            </View>
                            <View

                                style={styles.memberInfo}>
                                <View style={styles.singleMember}>
                                    {this.state.sessionFeedDetail.memberProfilePic ?
                                        <Image
                                            source={{uri: this.state.sessionFeedDetail.memberProfilePic ? this.state.sessionFeedDetail.memberProfilePic : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                            resizeMode={'cover'}
                                            style={styles.memImg}
                                        />
                                        :
                                        <View style={{
                                            ...styles.proBg,
                                            backgroundColor: this.state.sessionFeedDetail.memberColorCode
                                        }}><Text
                                            style={styles.proLetter}>{this.state.sessionFeedDetail.memberName.charAt(0).toUpperCase()}</Text></View>
                                    }

                                    <View style={styles.textWrap}>
                                        <Text style={styles.memName}
                                              numberOfLines={2}>{this.state.sessionFeedDetail.memberName ? this.state.sessionFeedDetail.memberName : ''}</Text>
                                    </View>
                                    <View style={styles.iconWrap}>
                                        <MaterialIcon
                                            onPress={() => this.navigateToChatScreen(this.state.sessionFeedDetail.memberId, 'PATIENT')}
                                            name="chat-processing" size={25} color="#4FACFE"/>
                                    </View>
                                </View>
                                <View style={styles.singleMember}>
                                    {this.state.sessionFeedDetail.providerProfilePic ?
                                        <Image
                                            source={{uri: this.state.sessionFeedDetail.providerProfilePic}}
                                            resizeMode={'cover'}
                                            style={styles.memImg}
                                        />
                                        :
                                        <View style={{
                                            ...styles.proBg,
                                            backgroundColor: this.state.sessionFeedDetail.providerColorCode
                                        }}><Text
                                            style={styles.proLetter}>{this.state.sessionFeedDetail.providerName.charAt(0).toUpperCase()}</Text></View>
                                    }
                                    <View style={styles.textWrap}>
                                        <Text style={styles.memName}
                                              numberOfLines={2}>{this.state.sessionFeedDetail.providerName ? this.state.sessionFeedDetail.providerName : ''}</Text>
                                    </View>
                                    <View style={styles.iconWrap}>
                                        <MaterialIcon
                                            onPress={() => this.navigateToChatScreen(this.state.sessionFeedDetail.providerId, 'PRACTITIONER')}
                                            name="chat-processing" size={25} color="#4FACFE"/>
                                    </View>
                                </View>
                            </View>
                            <Segment>
                                <Button
                                    {...addTestID('member-feedback')}
                                    first active
                                    onPress={() => {
                                        this.setState({
                                            activeSegment1: true,
                                            activeSegment2: false,
                                        })
                                    }}
                                    style={this.state.activeSegment1 ? {
                                        ...styles.segmentTabBtn,
                                        backgroundColor: '#3fb2fe'
                                    } : styles.segmentTabBtn}
                                >
                                    <Text uppercase={false}
                                          style={this.state.activeSegment1 ? {
                                              ...styles.segmentTabText,
                                              color: '#fff'
                                          } : styles.segmentTabText}>Member Feedback</Text>
                                </Button>
                                <Button
                                    {...addTestID('provider-feedback')}
                                    last
                                    onPress={() => {
                                        this.setState({
                                            activeSegment1: false,
                                            activeSegment2: true,
                                        })
                                    }}
                                    style={this.state.activeSegment2 ? {
                                        ...styles.segmentTabBtn,
                                        backgroundColor: '#3fb2fe'
                                    } : styles.segmentTabBtn}
                                >
                                    <Text uppercase={false}
                                          style={this.state.activeSegment2 ? {
                                              ...styles.segmentTabText,
                                              color: '#fff'
                                          } : styles.segmentTabText}>Provider Feedback</Text>
                                </Button>
                            </Segment>
                            <View style={styles.segmentBody}>
                                {
                                    this.state.activeSegment1 && this.state.sessionFeedDetail && (
                                        <View style={styles.memberFeedback}>
                                            <View style={styles.singleFeedItem}>
                                                <View style={styles.feedIcoWrap}>
                                                    <Anticon name="message1" size={20} color="#4FACFE"/>
                                                </View>
                                                <View style={styles.feedTextWrap}>
                                                    <Text style={styles.feedMainText}>Public Feedback:</Text>
                                                    <Text
                                                        style={styles.feedSubText}>{(this.state.sessionFeedDetail.memberFeedback !== null && this.state.sessionFeedDetail.memberFeedback.publicComment) ? this.state.sessionFeedDetail.memberFeedback.publicComment : 'No public comment'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.singleFeedItem}>
                                                <View style={styles.feedIcoWrap}>
                                                    <Anticon name="message1" size={20} color="#4FACFE"/>
                                                </View>
                                                <View style={styles.feedTextWrap}>
                                                    <Text style={styles.feedMainText}>Private Feedback:</Text>
                                                    <Text
                                                        style={styles.feedSubText}>{(this.state.sessionFeedDetail.memberFeedback !== null && this.state.sessionFeedDetail.memberFeedback.privateFeedback) ? this.state.sessionFeedDetail.memberFeedback.privateFeedback : 'No private feedback'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                }
                                {this.state.activeSegment2 && this.state.sessionFeedDetail && (
                                    <View style={styles.proFeedback}>
                                        <View style={styles.singleFeedItem}>
                                            <View style={styles.feedTextWrap}>
                                                <Text style={styles.feedMainText}>Call quality</Text>
                                                {(this.state.sessionFeedDetail.providerFeedback !== null && this.state.sessionFeedDetail.providerFeedback.sessionQuality)
                                                    ? <View>
                                                        <Text style={styles.feedSubText}>
                                                            {this.state.sessionFeedDetail.providerFeedback.sessionQuality.connectionIssues
                                                                ? 'Connection issues'
                                                                : 'No connection issues'}</Text>
                                                        <Text style={styles.feedSubText}>
                                                            {this.state.sessionFeedDetail.providerFeedback.sessionQuality.reminderIssues
                                                                ? 'Reminder issues'
                                                                : 'No reminder issues'}
                                                        </Text>
                                                        <Text style={styles.feedSubText}>
                                                            {this.state.sessionFeedDetail.providerFeedback.sessionQuality.communicationIssues
                                                                ? 'Communication issues'
                                                                : 'No communication issues'}
                                                        </Text>
                                                    </View>
                                                    : <Text style={styles.feedSubText}>Call quality issues not provided</Text>}
                                            </View>
                                        </View>
                                        <View style={styles.singleFeedItem}>
                                            <View style={styles.feedTextWrap}>
                                                <Text style={styles.feedMainText}>Additional Feedback</Text>
                                                {(this.state.sessionFeedDetail.providerFeedback !== null && this.state.sessionFeedDetail.providerFeedback.sessionQuality) ?
                                                <View>
                                                    <Text style={styles.feedSubText}>{this.state.sessionFeedDetail.providerFeedback.sessionQuality.qualityFeedback ? this.state.sessionFeedDetail.providerFeedback.sessionQuality.qualityFeedback:'No additional feedback provided'}</Text>
                                                </View>
                                                :
                                                    <View>
                                                        <Text style={styles.feedSubText}>No additional feedback provided</Text>
                                                    </View>
                                                }
                                            </View>
                                        </View>

                                    </View>
                                )
                                }

                            </View>
                        </Content>
                        :
                        this.emptyState()
                    }
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#fff',
        borderBottomWidth: 1
    },
    headTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },
    sessionInfo: {
        alignItems: 'center',
        paddingTop: 35,
        paddingBottom: 35,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fff'
    },
    sessionTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        letterSpacing: 1,
        fontSize: 24,
        lineHeight: 32,
        marginBottom: 24
    },
    sessionDuration: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8
    },
    sessionTime: {
        fontFamily: 'Roboto-Regular',
        color: '#515D7D',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginBottom: 16
    },
    ratingWrapper: {},
    memberInfo: {
        borderTopColor: '#F5F5F5',
        borderTopWidth: 1,
        marginBottom: 40,
    },
    singleMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 30,
        overflow: 'hidden'

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    memImg: {
        width: 40,
        height: 40,
        borderRadius: 30,
        overflow: 'hidden'
    },
    textWrap: {
        flex: 2,
        justifyContent: 'center'
    },
    memName: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 14,
        lineHeight: 20,
        paddingLeft: 16
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderColor: '#3FB2FE',
        borderWidth: 2,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    segmentTabBtn: {
        backgroundColor: '#fff',
        width: 150,
        borderRadius: 8,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 64,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0
    },
    segmentTabText: {
        color: '#515D7D',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 0.54,
        textAlign: 'center'
    },
    segmentBody: {
        paddingTop: 30
    },
    memberFeedback: {},
    singleFeedItem: {
        flexDirection: 'row',
        // alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        padding: 24,
    },
    feedIcoWrap: {
        backgroundColor: 'rgba(63,178,254,0.1)',
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    feedTextWrap: {
        flex: 2,
        paddingLeft: 16
    },
    feedMainText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        marginBottom: 8
    },
    feedSubText: {
        fontFamily: 'Roboto-Regular',
        color: '#646c73',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.2
    },

    proFeedback: {},
    costColorPaid: {
        color: '#77c70b'
    },
    costColorUnPaid: {
        color: '#FF0000'
    },

    costValue: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 16
    },

    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 30,
        paddingLeft: 20
    },
    emptyTextMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 15,
        marginBottom: 20
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
});


export default connectConnections()(SessionNotesScreen);
