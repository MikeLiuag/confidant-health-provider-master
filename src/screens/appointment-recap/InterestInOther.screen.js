import React, {Component} from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Accordion, CheckBox, Container, Content, ListItem} from "native-base";
import {AlfieLoader, AlertUtil, isIphoneX} from "ch-mobile-shared";
import GradientButton from "../../components/GradientButton";
import {Screens} from "../../constants/Screens";
import AntIcon from "react-native-vector-icons/AntDesign";
import ScheduleService from "../../services/ScheduleService";
import LinearGradient from "react-native-linear-gradient";
import AppointmentService from "../../services/AppointmentService";
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import {connectAppointments} from "../../redux";

class InterestInOtherScreen extends Component<Props>{
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.sessionQuality = navigation.getParam('sessionQuality', null);
        this.recapDetail = navigation.getParam('recapDetail', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.startedAt = navigation.getParam('startedAt', null);
        this.completedAt = navigation.getParam('completedAt', null);
        this.segmentSessionCompletedPayload = navigation.getParam('segmentSessionCompletedPayload', null)
        this.state = {
            isLoading: true,
            postAppointmentPathways: []
        };
    }

    /**
     * @function getPostAppointmentPathways
     * @description This method is used to update get post appointment pathways.
     */

    getPostAppointmentPathways = async () => {
        this.setState({isLoading: true});
        try {
            let postAppointmentPathways = await ScheduleService.getPostAppointmentPathways();
            if (postAppointmentPathways.errors) {
                AlertUtil.showErrorMessage(postAppointmentPathways.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                if (postAppointmentPathways && postAppointmentPathways.pathways && postAppointmentPathways.pathways.length > 0) {
                    postAppointmentPathways.pathways.map((postAppointmentPathwaysCategory) => {
                        postAppointmentPathwaysCategory.recommendedPathways.map((recommendedPathway,index) => {
                            recommendedPathway.index = index;
                            recommendedPathway.checked = false;
                        })
                    });
                }
                this.setState({postAppointmentPathways,isLoading: false});
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    componentDidMount = async () => {
        await this.getPostAppointmentPathways();
    };


    /**
     * @function shareProviderFeedback
     * @description This method is used to share provider feedback.
     */
    shareProviderFeedback = async () => {
        this.setState({isLoading: true});
        let {pathways} = this.state.postAppointmentPathways;
        const recommendedPathways = pathways.flatMap(category=> category.recommendedPathways).filter(recommendedPathway=>recommendedPathway.checked);
        const {appointmentId} = this.appointment;
        const payload = {
            appointmentId,
            sessionQuality: this.sessionQuality,
            recapDetail: this.recapDetail,
            recommendedPathways
        };

        const response = await AppointmentService.saveProviderFeedback(payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage('Your feedback has been saved');
            const {rating} = this.sessionQuality;
            const segmentFeedbackCompletedPayload = {
                telesessionId: this.segmentSessionCompletedPayload?.sessionId,
                encounterId: this.segmentSessionCompletedPayload?.encounterId,
                userId: this.props.auth?.meta?.userId,
                providerId: this.providerId,
                startedAt: this.startedAt,
                startTime: this.appointment?.startTime,
                endTime: this.appointment?.endTime,
                appointmentName: this.appointment?.serviceName,
                appointmentDuration: this.appointment?.serviceDuration,
                appointmentCost: this.appointment?.serviceCost,
                paymentAmount: this.appointment?.prePayment?.amountPaid,
                completedAt: this.completedAt,
                rating: rating,
                isProviderApp : true,
                memberId : this.appointment?.participantId,
                memberName : this.appointment?.participantName ,
                appointmentMarketRate : this.appointment?.marketCost,
                appointmentRecommendedPayment : this.appointment?.recommendedCost
            }
            await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_FEEDBACK_COMPLETED, segmentFeedbackCompletedPayload);
            this.navigateToNextScreen();
        }
    };

    navigateToNextScreen = () => {
        this.props.navigation.replace(Screens.SCHEDULE_NEXT_APPOINTMENT, {
            referrerScreen: this.referrerScreen,
            appointment: this.appointment
        });
    };


    /**
     * @function updateRecommendedPathwaysList
     * @description This method is used to update recommended pathway checkbox value.
     * @param selectedCategory,selectedPathway
     */
    updateRecommendedPathwaysList = (selectedCategory, selectedPathway) => {
        let {postAppointmentPathways} = this.state;
        postAppointmentPathways.pathways.map(postAppointmentPathwaysCategory => {
            if (postAppointmentPathwaysCategory.category === selectedCategory.category) {
                postAppointmentPathwaysCategory.recommendedPathways.map(recommendedPathway => {
                    if (recommendedPathway.index === selectedPathway.index) {
                        recommendedPathway.checked = !recommendedPathway.checked;
                    }
                })
            }
            return postAppointmentPathwaysCategory;
        });
        this.setState({postAppointmentPathways});
    };


    /**
     * @function _renderHeader
     * @description This method is used to render category value.
     * @param item,expanded
     */

    _renderHeader = (item, expanded) => {
        return (
            <View style={[styles.accordionHeader, expanded ? styles.headerHalfRound : styles.headerRound]}>
                <View style={styles.headerIconMain}>
                    {
                        expanded ? (<AntIcon style={styles.Icon} name="minus" size={22} color="#25345C"/>) :
                            <AntIcon style={styles.Icon} name="plus" size={22} color="#25345C"/>
                    }
                </View>
                <Text style={styles.accHeaderTitle}>{item.category}</Text>
            </View>
        )
    };


    /**
     * @function _renderContent
     * @description This method is used to render recommended pathway value.
     * @param category,index
     */

    _renderContent = (category, index) => {
        return (
            <View key={index} style={styles.accordionContent}>
                {
                    category.recommendedPathways.map((recommendedPathway, recommendedPathwayIndex) => {
                        return (
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                contentContainerStyle={{
                                    justifyContent: 'space-evenly',
                                    alignItems: 'flex-start',
                                    paddingRight: 20
                                }}
                                style={styles.filtersView}>

                                <ListItem key={recommendedPathwayIndex}
                                          onPress={() => {
                                              this.updateRecommendedPathwaysList(category, recommendedPathway)
                                          }}
                                          style={styles.multiList}
                                >
                                    <CheckBox
                                        style={recommendedPathway.checked ? styles.multiCheckSelected : styles.multiCheck}
                                        color="#3fb2fe"
                                        selectedColor="#fff"
                                        checked={recommendedPathway.checked}

                                        onPress={() => {
                                            this.updateRecommendedPathwaysList(category, recommendedPathway)
                                        }}
                                    />
                                    <View>
                                        <Text
                                            style={styles.checkBoxHeader}>
                                            {recommendedPathway.label}
                                        </Text>
                                    </View>
                                </ListItem>
                            </ScrollView>
                        )
                    })

                }
            </View>
        )
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <Content style={styles.wrapper} contentContainerStyle={{paddingBottom: 40}}>
                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleProgress}/>
                        </View>
                        <Text style={styles.title}>Update Member Profile</Text>
                        <Text style={styles.subtitle}>Please select any important information you discussed with the Member during the telehealth session.</Text>
                        <Accordion
                            dataArray={this.state.postAppointmentPathways?.pathways}
                            renderHeader={this._renderHeader}
                            renderContent={this._renderContent}
                            style={styles.acc}
                            expanded={this.state.expandedIndex}
                        />
                    </Content>
                    <View style={styles.btnStyle}>
                        <GradientButton
                            testId="continue"
                            onPress={this.shareProviderFeedback}
                            text="Continue"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingTop: 24,
        paddingHorizontal: 24
    },
    headerRound: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.07)',
        shadowColor: 'rgba(0, 0, 0, 0.07)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2
    },
    headerHalfRound: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'rgba(63, 178, 254, 0.07)'
    },
    headerIconMain: {
        paddingRight: 20
    },
    accHeaderTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 22,
        textAlign: 'center',
        color: '#25345C'
    },
    acc: {
        borderWidth: 0,
        borderColor: '#ebebeb',
    },
    accordionHeader: {
        backgroundColor: "#EFF7FF",
        padding: 20,
        marginTop: 16,
        flexDirection: 'row',
    },
    accordionContent: {
        backgroundColor: "#EFF7FF",
        padding: 20,
        paddingTop: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    singleSelectedProgress: {
        width: 28,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        marginLeft: 4,
        marginRight: 4
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 40
    },
    singleProgress: {
        width: 28,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4
    },
    title: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        color: '#25345c',
        marginBottom: 8
    },
    subtitle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        color: '#25345c',
        marginBottom: 40
    },
    searchWrapper: {
        height: 60,
        marginHorizontal: 8,
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2,
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40
    },
    searchIcon: {
        width: 25,
        marginRight: 15,
        marginLeft: 20,
        color: '#3fb2fe',
        fontSize: 26,
    },
    visibilityIcon: {
        width: 35,
        marginRight: 15,
        marginLeft: 20,
        color: '#3fb2fe',
        fontSize: 32,
    },
    visibilityText: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        color: '#3fb2fe',
        fontSize: 18,
    },
    searchField: {
        width: '100%',
        color: '#c2c2c2'
    },

    multiCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#3FB2FE',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        paddingLeft: 0,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    multiList: {
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 10,
        marginBottom: 8,
        paddingRight: 15
    },
    visibilityItem: {
        borderBottomWidth: 0,
        marginLeft: -4,
        marginVertical: 15
    },
    checkBoxHeader: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 13,
        letterSpacing: 0.28,
        lineHeight: 22,
        color: '#515D7D',
        paddingRight: 10,
        paddingLeft: 16,
        flex: 1
    },
    additionalTitle: {
        fontFamily: 'Roboto-Bold',
        fontSize: 16,
        letterSpacing: 0.3,
        lineHeight: 23,
        color: '#1e2737',
        paddingRight: 10,
        paddingLeft: 18,
        flex: 1,
    },
    checkBoxDesc: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        lineHeight: 23,
        color: '#515d7d',
        paddingRight: 10,
        paddingLeft: 18,
        flex: 1,
        marginTop: 5
    },
    textareaWrapper: {
        marginBottom: 20,
        paddingRight: 12,
        paddingLeft: 12
    },
    textareaLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.88,
        color: '#25345c',
        fontWeight: '700',
        marginBottom: 5,
        marginHorizontal: 6,
        marginTop: 10
    },
    textBox: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 5,
        paddingBottom: 5,
        height: 'auto',
        paddingLeft: 0,
        maxHeight: 160,
        marginHorizontal: 6,
    },
    btnStyle: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24
    },
});

export default connectAppointments()(InterestInOtherScreen)

