import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList, TouchableOpacity, Platform, Image} from 'react-native';
import {Button, Left, Right, Body, Title, Container, Content, Header, Text} from 'native-base';
import {addTestID, AlertUtil, AlfieLoader, getAvatar, HEADER_NORMAL, HEADER_X, isIphoneX, getHeaderHeight} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import {Screens} from '../../constants/Screens';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityFeedService from "../../services/ActivityFeedService";
import {connectConnections} from "../../redux";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";
import LottieView from "lottie-react-native";
import {DEFAULT_AVATAR_COLOR} from "../../constants/CommonConstants";
import moment from "moment";

const HEADER_SIZE = getHeaderHeight();

class AppointmentFeedListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const appointmentType = navigation.getParam('appointmentType', null);
        const recapPeriod = navigation.getParam('recapPeriod', null);
        const timestamp = navigation.getParam('timestamp', null);

        this.state = {
            appointmentList: [],
            isLoading: true,
            appointmentType: appointmentType,
            recapPeriod: recapPeriod,
            timestamp: timestamp,
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    getAppointmentFeed = async () => {
        try {
            const {recapPeriod, appointmentType} = this.state;
            const timestamp = moment.utc(this.state.timestamp).format('YYYY-MM-DD');
            const data = await ActivityFeedService.getAppointmentFeed(timestamp, recapPeriod, appointmentType);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            } else {
                if (data.length > 0) {
                    const profilePicAddedData = data.map(appointmentData => {
                        const connectionMatchedData = this.findConnection(appointmentData.memberId);
                        if (connectionMatchedData.length > 0) {
                            appointmentData.profilePic = connectionMatchedData[0].profilePicture ? getAvatar(connectionMatchedData[0]) : null;
                            appointmentData.memberName = connectionMatchedData[0].name;
                            if (!appointmentData.profilePic) {
                                appointmentData.colorCode = connectionMatchedData[0].colorCode ? connectionMatchedData[0].colorCode : DEFAULT_AVATAR_COLOR;
                            }
                        }
                        return appointmentData;
                    });
                    this.setState({appointmentList: profilePicAddedData, isLoading: false});

                } else {
                    this.setState({isLoading: false, appointmentList: []});
                }
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }

    }

    async componentDidMount(): void {
        await this.getAppointmentFeed();
    }

    findConnection = (connectionId) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection;
    }


    navigateToUserAppointmentListScreen = (appointmentData) => {
        this.props.navigation.navigate(Screens.USER_APPOINTMENT_LIST_SCREEN, {
            appointmentType: this.state.appointmentType,
            appointmentData: appointmentData
        });
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
            return (
                <AlfieLoader/>);
        }

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
                        <Body style={Platform.OS === 'ios' ? {flex: 5} : {flex: 5, paddingLeft: 25}}>
                            <Title
                                {...addTestID('appointment-feed')}
                                style={styles.headerTitle}> <Text
                                style={{textTransform: 'capitalize'}}>{this.state.appointmentType}</Text> Appointment
                                Feed</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content contentContainerStyle={{paddingBottom: 40}}>

                        {this.state.appointmentList.length > 0 ?
                            <FlatList
                                data={this.state.appointmentList}
                                style={styles.feedList}
                                renderItem={({item, index}) =>
                                    <TouchableOpacity
                                        {...addTestID('user-appointment-list-screen - ' + (index + 1))}
                                        onPress={() => this.navigateToUserAppointmentListScreen(item)}
                                        key={index}
                                        style={styles.singleFeed}>
                                        <View style={styles.imgView}>
                                            {item.profilePic ?
                                                <Image
                                                    {...addTestID('profile-pic - ' + (index + 1))}
                                                    source={{uri: item.profilePic}}
                                                    style={styles.feedImg}
                                                    resizeMode={'cover'}/>
                                                :
                                                <View style={{
                                                    ...styles.proBg,
                                                    backgroundColor: item.colorCode
                                                }}><Text
                                                    style={styles.proLetter}>{item.memberName.charAt(0).toUpperCase()}</Text></View>
                                            }

                                        </View>
                                        <View style={styles.textWrapper}>
                                            <Text
                                                style={styles.feedTitle}>{item.memberName} {this.state.appointmentType} {item.count} appointment{item.count > 1 ? 's' : ''} </Text>
                                        </View>
                                        <View>
                                            <Button
                                                {...addTestID('user-appointment-list-screen-btn')}
                                                onPress={() => this.navigateToUserAppointmentListScreen(item)}
                                                transparent
                                            >
                                                <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                            </Button>
                                        </View>
                                    </TouchableOpacity>}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            this.emptyState()
                        }

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
    feedList: {
        // padding: 24
    },
    singleFeed: {
        padding: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgView: {},
    feedImg: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    textWrapper: {
        paddingLeft: 16,
        flex: 2
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    feedTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        color: '#25345C',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.5,
        paddingRight: 10
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20,
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
export default connectConnections()(AppointmentFeedListScreen);
