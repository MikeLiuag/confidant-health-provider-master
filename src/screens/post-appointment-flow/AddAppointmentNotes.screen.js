import React, {Component} from 'react';
import {Image, KeyboardAvoidingView, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil, APPOINTMENT_SIGNOFF_STATUS,
    Colors,
    CommonStyles,
    CommonTextArea,
    getAvatar,
    getHeaderHeight,
    PrimaryButton,
    TextStyles, valueExists
} from 'ch-mobile-shared';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modalbox';
import Loader from "../../components/Loader";
import {Screens} from "../../constants/Screens";
import {NavigationActions, StackActions} from "react-navigation";
import ScheduleService from "../../services/ScheduleService";
import moment from "moment";
import {APPOINTMENT_STATUS, SEGMENT_EVENT} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();


export default class AddAppointmentNotesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.patientId = navigation.getParam('patientId', null);
        this.appointment = navigation.getParam('appointment', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        console.log(this.appointment)
        this.state = {
            objectiveNotes: (this.appointment.objective===null || this.appointment.objective==='')?'':this.appointment.objective,
            subjectiveNotes:  (this.appointment.subjective===null || this.appointment.subjective==='')?'':this.appointment.subjective,
            assessmentNotes: (this.appointment.assessment===null || this.appointment.assessment==='')?'':this.appointment.assessment,
            planNotes:  (this.appointment.plan===null || this.appointment.plan==='')?'':this.appointment.plan,
            stateKey: '',
            title: '',
            description: '',
            note: ''
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    addNotesModalClose = () => {
        this.refs.addNotesModal.close();
    };

    addNotesModalOpen = (stateKey, title, description) => {
        this.setState({stateKey: stateKey, title: title, description: description, note: this.state[stateKey]})
        this.refs.addNotesModal.open();
    };

    saveNotes = async (skipNotes = false) => {
        this.setState({isLoading: true});
        const appointmentId = this.appointment.appointmentId;
        const {objectiveNotes, subjectiveNotes, assessmentNotes, planNotes} = this.state
        const payload = {
            subjective: subjectiveNotes?.trim(),
            objective: objectiveNotes?.trim(),
            assessment: assessmentNotes?.trim(),
            plan: planNotes?.trim(),
            skip: skipNotes
        };

        try {
            const response = await ScheduleService.addAppointmentNotes(appointmentId, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false})
            } else {
                if(!skipNotes)
                {
                    if (this.appointment.requireSupervisorSignOff)
                        AlertUtil.showSuccessMessage(`You've successfully signed off on this appointment note. It will be reviewed by your supervisor.`)
                    else
                        AlertUtil.showSuccessMessage(`You've successfully signed off on this appointment note. Nice work!`)
                }
                const segmentPayload = {
                    appointment: this.appointment,
                    isProviderApp: true,
                    subjective: subjectiveNotes?.trim(),
                    objective: objectiveNotes?.trim(),
                    assessment: assessmentNotes?.trim(),
                    plan: planNotes?.trim(),
                    completeNotesLater: skipNotes
                };
                await Analytics.track(SEGMENT_EVENT.APPOINTMENT_SIGN_OFF_NOTES_COMPLETED, segmentPayload);
                this.navigateToScheduleNextAppointmentScreen()
            }
        } catch (e) {
            this.setState({isLoading: false})
            console.log("Error", e);
        }

    };

    navigateToScheduleNextAppointmentScreen = () => {
        if (this.referrerScreen) {
            this.props.navigation.replace(this.referrerScreen);
        } else {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({routeName: Screens.TAB_VIEW})],
            });
            this.props.navigation.dispatch(resetAction);
        }
    };

    hasAnyValue = () => {
        const {objectiveNotes, subjectiveNotes, assessmentNotes, planNotes} = this.state
        return valueExists(objectiveNotes.trim()) || valueExists(subjectiveNotes.trim()) ||
            valueExists(assessmentNotes.trim()) || valueExists(planNotes.trim());
    };

    NOTES = [
        {
            title: 'Subjective',
            stateKey: 'subjectiveNotes',
            description: "What is going on with the client? What did they say? How are they feeling? How did they present?",
            buttonTitle: 'subjective'
        },
        {
            title: 'Objective',
            stateKey: 'objectiveNotes',
            description: "Include any measurable, quantifiable and observable information. Including changes in status and a summary of interventions performed.",
            buttonTitle: 'objective'
        },
        {
            title: 'Assessment',
            stateKey: 'assessmentNotes',
            description: "Interpret the meaning of the subjective and objective sections. Indicate progress toward goals, adjust or modify goals if necessary.",
            buttonTitle: 'assessment'
        },
        {
            title: 'Plan',
            stateKey: 'planNotes',
            description: "What is the course of action? What is the guest to do in between sessions?",
            buttonTitle: 'plan notes'
        }
    ]

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const {
            stateKey,
            title,
            description,
            note
        } = this.state;
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent
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
                    <Body style={styles.bodyWrap}/>
                    <Right style={{flex: 0.5}}/>
                </Header>
                <Content contentContainerStyle={{padding: 24}}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Add notes about this appointment
                        </Text>
                    </View>
                    {this.appointment &&
                        <View style={styles.contentWrapper}>

                            <Image
                                style={styles.patientImg}
                                resizeMode={'cover'}
                                source={{uri: getAvatar({profilePicture: this.appointment.participantImage})}}
                            />
                            <View style={styles.patientDetails}>
                                <Text
                                    style={styles.infoTitle}>{this.appointment.participantName}</Text>
                                <Text style={styles.infoContent}>{this.appointment.serviceName}</Text>
                            </View>
                        </View>
                    }
                    {this.NOTES.map(note =>
                        <View style={styles.noteList}>
                            <View style={styles.noteTopRow}>
                                <MaterialCommunityIcon name={'checkbox-marked-circle'}
                                                       color={valueExists(this.state[note.stateKey]) ? Colors.colors.successIcon : Colors.colors.neutral50Icon}
                                                       size={20}/>
                                <Text style={styles.noteTitle}>{note.title}</Text>
                            </View>
                            <View style={styles.noteContentRow}>
                                <Text style={styles.noteContentText}>
                                    {this.state[note.stateKey] ? this.state[note.stateKey] : note.description}
                                </Text>
                            </View>
                            {
                                valueExists(this.state[note.stateKey]) ? (
                                    <PrimaryButton
                                        onPress={() => {
                                            this.addNotesModalOpen(
                                                note.stateKey,
                                                note.title,
                                                note.description)
                                        }}
                                        textColor={Colors.colors.primaryText}
                                        bgColor={Colors.colors.primaryColorBG}
                                        text={`Change ${note.buttonTitle}`}
                                    />
                                ) : (
                                    <PrimaryButton
                                        onPress={() => {
                                            this.addNotesModalOpen(
                                                note.stateKey,
                                                note.title,
                                                note.description)
                                        }}
                                        text={`Add ${note.buttonTitle}`}
                                    />
                                )
                            }
                        </View>
                    )}
                    {(this.appointment?.status === APPOINTMENT_STATUS.FULFILLED &&
                        this.appointment?.signOffStatus === APPOINTMENT_SIGNOFF_STATUS.REJECTED &&
                        <View style={styles.noteList}>
                            <View style={styles.noteTopRow}>
                                <MaterialCommunityIcon name={'checkbox-marked-circle'}
                                                       color={Colors.colors.successIcon}
                                                       size={20}/>
                                <Text style={styles.noteTitle}>{'Reason For Rejection'}</Text>
                            </View>
                            <View style={styles.noteContentRow}>
                                <Text style={styles.noteContentText}>
                                    {this.appointment?.supervisorNote}
                                </Text>
                            </View>

                        </View>
                    )}
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <PrimaryButton
                            testId="Sign off on notes"
                            onPress={() => {
                                this.saveNotes()
                            }}
                            text="Sign off on notes"
                        />
                        <Button
                            onPress={() => {
                                this.saveNotes(true)
                            }}
                            transparent style={styles.skipBtn}>
                            <Text style={{...CommonStyles.styles.blueLinkText, marginTop: 5}}>Complete notes
                                later</Text>
                        </Button>
                    </View>
                </Content>
                <Modal
                    backdropPressToClose={true}
                    // isOpen={}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.addNotesModalClose}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 440}}
                    entry={"bottom"}
                    position={"bottom"} ref={"addNotesModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />

                    <KeyboardAvoidingView
                        style={{flex: 1, bottom: 0}}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <Content scrollIndicatorInsets={{right: 1}}
                                 showsVerticalScrollIndicator={false}>
                            <Text style={styles.addNotesTitle}>
                                {this.state[stateKey] ? 'Change' : 'Add'} {title.toLowerCase()} notes
                            </Text>
                            <Text style={styles.addNotesSubText}>
                                {description}
                            </Text>
                            <CommonTextArea
                                testID={'Enter-notes'}
                                value={this.state.note}
                                autoFocus={false}
                                multiline={true}
                                placeHolderText={'Enter notes here'}
                                borderColor={Colors.colors.borderColor}
                                onChangeText={note => {
                                    this.setState({note: note});
                                }}
                            />
                            <View style={styles.addNotesBtn}>
                                <PrimaryButton
                                    text={'Add notes'}
                                    onPress={() => {
                                        const {state} = this;
                                        state[stateKey] = note.trim();
                                        this.setState(state, this.addNotesModalClose);
                                    }}
                                />
                            </View>
                        </Content>
                    </KeyboardAvoidingView>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 18,
        paddingRight: 18,
        height: HEADER_SIZE
    },
    backButton: {
        width: 35,
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrap: {
        alignItems: 'center',
        marginBottom: 16
    },
    contentWrapper: {
        flexDirection: 'row'
    },
    patientImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    patientDetails: {
        paddingLeft: 12
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    noteList: {
        paddingVertical: 32
    },
    singleNote: {
        marginBottom: 32
    },
    noteTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginBottom: 16
    },
    noteTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginLeft: 8

    },
    noteBtn: {},
    noteBtnText: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        marginRight: 5,
    },
    noteBtnIcon: {
        fontSize: 18,
        color: Colors.colors.primaryIcon,
        marginLeft: 0,
        marginRight: 0
    },
    noteContentRow: {},
    noteContentText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        marginBottom: 15
    },
    addNotesTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 4
    },
    addNotesSubText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        marginBottom: 24
    },
    addNotesBtn: {
        paddingVertical: 24
    },
    aptContent: {
        paddingTop: 10,
        paddingBottom: 30
    },
    contentHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        marginBottom: 8,
        marginTop: 16
    },
    contentPara: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 8
    },
    greBtn: {
        marginTop: 35
    },
    skipBtn: {
        alignSelf: 'center',
        // marginTop: 20,
        // paddingBottom: 10
    },
});
