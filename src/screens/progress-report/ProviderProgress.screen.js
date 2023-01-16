import React, {Component} from "react";
import {Image, Linking, ScrollView, StatusBar, StyleSheet, Text, View} from "react-native";
import {Body, Button, Container, Header, Left, Right,} from "native-base";
import {Screens} from "../../constants/Screens";
import {addTestID, compareDay, getAvatar, getTimeFromMilitaryStamp, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import {HEADER_NORMAL, HEADER_X} from "../../constants/CommonConstants";
import LinearGradient from "react-native-linear-gradient";
import AwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {connectReduxState} from "../../redux";
import Loader from "../../components/Loader";
import {DEFAULT_AVATAR_COLOR} from "ch-mobile-shared/src/constants/CommonConstants";
import GradientButton from "../../components/GradientButton";
import BillingService from "../../services/BillingService";
import {Colors} from "ch-mobile-shared/src/styles";
import {QRCodeComponent} from 'ch-mobile-shared/src/components/QRCode.component.js';
import BranchLinksService from "../../services/BranchLinksService";
const HEADER_SIZE = getHeaderHeight();

class ProviderProgressScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            schedule: {
                planning: [],
                blocked: []
            },
            stripeConnect: {
                loading: true,
                details: null
            }
        };
    }

    componentDidMount = async () => {
        this.createScheduleFromProps();
        this.fetchStripeConnectDetails();
        this.publicProfileRefreshHandler = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.createScheduleFromProps();
                this.fetchStripeConnectDetails();

            }
        );
    };

    shareMyProfile = async (channel) => {
        await BranchLinksService.shareProviderProfileLink(channel, this.props.profile.profile.providerId);
    };

    fetchStripeConnectDetails = async () => {
        this.setState({
            stripeConnect: {
                loading: true
            }
        });
        const response = await BillingService.getStripeConnectDetails();
        if (response.errors) {
            this.setState({
                stripeConnect: {
                    loading: false
                }
            });
        } else {
            this.setState({
                stripeConnect: {
                    loading: false,
                    details: response
                }
            });
        }
    };


    componentWillUnmount(): void {
        if (this.publicProfileRefreshHandler) {
            this.publicProfileRefreshHandler.remove();
        }
    }


    goBack = () => {
        this.props.navigation.goBack();
    };

    getActiveMembers = () => {
        const {activeConnections} = this.props.connections;
        return activeConnections.filter(connection => connection.type === 'PATIENT');
    };

    createScheduleFromProps = () => {
        const settings = {
            planning: this.props.settings.appointments.planningHorizon ?
                Object.keys(this.props.settings.appointments.planningHorizon).map(day => {
                    return {
                        title: day,
                        desc: JSON.parse(JSON.stringify(this.props.settings.appointments.planningHorizon[day].availability)),
                        active: this.props.settings.appointments.planningHorizon[day].active,
                    }
                })
                : [],
            blocked: this.props.settings.appointments.blockingHorizon ?
                Object.keys(this.props.settings.appointments.blockingHorizon).map(day => {
                    return {
                        title: day,
                        desc: JSON.parse(JSON.stringify(this.props.settings.appointments.blockingHorizon[day].availability)),
                        active: this.props.settings.appointments.blockingHorizon[day].active
                    }
                }) : []
        };
        this.setState({schedule: settings});
    };

    renderContent = () => {
        const views = this.state.schedule.planning
            .filter(availability => availability.active)
            .sort((i1, i2) => compareDay(i1.title, i2.title)).map(item => {
                const slots = item.desc;
                const descriptions = slots.map((desc, ind) => {
                    if (desc.start !== undefined && desc.end !== undefined) {
                        const startTime = getTimeFromMilitaryStamp(desc.start);
                        const endTime = getTimeFromMilitaryStamp(desc.end);
                        return (
                            <Text style={styles.scheTime}
                                  key={'-' + item.title + '-' + ind + '-' + desc.start}>
                                {startTime.time + ' ' + startTime.amPm + ' - ' + endTime.time + ' ' + endTime.amPm}
                            </Text>
                        );
                    } else {
                        return (
                            <Text style={styles.scheTime} key={'-' + item.title + '-'}>
                                Completely Blocked
                            </Text>
                        );
                    }

                });
                return (
                    <View key={item.title + '-'} style={styles.expandableItem}>


                        <View style={styles.singleSchedule}>
                            <Text style={styles.scheDay}>{item.title}</Text>
                            {item.desc && (
                                <View>
                                    {descriptions}
                                </View>
                            )}
                        </View>

                    </View>
                );
            });
        return (
            <View>
                {views}
            </View>
        );
    };

    isPlanningDayActive = (day) => {
        return this.props.settings.appointments.planningHorizon[day] && this.props.settings.appointments.planningHorizon[day].active;
    };

    getActiveDayCount = () => {
        return this.state.schedule.planning
            .filter(availability => availability.active).length;
    };

    openSettings = () => {
        this.props.navigation.navigate(Screens.SETTINGS_SCREEN);
    };

    render = () => {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.profile.isLoading || this.props.connections.isLoading || this.props.settings.isLoading) {
            return (
                <Loader/>
            );
        }
        const activeMembers = this.getActiveMembers();
        const reducedPics = activeMembers
            .sort((c1, c2) => {
                if (c1.profilePicture && !c2.profilePicture) {
                    return -1;
                } else {
                    return 1;
                }
            })
            .map(connection => {

                return {
                    profilePicture: connection.profilePicture,
                    colorCode: connection.colorCode,
                    name: connection.name
                };
            }).slice(0, 6);

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', 'rgba(247,249,255,0.5)', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />

                    <Header transparent style={styles.chatHeader}>
                        <Left>
                            <Button
                                {...addTestID('setting')}
                                transparent style={styles.backButton} onPress={this.openSettings}>
                                {/*<Ionicons name="ios-settings" size={30} color="#3fb2fe"/>*/}
                                <Image style={{height:24, width: 23}} source ={require('../../assets/images/setting-ico.png')} />
                            </Button>
                        </Left>
                        <Body/>
                        <Right>
                            {/*<Button transparent style={[styles.backButton, {marginRight: 6}]}*/}
                            {/*        onPress={() => {*/}
                            {/*        }}*/}
                            {/*>*/}
                            {/*    <AwesomeIcon name='medal' size={24}*/}
                            {/*                 color="#3fb2fe"/>*/}
                            {/*</Button>*/}
                        </Right>
                    </Header>


                    <ScrollView
                        ref={scrollView => (this.scrollView = scrollView)}
                    >

                        {/*Updated provider profile UI starts*/}
                        <View style={styles.newProWrapper}>
                            <View style={styles.providerInfoBox}>
                                <Image
                                    {...addTestID('profile-image')}
                                    style={styles.providerImg}
                                    resizeMode={"cover"}
                                    source={{uri: getAvatar({profilePicture: this.props.profile.profile.profileImage})}}
                                    alt="Image"
                                />
                                <Text {...addTestID('provider-name')} style={styles.providerName}>{this.props.profile.profile.fullName}</Text>
                                <Text {...addTestID('provider-code')} style={styles.connectionCode}>Connection
                                    code: {this.props.profile.profile.providerCode.toUpperCase()}</Text>
                                <Text {...addTestID('provider-role')}
                                    style={styles.providerRole}>{this.props.profile.profile.designation ? this.props.profile.profile.designation : 'N/A'}</Text>
                            </View>

                            <View style={styles.helpBox}>
                                <View style={styles.helpRow}>
                                    <View style={{flexDirection: 'row'}}>
                                        <AntIcon name="heart" size={22} color="#ec0d4e"/>
                                        <Text {...addTestID('helped')} style={styles.helpedText}>helped</Text>
                                    </View>
                                    <Text {...addTestID('active-people')} style={styles.peopleText}>{activeMembers.length} people</Text>
                                </View>
                                <View style={styles.peopleRow}>
                                    <View style={styles.peopleList}>
                                        {reducedPics.map((pic, index) =>
                                            pic.profilePicture ? (
                                                <Image
                                                    {...addTestID('connection-image-'+index+1)}
                                                    style={styles.singlePerson}
                                                    resizeMode={"cover"}
                                                    key={'pic-' + index}
                                                    source={{uri: getAvatar(pic)}}
                                                    alt="Image"
                                                />
                                            ) : (

                                                <View
                                                    key={'pic-' + index}
                                                    style={{
                                                        ...styles.proBg,
                                                        backgroundColor: pic.colorCode ? pic.colorCode : DEFAULT_AVATAR_COLOR,
                                                    }}><Text
                                                    style={styles.proLetter}>{pic.name.charAt(0).toUpperCase()}</Text></View>

                                            )
                                        )
                                        }
                                    </View>
                                    <View style={styles.btnRow}>
                                        <Button
                                            style={styles.viewAllBtn}
                                            transparent
                                            onPress={() => {
                                                this.props.navigation.navigate(Screens.CONNECTIONS);
                                            }}
                                        >
                                            <Text {...addTestID('view-all')} style={styles.reviewBtnText}>View All</Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.stripeBox}>
                                <View style={styles.helpRow}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={styles.dollarCircle}>
                                            <AwesomeIcon name="dollar-sign" size={18} color="#fff"/>
                                        </View>
                                        <Text style={styles.helpedText}>Earned</Text>
                                    </View>
                                    {/*<Text style={styles.peopleText}>$5000</Text>*/}
                                </View>

                                {
                                    !this.state.stripeConnect.loading && (
                                        <View style={styles.stripeRow}>
                                            <View style={styles.bankBtn}>
                                                <GradientButton
                                                    text={this.state.stripeConnect.details ? 'Stripe Dashboard' : 'connect bank account'}
                                                    onPress={() => {
                                                        if (this.state.stripeConnect.details) {
                                                            Linking.openURL(this.state.stripeConnect.details.dashboardLink);
                                                        } else {
                                                            this.props.navigation.navigate(Screens.STRIPE_CONNECT_FLOW);
                                                        }

                                                    }}/>
                                            </View>
                                            <Image
                                                style={styles.stripeImg}
                                                resizeMode={'contain'}
                                                source={require('../../assets/images/stripe-logo.png')}
                                                alt="Stripe"
                                            />
                                        </View>
                                    )}
                            </View>

                            <View style={styles.scheduleBox}>
                                <View style={styles.scheduleRow}>
                                    <View style={{flexDirection: 'row'}}>
                                        <AwesomeIcon name="calendar" size={22} color="#4caaf0"/>
                                        <Text style={styles.scheduleText}>Schedule</Text>
                                    </View>
                                    <Text style={styles.daysText}>{this.getActiveDayCount()} days</Text>
                                </View>
                                <View style={styles.weekRow}>
                                    <Text
                                        style={this.isPlanningDayActive('SUNDAY') ? styles.dark : styles.light}>Sun</Text>
                                    <Text
                                        style={this.isPlanningDayActive('MONDAY') ? styles.dark : styles.light}>Mon</Text>
                                    <Text
                                        style={this.isPlanningDayActive('TUESDAY') ? styles.dark : styles.light}>Tue</Text>
                                    <Text
                                        style={this.isPlanningDayActive('WEDNESDAY') ? styles.dark : styles.light}>Wed</Text>
                                    <Text
                                        style={this.isPlanningDayActive('THURSDAY') ? styles.dark : styles.light}>Th</Text>
                                    <Text
                                        style={this.isPlanningDayActive('FRIDAY') ? styles.dark : styles.light}>Fri</Text>
                                    <Text
                                        style={this.isPlanningDayActive('SATURDAY') ? styles.dark : styles.light}>Sat</Text>
                                </View>
                                <View style={styles.scheduleList}>
                                    {this.renderContent()}
                                </View>
                                <View style={styles.btnRow}>
                                    <Button
                                        style={styles.viewAllBtn}
                                        transparent
                                        onPress={() => {
                                            this.props.navigation.navigate(Screens.APPOINTMENTS_SETTINGS);
                                        }}
                                    >
                                        <Text style={styles.reviewBtnText}>Edit Schedule</Text>
                                    </Button>
                                </View>
                            </View>
                        </View>

                        {/*{this.props.profile.profile.branchLink && this.props.profile.profile.branchLink !== '' ?*/}

                        {/*    <QRCodeComponent text={this.props.profile.profile.branchLink} />*/}

                        {/*    : null }*/}



                        {/*Updated provider profile UI ends*/}
                        <View style={styles.bottomShareBtn}>
                            <View style={{alignSelf: 'center', width: 200}}>
                                <Button transparent style={styles.outlineBtn}>
                                    <Text style={styles.outlineText}
                                          onPress={() => {
                                              this.shareMyProfile('facebook');
                                          }}
                                    >share my profile</Text>
                                </Button>
                            </View>
                        </View>
                    </ScrollView>


                </LinearGradient>
            </Container>
        );

    };
}

