import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {Container, Content, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    AlfieLoader,
    Colors,
    isIphoneX,
    isTelehealthConfigured,
    PrimaryButton,
    TextStyles
} from 'ch-mobile-shared';
import {PreApptHeader} from "../../components/pre-appointment/PreApptHeader.component";
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import {AssociatedTagsList} from "../../components/pre-appointment/AssociatedTagsList.component";
import AuthStore from "../../utilities/AuthStore";
import ConversationService from "../../services/ConversationService";
import {DomainElementDetailModal} from "../../components/appointments/DomainElementDetailModal";


export default class ReviewSocialDeterminantScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: true,
            associatedTagsData: [],
            associatedTagsLength: null,
            selectedTagDetails: null,
            currentIndex: 0,
            detailVisible: false,
        };
        this.tagDetailSegments = [{segmentId: 'information', title: 'Information'}, {
            segmentId: 'history',
            title: 'History'
        }];
    }

    /**
     * @function getPatientAssociatedTagsList
     * @description This method is used to get Patient Associated Tags for given user.
     */

    getPatientAssociatedTagsList = async () => {
        try {
            const associatedTagsData = await ProfileService.getUserAssociatedTags(this.connection.connectionId);
            if (associatedTagsData.errors) {
                AlertUtil.showErrorMessage(associatedTagsData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                //Filtering out medical history

                const types = associatedTagsData.types.filter(type => type.typeName !== 'Medical History' && type.relatedElements !== undefined && type.relatedElements.length > 0);
                console.log({types})
                if (types.length === 0) {
                    this.startTelehealth(true);
                } else {
                    this.setState({
                        associatedTagsLength: types.length,
                        associatedTagsData: types,
                        currentSectionToShow: types[0].typeName,
                        isLoading: false
                    });
                }

            }

        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    /**
     * @function getPatientAssociatedTagDetails
     * @description This method is used to get Patient Associated Tag details for given user.
     */

    getPatientAssociatedTagDetails = async (item) => {
        try {
            const payload = {
                associatedTagId: item.id,
                patientId: this.connection.connectionId
            }
            const selectedTagDetails = await ProfileService.getUserAssociatedTagDetails(payload);
            if (selectedTagDetails.errors) {
                AlertUtil.showErrorMessage(selectedTagDetails.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                console.log({selectedTagDetails});
                this.setState({selectedTagDetails, isLoading: false,detailVisible: true});
            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    componentDidMount = async () => {

        await this.getPatientAssociatedTagsList();
        await this.getDomainLookups();
    }

    getDomainLookups = async () => {
        try {
            const lookupData = await ConversationService.getDomainLookups();
            if (lookupData.errors) {
                AlertUtil.showErrorMessage(lookupData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({lookupData: lookupData.lookupMap, isLoading: false});
            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    backClicked = (currentIndex) => {
        if (currentIndex > '-1' && currentIndex < this.state.associatedTagsLength) {
            this.setState({currentIndex: currentIndex})
        } else {
            this.props.navigation.goBack();
        }
    };

    detailDrawerClose = () => {
        this.setState({detailVisible: false});
    };

    startTelehealth = async (replaceScreen) => {
        let navigate = this.props.navigation.navigate;
        if (replaceScreen) {
            navigate = this.props.navigation.replace;
        }
        const isConfigured = await isTelehealthConfigured();
        let appointmentData = await AuthStore.getAppointmentDetails();
        appointmentData = JSON.parse(appointmentData);
        if (appointmentData.appointmentStatus) {
            if (isConfigured) {
                navigate(Screens.TELE_SESSION_V2, {
                    appointment: appointmentData.appointment,
                    sessionId: appointmentData.sessionId,
                    token: appointmentData.token,
                    sessionStarted: appointmentData.sessionStarted,
                    encounterId: appointmentData.encounterId,
                })
            } else {
                navigate(Screens.TELEHEALTH_WELCOME, {
                    appointment: appointmentData.appointment,
                    sessionId: appointmentData.sessionId,
                    token: appointmentData.token,
                    sessionStarted: appointmentData.sessionStarted,
                    encounterId: appointmentData.encounterId,
                })
            }
        }
    }

    navigateToNextScreen = () => {
        const index = this.state.currentIndex + 1;
        if (index < this.state.associatedTagsLength) {
            this.setState({currentIndex: index})
        } else {
            this.startTelehealth(false);
        }
    };


    isRelatedTo = (key, item) => {
        return item.tagMetaData.specification[key] && item.tagMetaData.specification[key].length > 0;
    };

    appendSubText = (text, subText) => {
        if (!subText) {
            return text;
        }
        if (subText.length > 0) {
            subText = subText + '\n';
        }
        return subText + text;
    };

    getRelatedToText = (item) => {
        let subText = null;
        if (item.tagMetaData && item.tagMetaData.specification) {
            if (this.isRelatedTo('relatedToMedicalCondition', item)) {
                subText = this.appendSubText('Related To Medical Condition', subText);
            }
            if (this.isRelatedTo('relatedToMedication', item)) {
                subText = this.appendSubText('Related To Medication', subText);
            }
            if (this.isRelatedTo('relatedToSubstanceUse', item)) {
                subText = this.appendSubText('Related To Substance Use', subText);
            }
            if (this.isRelatedTo('relatedToWithdrawal', item)) {
                subText = this.appendSubText('Related To Withdrawal', subText);
            }
        }
        return subText;
    };


    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                {
                    this.state.associatedTagsData[this.state.currentIndex] && (
                        <>
                            <PreApptHeader
                                onPress={() => {
                                    this.backClicked(this.state.currentIndex - 1)
                                }}
                                headerText={'Review ' + this.state.associatedTagsData[this.state.currentIndex].typeName}
                            />

                            <Content>
                                <AssociatedTagsList
                                    data={this.state.associatedTagsData[this.state.currentIndex].relatedElements}
                                    getRelatedToText={this.getRelatedToText}
                                    getPatientAssociatedTagDetails={this.getPatientAssociatedTagDetails}/>
                            </Content>

                            <View {...addTestID('view')} style={styles.greBtn}>
                                <PrimaryButton testId="continue" onPress={this.navigateToNextScreen} text="Continue"/>
                            </View>

                            <DomainElementDetailModal
                                onClose={this.detailDrawerClose}
                                selectedTag={this.state.selectedTagDetails}
                                lookupData={this.state.lookupData}
                                segments={this.tagDetailSegments}
                                visible={this.state.detailVisible}
                            />
                        </>
                    )
                }


            </Container>
        );
    }
}

const styles = StyleSheet.create({
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
    },

    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: Colors.colors.white,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12
    },
});
