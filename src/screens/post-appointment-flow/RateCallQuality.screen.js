import React, {Component} from 'react';
import {FlatList, StatusBar, StyleSheet} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    CommonTextArea,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles
} from 'ch-mobile-shared';
import {AirbnbRating} from "react-native-elements";
import {Screens} from '../../constants/Screens';
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT, SessionQualityIssuesOptions} from "../../constants/CommonConstants";
import AppointmentService from "../../services/AppointmentService";
import Loader from "../../components/Loader";
import {connectAppointments} from "../../redux";


class RateCallQualityScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.completedViaPhone = navigation.getParam('completedViaPhone', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.startedAt = navigation.getParam('startedAt', null);
        this.completedAt = navigation.getParam('completedAt', null);
        this.segmentSessionCompletedPayload = navigation.getParam('segmentSessionCompletedPayload', null);
        this.state = {
            rating: 5,
            qualityFeedback: '',
            connectionIssues: false,
            reminderIssues: false,
            communicationIssues: false,
            isLoading: true,
        };

    }

    componentDidMount = async () => {
        if (this.segmentSessionCompletedPayload) {
            await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_COMPLETED, this.segmentSessionCompletedPayload);
            if(this.completedViaPhone) {
                this.navigateToNextScreen();
            } else {
                this.setState({isLoading: false})
            }
        }
    }

    ratingCompleted = (rating) => {
        this.setState({rating: rating});
    };

    updateIssueCheckbox = (issueType) => {
        const state = this.state;
        state[issueType] = !state[issueType];
        this.setState(state);
    };

    navigateToNextScreen = () => {
        this.props.navigation.replace(Screens.DATA_DOMAIN_LIST_SCREEN, {
            patientId: this.appointment?.participantId,
            referrerScreen: this.referrerScreen,
            appointment: this.appointment,
            provider : this.props?.profile?.profile,
            ...this.props.navigation.state.params,
        });
    };

    shareProviderFeedback = async () => {
        this.setState({isLoading: true});
        const {rating, qualityFeedback, connectionIssues, reminderIssues, communicationIssues} = this.state;
        const sessionQuality = {
            rating, qualityFeedback, connectionIssues, reminderIssues, communicationIssues,
        };
        const {appointmentId} = this.appointment;
        const payload = {
            appointmentId,
            sessionQuality: sessionQuality
        };
        const response = await AppointmentService.saveProviderFeedback(payload);
        try {
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage('Your feedback has been saved');
                const {rating} = sessionQuality;
                const segmentFeedbackCompletedPayload = {
                    telesessionId: this.segmentSessionCompletedPayload?.sessionId,
                    encounterId: this.segmentSessionCompletedPayload?.encounterId,
                    userId: this.appointment?.participantId,
                    providerId: this.props?.auth?.meta?.userId,
                    startedAt: this.startedAt,
                    startTime: this.appointment?.startTime,
                    endTime: this.appointment?.endTime,
                    appointmentName: this.appointment?.serviceName,
                    appointmentDuration: this.appointment?.serviceDuration,
                    appointmentCost: this.appointment?.serviceCost,
                    paymentAmount: this.appointment?.prePayment?.amountPaid,
                    completedAt: this.completedAt,
                    rating: rating,
                    isProviderApp: true,
                    memberId: this.appointment?.participantId
                }
                await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_FEEDBACK_COMPLETED, segmentFeedbackCompletedPayload);
                this.setState({isLoading: false});
                this.navigateToNextScreen();
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content contentContainerStyle={{padding: 24}}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Rate call quality
                        </Text>
                    </View>
                    <View style={styles.ratingBox}>
                        <AirbnbRating
                            type='star'
                            showRating={false}
                            ratingCount={5}
                            imageSize={35}
                            size={35}
                            selectedColor={Colors.colors.secondaryText}
                            defaultRating={this.state.rating}
                            tintColor={'#fff'}
                            onFinishRating={this.ratingCompleted}
                        />
                    </View>
                    <FlatList
                        data={SessionQualityIssuesOptions}
                        renderItem={({item, index}) =>
                            <SingleCheckListItem
                                listTestId={'list - ' + index + 1}
                                checkTestId={'checkbox - ' + index + 1}
                                keyId={index}
                                listPress={() => this.updateIssueCheckbox(item.state)}
                                itemSelected={!this.state[item.state]}
                                itemTitle={item.title}
                            />
                        }
                        keyExtractor={item => item.id}
                    />

                    <View style={styles.areaWrap}>
                        <Text style={styles.textAreaTitle}>Additional feedback and thoughts</Text>
                        <CommonTextArea
                            testID={'Enter-public-comment'}
                            value={this.state.qualityFeedback}
                            autoFocus={false}
                            multiline={true}
                            borderColor={Colors.colors.borderColor}
                            placeHolderText={'Your opinion will help us to improve'}
                            onChangeText={qualityFeedback => {
                                this.setState({qualityFeedback});
                            }}
                            getRef={this.publicGetRef}
                        />
                    </View>
                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue"
                        onPress={this.shareProviderFeedback}
                        text="Continue"
                    />
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    titleWrap: {
        marginTop: 40,
        alignItems: 'center',
        marginBottom: 16
    },
    ratingBox: {
        marginBottom: 50
    },
    areaWrap: {
        marginTop: 32,
        paddingBottom: 50
    },
    textAreaTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8
    },
    greBtn: {
        paddingTop: 0,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        ...CommonStyles.styles.stickyShadow
    }
});

export default connectAppointments()(RateCallQualityScreen)
