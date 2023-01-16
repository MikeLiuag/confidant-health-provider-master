import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList, TouchableOpacity, Image} from 'react-native';
import {Button, Left, Right, Body, Container, Content, Header, Text} from 'native-base';
import {HEADER_NORMAL, HEADER_X, isIphoneX, AlertUtil, getAvatar, addTestID, getHeaderHeight} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/FontAwesome';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {connectConnections} from "../../redux";
import ActivityFeedService from "../../services/ActivityFeedService";
import Loader from "../../components/Loader";
import {getTimeDifference, isTimeElapsed} from 'ch-mobile-shared';
import moment from "moment";
import {Screens} from "../../constants/Screens";
import {DEFAULT_AVATAR_COLOR} from "../../constants/CommonConstants";

const HEADER_SIZE = getHeaderHeight();

class UserAppointmentListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const appointmentData = navigation.getParam('appointmentData', null);
        const appointmentType = navigation.getParam('appointmentType', null);
        this.state = {
            isLoading: true,
            appointmentData: appointmentData,
            appointmentType: appointmentType,
            memberAppointmentFeedDetail: [],

        };
    }

    getMemberAppointmentFeed = async ()=>{
        try {
            const recapPeriod = this.state.appointmentData.period;
            const memberId = this.state.appointmentData.memberId;
            const type = this.state.appointmentType;
            const timestamp = moment.utc(this.state.appointmentData.timestamp).format('YYYY-MM-DD');
            let data = await ActivityFeedService.getMemberAppointmentFeed(memberId, timestamp, type,recapPeriod);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            }
            else {
                let tz = this.props.settings.appointments.timezone;
                data = data.sort((a, b) => moment.utc(a.startTime).diff(moment.utc(b.startTime)))
                    .map(appointment => {
                        const startMoment = moment.utc(appointment.startTime).tz(tz);
                        const endMoment = moment.utc(appointment.endTime).tz(tz);
                        appointment.date = startMoment.format("DD");
                        appointment.month = startMoment.format("MMM");
                        appointment.startText = startMoment.format("h:mm a");
                        appointment.endText = endMoment.format("h:mm a");
                        appointment.profilePicture = appointment.participantImage;
                        appointment.avatar = appointment.participantImage?getAvatar(appointment):null;
                        appointment.timeDifference = getTimeDifference(appointment.startTime);
                        return appointment;
                    });
                this.setState({memberAppointmentFeedDetail: data, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    }

    async componentDidMount(): void {
        await this.getMemberAppointmentFeed();
    }

    isMissed = (item) => {
        return moment.utc(item.endTime).diff(moment(), 'minutes') < 0;
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToSessionNotesScreen = (item) => {
        if (item.status === "FULFILLED") {
            this.props.navigation.navigate(Screens.SESSION_NOTES_SCREEN, {
                appointmentId:item.appointmentId,
                sessionCost:item.serviceCost,
                status: item.status,
            });
        }
    };

    findAvatarColorCode = (connectionId)=>{

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId ===connectionId);
        if(connection && connection.length<1){
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId ===connectionId);
        }
        return connection && connection.length>0 && connection[0].colorCode?connection[0].colorCode:DEFAULT_AVATAR_COLOR;
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>
        }
        console.log(this.state)
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
                        <Body/>
                        <Right/>
                    </Header>
                    <Content contentContainerStyle={{paddingBottom: 40}}>
                        <View
                            {...addTestID('appointment-data')}
                            style={styles.userInfoBox}>


                            {this.state.appointmentData.profilePic?
                                <Image
                                    style={styles.userImg}
                                    source={{uri: this.state.appointmentData.profilePic}}/>
                                :
                                <View style={{
                                    ...styles.proBgMain,
                                    backgroundColor: this.findAvatarColorCode(this.state.appointmentData.memberId)
                                }}><Text
                                    style={styles.proLetterMain}>{this.state.appointmentData.memberName.charAt(0).toUpperCase()}</Text></View>
                            }

                            <Text style={styles.userName}>{this.state.appointmentData.memberName}</Text>
                            <Text
                                style={styles.convoCount}>{this.state.appointmentData.count} {this.state.appointmentType}
                                {' '}Appointment{this.state.appointmentData.count > 1 ? 's' : ''}</Text>
                        </View>
                        <FlatList
                            data={this.state.memberAppointmentFeedDetail}
                            style={styles.apptList}
                            renderItem={({item, index}) =>
                                <TouchableOpacity
                                    {...addTestID('user-appointment- ' + (index+1))}
                                    key={index}
                                                  onPress={() => this.navigateToSessionNotesScreen(item)}
                                >
                                    <View style={styles.singleAppt}>
                                        <View style={styles.leftSide}>
                                            <Text style={styles.pdate}>{item.date}</Text>
                                            <Text style={styles.pmonth}>{item.month}</Text>
                                            <View style={styles.timeBox}>
                                                <Text style={styles.ptime}>{item.startText}</Text>
                                                <AntIcon
                                                    style={styles.arrow}
                                                    name="arrowdown" color="#b3bec9" size={20}/>
                                                <Text style={styles.ptime}>{item.endText}</Text>
                                            </View>

                                        </View>
                                        <View style={styles.rightSide}>
                                            <View style={styles.topRow}>
                                                {item.avatar?
                                                    <Image
                                                        style={styles.proImage}
                                                        resizeMode="cover"
                                                        source={{uri: item.avatar}}/>
                                                    :
                                                    <View style={{
                                                        ...styles.proBg,
                                                        backgroundColor: this.findAvatarColorCode(item.participantId)
                                                    }}><Text
                                                        style={styles.proLetter}>{item.participantName.charAt(0).toUpperCase()}</Text></View>
                                                }

                                                <View style={styles.proDetails}>
                                                    <Text style={styles.proName}
                                                          numberOfLines={1}>{item.participantName}</Text>
                                                    <Text style={styles.proDes}
                                                          numberOfLines={2}>{item.serviceName}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.btnRow}>
                                                {item.status === 'BOOKED' && isTimeElapsed(item.startTime) && !this.isMissed(item) && (
                                                    <View style={styles.completedInfo}>
                                                        <Text style={styles.proName}>{moment.utc(item.startTime).format('MMMM D YYYY')}</Text>
                                                    </View>
                                                )}
                                                {item.status === 'BOOKED' && this.isMissed(item) && (
                                                    <View style={{
                                                        ...styles.awaitingBtn,
                                                        backgroundColor: 'rgba(0,0,0,0.05)'
                                                    }}
                                                          disabled={true}>
                                                        <Text style={{
                                                            ...styles.awaitingText,
                                                            color: 'rgba(12,9,10,0.59)'
                                                        }}>You missed
                                                            it</Text>
                                                    </View>
                                                )}
                                                {item.status === 'BOOKED' && !isTimeElapsed(item.startTime) && (
                                                    <View style={styles.completedInfo}>
                                                        {item.timeDifference.days > 0 && (
                                                            <Text
                                                                style={styles.green}>{item.timeDifference.days + ' '}<Text
                                                                style={styles.grey}>Days</Text></Text>)}
                                                        <Text
                                                            style={styles.green}>{item.timeDifference.hours + ' '}<Text
                                                            style={styles.grey}>Hrs</Text></Text>
                                                        <Text
                                                            style={styles.green}>{item.timeDifference.minutes + ' '}<Text
                                                            style={styles.grey}>Mins</Text></Text>
                                                        {item.timeDifference.days <= 0 && (
                                                            <Text
                                                                style={styles.green}>{item.timeDifference.seconds + ' '}<Text
                                                                style={styles.grey}>Sec</Text></Text>)}
                                                    </View>
                                                )}
                                                {item.status === "FULFILLED" && (
                                                    <View style={styles.completedInfo}>
                                                        <Text style={styles.proName}>{moment.utc(item.endTime).format('MMMM D YYYY')}</Text>
                                                    </View>
                                                )}
                                                {item.status === 'CANCELLED' && (
                                                    <View style={{...styles.awaitingBtn, backgroundColor: 'rgba(100,108,115,0.05)'}}
                                                          disabled={true}>
                                                        <Text style={{...styles.awaitingText, color: '#646c73'}}>Cancelled</Text>
                                                    </View>
                                                )}

                                                {item.status === 'PROPOSED' && (
                                                    <View style={{...styles.awaitingBtn, backgroundColor: 'rgba(0,146,241,0.05)'}}
                                                          disabled={true}>
                                                        <Text style={{...styles.awaitingText, color: '#0092f1'}}>Awaiting
                                                            Confirmation</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>


                                    </View>
                                </TouchableOpacity>

                            }
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Content>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        backgroundColor: '#fff',
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },
    headerTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    userInfoBox: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    userImg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 24,
        backgroundColor: 'rgba(63,178,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    userName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 1,
        color: '#25345c',
        textAlign: 'center',
        marginBottom: 8
    },
    convoCount: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.5,
        color: '#515d7d',
        textAlign: 'center',
    },
    apptList: {
        padding: 24
    },
    singleAppt: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 3,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        borderLeftColor: '#77c70b',
        borderBottomColor: '#fff',
        borderTopColor: '#fff',
        marginBottom: 16,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 3,
    },
    leftSide: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        padding: 16,
        borderRightWidth: 1,
        borderRightColor: '#f5f5f5',
    },
    pdate: {
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        letterSpacing: 0,
        lineHeight: 20,
        color: '#25345c',
        marginBottom: 9,
    },
    pmonth: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 12,
        letterSpacing: 0.5,
        lineHeight: 13,
        color: '#969fa8',
        marginBottom: 16,
    },
    ptime: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 15,
        color: '#515d7d',
    },
    arrow: {
        marginTop: 8,
        marginBottom: 8,
    },
    timeBox: {
        alignItems: 'center',
    },
    rightSide: {
        flex: 1,
    },
    topRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        flexDirection: 'row',
        flex: 1,
        padding: 16,
    },
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',
    },

    proBgMain:{
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 24,
        backgroundColor: 'rgba(63,178,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },

    proLetterMain: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    proDetails: {
        justifyContent: 'center',
        paddingLeft: 16,
        flex: 1,
    },
    proName: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    proDes: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.3,
    },
    btnRow: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        flex: 1,
    },
    completedInfo: {
        flexDirection: 'row',
        height: 24,
    },
    green: {
        color: '#77c70b',
        fontFamily: 'Roboto-Bold',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
        paddingLeft: 10,
        paddingRight: 10,
    },
    grey: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        letterSpacing: 0.3,
        paddingLeft: 8,
    },
    sessionBtn: {
        backgroundColor: '#77c70b',
        height: 40,
        borderRadius: 4,
        minWidth: 195,
        justifyContent: 'center',
    },
    awaitingBtn: {
        backgroundColor: 'rgba(59,207,255,0.65)',
        height: 40,
        borderRadius: 24,
        minWidth: 195,
        justifyContent: 'center',
    },
    sessionText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0.7,
        color: '#fff',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    awaitingText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.7,
        color: '#fff',
        alignSelf: 'center',
    },
    confirmBtn: {
        height: 40,
        borderRadius: 4,
        minWidth: 195,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default connectConnections()(UserAppointmentListScreen);