const styles = StyleSheet.create({
    chatHeader: {
        height: HEADER_SIZE,
        paddingLeft: 3,
        paddingRight: 0,
        elevation: 0,
    },
    backButton: {
        marginLeft: 15
    },
    headerText: {
        color: "#fff",
        fontFamily: "Roboto-Regular",
        fontWeight: "400",
        fontSize: 16,
        alignItems: 'center'
    },
    newProWrapper: {
        padding: 24
    },
    providerInfoBox: {
        justifyContent: 'center',
        paddingTop: 10,
        marginBottom: 40
    },
    providerImg: {
        width: 200,
        height: 200,
        borderRadius: 110,
        borderColor: '#fafbfd',
        borderWidth: 1,
        alignSelf: 'center',
        marginBottom: 24
    },
    providerName: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 24,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 8
    },
    connectionCode: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 16
    },
    providerRole: {
        color: '#515d7d',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 12,
        letterSpacing: 1.04,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    reviewBox: {
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff'
    },
    reviewRow: {
        borderBottomWidth: 1,
        borderColor: '#f5f5f5',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    reviewPosition: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 11,
        lineHeight: 21,
        letterSpacing: 1,
        paddingLeft: 16
    },
    sessionText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.46
    },
    btnRow: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewAllBtn: {},
    reviewBtnText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 13,
        lineHeight: 22.5,
        letterSpacing: 0.35
    },
    helpBox: {
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff'
    },
    helpRow: {
        borderBottomWidth: 1,
        borderColor: '#f5f5f5',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    helpedText: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 11,
        lineHeight: 21,
        letterSpacing: 1,
        paddingLeft: 16
    },
    peopleText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.46
    },
    peopleRow: {
        // flexDirection: 'row'
    },
    peopleList: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 0
    },
    singlePerson: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fff',
        marginLeft: -15
    },
    scheduleBox: {
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff'
    },
    scheduleRow: {
        borderBottomWidth: 1,
        borderColor: '#f5f5f5',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scheduleText: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 11,
        lineHeight: 21,
        letterSpacing: 1,
        paddingLeft: 16
    },
    daysText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.46
    },
    weekRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18
    },
    dark: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 14,
        letterSpacing: 0.3,
        margin: 5
    },
    light: {
        color: '#b3bec9',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 14,
        letterSpacing: 0.3,
        margin: 5
    },
    scheduleList: {
        padding: 24
    },
    singleSchedule: {
        marginBottom: 24
    },
    scheDay: {
        color: '#646c73',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.58,
        marginBottom: 10,
        textTransform: 'capitalize'
    },
    scheTime: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 15,
        marginBottom: 4,
        letterSpacing: 0.58
    },
    bottomShareBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    outlineBtn: {
        borderColor: '#3fb2fe',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        marginBottom: 24,
        justifyContent: 'center',
        elevation: 0
    },
    outlineText: {
        color: '#3fb2fe',
        fontSize: 13,
        letterSpacing: 0.7,
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    proBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15
    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    stripeDashboardLink: {
        fontFamily: 'Roboto-Regular',
        color: Colors.colors.blue3,
        fontWeight: '400',
        lineHeight: 20,
        paddingLeft: 15
    },
    stripeBox: {
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff'
    },
    stripeRow: {
        padding: 40
    },
    dollarCircle: {
        backgroundColor: '#77c70b',
        width: 24,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bankBtn: {
        // width: '70%',
        alignSelf: 'center',
        maxWidth: 250
    },
    stripeImg: {
        // width: '60%',
        marginTop: 25,
        alignSelf: 'center',
        maxWidth: 134
    }
});
export default connectReduxState()(ProviderProgressScreen);
