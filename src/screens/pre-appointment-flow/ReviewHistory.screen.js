import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    AlertUtil,
    AlfieLoader
} from 'ch-mobile-shared';
import {PreApptHeader} from "../../components/pre-appointment/PreApptHeader.component";
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import ConversationService from "../../services/ConversationService";
import LottieView from "lottie-react-native";
import teamAnim from '../../assets/animations/Dog_with_Computer';
import AntIcons from "react-native-vector-icons/AntDesign";

export default class ReviewHistoryScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.manualView = navigation.getParam('manualView', false);
        this.state = {
            isLoading: true,
            historyData: {},
            lookupData: {}
        };
    }

    /**
     * @function getPatientHistory
     * @description This method is used to get Patient History Details for given user.
     */

    getPatientHistory = async () => {
        try {
            const historicalData = await ProfileService.getUserHistory(this.connection.connectionId);
            if (historicalData.errors) {
                AlertUtil.showErrorMessage(historicalData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                const tagItem = historicalData.tagItems[0];

                if (!tagItem.metaData) {
                    this.setState({historyData: {}, isLoading: false});
                } else {
                    this.setState({historyData: historicalData.tagItems[0].metaData.historyInfo, isLoading: false});
                }


            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e.message)
        }
    };


    /**
     * @function getPatientLookupValues
     * @description This method is used to get lookup values for Patient History.
     */

    getPatientLookupValues = async () => {
        try {
            const lookupData = await ConversationService.getDomainLookups();
            if (lookupData.errors) {
                AlertUtil.showErrorMessage(lookupData.errors[0].endUserMessage);
            } else {
                this.setState({lookupData: lookupData.lookupMap});
            }

        } catch (e) {
            console.log(e)
        }
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };


    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.REVIEW_SOCIAL_DETERMINANT_SCREEN, {
            connection: this.connection
        });
    };

    componentDidMount = async () => {

        await this.getPatientLookupValues();
        await this.getPatientHistory();
    }

    renderEmptyMessage = () => {
        return (
            <View>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.noAccessAnim}
                    resizeMode="cover"
                    source={teamAnim}
                    autoPlay={true}
                    loop/>
                <Text style={styles.noAccessText}>Medical history for this member hasn't been reported so far.</Text>
            </View>
        );
    };

    getLookupValue = (array, valueToLookFor) => {
        if (!array || array.length === 0) {
            return null;
        }
        const found = array.find(data => data.name === valueToLookFor);
        if (!found) {
            return null;
        }
        return (
            <Text style={styles.infoContent}>{found.value}</Text>
        )
    }

    getLookupValueArray = (lookupArray, valueArrayToLookFor) => {
        let res = lookupArray.filter(item => valueArrayToLookFor.find(data => data === item.name)).flatMap(item => item.value)
        return res.join(', ')
    }

    renderNotAttemptedView = () => {
        return <View style={styles.itemIcon}>
            <AntIcons size={24} color={Colors.colors.neutral100Icon}
                      name="closecircleo"/>
        </View>
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
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
                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review history'}
                />
                <Content>
                    <View style={styles.historyList}>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Sex Assigned</Text>

                                {this.state.historyData.sexAssigned !== undefined ? this.getLookupValue(this.state.lookupData.sex, this.state.historyData.sexAssigned) : (
                                    <Text style={styles.infoContent}>No data</Text>)}
                            </View>
                            {
                                this.state.historyData.sexAssigned === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Gender identity</Text>
                                {this.state.historyData.genderIdentity !== undefined ? this.getLookupValue(this.state.lookupData.genderIdentity, this.state.historyData.genderIdentity) : (
                                    <Text style={styles.infoContent}>No data</Text>)}
                            </View>
                            {
                                this.state.historyData.genderIdentity === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Gender pronoun</Text>
                                {this.state.historyData.genderPronoun !== undefined ? this.getLookupValue(this.state.lookupData.genderPronoun, this.state.historyData.genderPronoun) : (
                                    <Text style={styles.infoContent}>No data</Text>)}
                            </View>
                            {
                                this.state.historyData.genderPronoun === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously seen a Provider</Text>
                                {
                                    this.state.historyData.previouslySeenProvider === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {this.state.historyData.previouslySeenProvider !== undefined ? (
                                <Text style={
                                    (this.state.historyData.previouslySeenProvider === true) ?
                                        styles.yesNoText :
                                        [styles.yesNoText, {color: Colors.colors.errorText}]
                                }>{this.state.historyData.previouslySeenProvider ? 'Yes' : 'No'}</Text>
                            ) : this.renderNotAttemptedView()}
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously diagnosed</Text>
                                {
                                    this.state.historyData.previouslyDiagnosed === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.previouslyDiagnosed !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.previouslyDiagnosed === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.previouslyDiagnosed ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previous overdose</Text>
                                {
                                    this.state.historyData.previousOverDose === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.previousOverDose !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.previousOverDose === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.previousOverDose ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously hospitalized for psychiatric
                                    care</Text>
                                {
                                    this.state.historyData.previouslyHospitalizedForPsychiatricCare === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.previouslyHospitalizedForPsychiatricCare !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.previouslyHospitalizedForPsychiatricCare === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.previouslyHospitalizedForPsychiatricCare ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previous suicide attempt</Text>
                                {
                                    this.state.historyData.previousSuicideAttempt === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.previousSuicideAttempt !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.previousSuicideAttempt === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.previousSuicideAttempt ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Has support network</Text>
                                {
                                    this.state.historyData.hasSupportNetwork === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.hasSupportNetwork !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.hasSupportNetwork === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.hasSupportNetwork ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Criminal justice involvement</Text>
                                {
                                    this.state.historyData.criminalJusticeInvolvement === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.criminalJusticeInvolvement !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.criminalJusticeInvolvement === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.criminalJusticeInvolvement ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }


                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously diagnosed mental health
                                    conditions</Text>
                                {
                                    this.state.historyData.previouslyDiagnosedMentalHealthConditions !== undefined ?
                                        (
                                            <>
                                                {
                                                    this.state.historyData.previouslyDiagnosedMentalHealthConditions.length > 0 && (
                                                        <Text style={styles.infoContent}>
                                                            {this.getLookupValueArray(this.state.lookupData.mentalHealthCondition, this.state.historyData.previouslyDiagnosedMentalHealthConditions)}
                                                        </Text>
                                                    )
                                                }
                                            </>
                                        ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.previouslyDiagnosedMentalHealthConditions === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Mental health conditions currently treated
                                    for</Text>
                                {this.state.historyData.mentalHealthConditionsCurrentlyTreatedFor !== undefined ? (
                                    <>
                                        {
                                            this.state.historyData.mentalHealthConditionsCurrentlyTreatedFor.length > 0 && (
                                                <Text style={styles.infoContent}>
                                                    {this.getLookupValueArray(this.state.lookupData.mentalHealthCondition, this.state.historyData.mentalHealthConditionsCurrentlyTreatedFor)}
                                                </Text>
                                            )
                                        }
                                    </>
                                ) : (<Text style={styles.infoContent}>No data</Text>)
                                }

                            </View>
                            {
                                this.state.historyData.mentalHealthConditionsCurrentlyTreatedFor === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Family mental health conditions</Text>
                                {
                                    this.state.historyData.familyMentalHealthConditions !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.familyMentalHealthConditions.length > 0 && (
                                                    <Text style={styles.infoContent}>
                                                        {this.getLookupValueArray(this.state.lookupData.mentalHealthCondition, this.state.historyData.familyMentalHealthConditions)}
                                                    </Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.familyMentalHealthConditions === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously diagnosed medical conditions</Text>
                                {
                                    this.state.historyData.previouslyDiagnosedMedicalConditions !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.previouslyDiagnosedMedicalConditions.length > 0 && (
                                                    <Text style={styles.infoContent}>
                                                        {this.getLookupValueArray(this.state.lookupData.medicalCondition, this.state.historyData.previouslyDiagnosedMedicalConditions)}
                                                    </Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.previouslyDiagnosedMedicalConditions === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Medical conditions currently treated
                                    for</Text>
                                {
                                    this.state.historyData.medicalConditionsCurrentlyTreatedFor !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.medicalConditionsCurrentlyTreatedFor.length > 0 &&
                                                (
                                                    <Text style={styles.infoContent}>
                                                        {this.getLookupValueArray(this.state.lookupData.medicalCondition, this.state.historyData.medicalConditionsCurrentlyTreatedFor)}
                                                    </Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.medicalConditionsCurrentlyTreatedFor === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Family medical conditions</Text>
                                {
                                    this.state.historyData.familyMedicationConditions !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.familyMedicationConditions.length > 0 && (
                                                    <Text style={styles.infoContent}>
                                                        {this.getLookupValueArray(this.state.lookupData.medicalCondition, this.state.historyData.familyMedicationConditions)}
                                                    </Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.familyMedicationConditions === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previous problems with medication</Text>
                                {
                                    this.state.historyData.previousProblemsWithMedication !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.previousProblemsWithMedication !== '' && (
                                                    <Text style={styles.infoContent}>
                                                        {this.state.historyData.previousProblemsWithMedication}
                                                    </Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.previousProblemsWithMedication === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Allergies</Text>
                                {
                                    this.state.historyData.allergies !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.allergies.length > 0 && (
                                                    <Text
                                                        style={styles.infoContent}>{this.state.historyData.allergies.join(", ")}</Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.allergies === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Preferred pharmacy</Text>
                                {
                                    this.state.historyData.preferredPharmacy !== undefined ? (
                                        <>
                                            {
                                                this.state.historyData.preferredPharmacy !== '' && (
                                                    <Text
                                                        style={styles.infoContent}>{this.state.historyData.preferredPharmacy}</Text>
                                                )
                                            }
                                        </>
                                    ) : (<Text style={styles.infoContent}>No data</Text>)

                                }
                            </View>
                            {
                                this.state.historyData.preferredPharmacy === undefined && this.renderNotAttemptedView()
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.singleHistoryEntry}>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMainTitle}>Previously recieved substance use
                                    treatment</Text>
                                {
                                    this.state.historyData.previouslyReceivedSubstanceUseTreatment === undefined && (
                                        <Text style={styles.infoContent}>No data</Text>)
                                }
                            </View>
                            {
                                this.state.historyData.previouslyReceivedSubstanceUseTreatment !== undefined ? (
                                    <Text style={
                                        (this.state.historyData.previouslyReceivedSubstanceUseTreatment === true) ?
                                            styles.yesNoText :
                                            [styles.yesNoText, {color: Colors.colors.errorText}]
                                    }>{this.state.historyData.previouslyReceivedSubstanceUseTreatment ? 'Yes' : 'No'}</Text>
                                ) : this.renderNotAttemptedView()
                            }

                        </TouchableOpacity>
                    </View>
                </Content>
                {
                    !this.manualView && (
                        <View
                            {...addTestID('view')}
                            style={styles.greBtn}>
                            <PrimaryButton
                                testId="continue"
                                onPress={() => {
                                    this.navigateToNextScreen();
                                }}
                                text="Continue"
                            />
                        </View>
                    )
                }


            </Container>
        );
    }
}

const styles = StyleSheet.create({
    historyList: {
        paddingLeft: 15,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    singleHistoryEntry: {
        paddingTop: 24,
        paddingBottom: 24,
        marginBottom: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: Colors.colors.borderColor,
        borderBottomWidth: 1,
    },
    historyMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 4,
        flex: 1
    },
    historyDetails: {
        paddingLeft: 12,
        flex: 0.8
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS
    },
    yesNoText: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        flex: 0.1
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    noAccessAnim: {
        width: 250,
        height: 250,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    noAccessText: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        letterSpacing: 0.32,
        lineHeight: 16,
        textAlign: 'center',
        padding: 20,
    },
    itemIcon: {
        paddingLeft: 20,
        marginTop: -5
    },
});
