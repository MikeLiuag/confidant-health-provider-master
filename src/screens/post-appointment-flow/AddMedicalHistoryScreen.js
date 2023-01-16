import React, {Component} from 'react';
import {FlatList, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    FloatingInputField,
    getHeaderHeight, getLookupPair,
    getNamesByLookupKey,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles,
    ToggleSwitch
} from 'ch-mobile-shared';
import {DropDownInputField} from "ch-mobile-shared/src/components/DropDownInputField";
import Modal from 'react-native-modalbox';
import EntypoIcons from "react-native-vector-icons/Entypo";
import ConversationService from "../../services/ConversationService";
import Loader from "../../components/Loader";

const HEADER_SIZE = getHeaderHeight();

export default class AddMedicalHistoryScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.patientId = navigation.getParam('patientId', null);
        this.state = {
            isLoading: true,
            historyElementId: '',
            lookupMap: {},
            modalTitle: '',
            modalLookupKey: '',
            modalOnSubmit: null,
            modalSelectedValues: [],
            modalOpen: false,
            currentAllergy: '',
            historyInfo: {
                allergies: [],
                criminalJusticeInvolvement: false,
                familyMedicationConditions: [],
                familyMentalHealthConditions: [],
                genderIdentity: '',
                genderPronoun: '',
                hasSupportNetwork: false,
                medicalConditionsCurrentlyTreatedFor: [],
                mentalHealthConditionsCurrentlyTreatedFor: [],
                preferredPharmacy: '',
                previousOverDose: false,
                previousProblemsWithMedication: '',
                previousSuicideAttempt: false,
                previouslyDiagnosed: false,
                previouslyDiagnosedMedicalConditions: [],
                previouslyDiagnosedMentalHealthConditions: [],
                previouslyHospitalizedForPsychiatricCare: false,
                previouslyReceivedSubstanceUseTreatment: false,
                previouslySeenProvider: false,
                sexAssigned: ''
            }
        };
    }

    componentDidMount() {
        this.getMedicalHistory();
    }

    getLookupKeys = async () => {
        try {
            const response = await ConversationService.getDomainLookups();
            if (response.errors) {
                AlertUtil.showError(response.errors[0].endUserMessage);
            } else {
                this.setState({
                    lookupMap: response.lookupMap
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

    getMedicalHistory = async () => {
        await this.getLookupKeys();
        const patientId = this.patientId
        const response = await ConversationService.getMedicalHistory(patientId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.backClicked();
        } else {
            if (response.tagItems && response.tagItems.length > 0) {
                const tagItem = response.tagItems[0];
                let {historyInfo} = this.state;
                if (tagItem.metaData && tagItem.metaData.historyInfo) {
                    historyInfo = tagItem.metaData.historyInfo;
                }
                this.setState({
                    isLoading: false,
                    historyElementId: tagItem.domainElementId,
                    historyInfo: this.sanitizeHistory(historyInfo)
                });
            } else {
                AlertUtil.showErrorMessage("Medical History not configured in system");
                this.backClicked();
            }
        }
    };

    sanitizeHistory = (historyInfo) =>{

        historyInfo.familyMedicationConditions = this.getLookupPairs(historyInfo.familyMedicationConditions, 'medicalCondition');
        historyInfo.familyMentalHealthConditions = this.getLookupPairs(historyInfo.familyMentalHealthConditions, 'mentalHealthCondition');
        historyInfo.medicalConditionsCurrentlyTreatedFor = this.getLookupPairs(historyInfo.medicalConditionsCurrentlyTreatedFor, 'medicalCondition');;
        historyInfo.mentalHealthConditionsCurrentlyTreatedFor = this.getLookupPairs(historyInfo.mentalHealthConditionsCurrentlyTreatedFor, 'mentalHealthCondition');
        historyInfo.previouslyDiagnosedMedicalConditions = this.getLookupPairs(historyInfo.previouslyDiagnosedMedicalConditions, 'medicalCondition');
        historyInfo.previouslyDiagnosedMentalHealthConditions = this.getLookupPairs(historyInfo.previouslyDiagnosedMentalHealthConditions, 'mentalHealthCondition');
        return historyInfo;
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };


    conditionDrawerClose = () => {
        this.setState({
            modalTitle: '',
            modalLookupKey: '',
            modalOnSubmit: null,
            modalSelectedValues: [],
            modalOpen: false
        })

    };

    navigateToNextScreen = () => {
        // this.props.navigation.navigate(Screens.ADD_SOCIAL_DETERMINANTS_SCREEN);
    };

    renderChip = (value) => {
        return <View style={styles.singleDiagnose}>
            <Text style={styles.diagnoseText}>
                {value.hasOwnProperty('value') ? value.value : value}
            </Text>
        </View>
    };
    renderRemovableChip = (value, onRemove) => {
        return <TouchableOpacity style={styles.singleDiagnose} onPress={() => {
            onRemove(value)
        }}>
            <Text style={styles.diagnoseText}>
                {value.hasOwnProperty('value') ? value.value : value}
            </Text>
        </TouchableOpacity>
    };

    openMultiValueModal = (title, lookupKey, selectedValues, onSubmit) => {
        this.setState({
            modalTitle: title,
            modalLookupKey: lookupKey,
            modalOnSubmit: onSubmit,
            modalSelectedValues: selectedValues,
            modalOpen: true
        })
    };

    renderMultiSelectionValues = (stateKey, lookupKey, title, historyInfo) => {
        return <View style={styles.historyBox}>
            <Text style={styles.boxHeader}>{title}</Text>
            {
                historyInfo[stateKey] && historyInfo[stateKey].length > 0 && (
                    <View style={styles.diagnoseList}>
                        {historyInfo[stateKey].map(this.renderChip)}
                    </View>
                )
            }
            <PrimaryButton
                testId="edit"
                bgColor={Colors.colors.primaryColorBG}
                textColor={Colors.colors.primaryText}
                onPress={() => {
                    this.openMultiValueModal(title, lookupKey, historyInfo[stateKey], (values) => {
                        historyInfo[stateKey] = values;
                        this.setState({historyInfo});
                    });
                }}
                text="Edit"
            />
        </View>
    }

    validateHistory = () => {
        const {historyInfo} = this.state;
        if (historyInfo.sexAssigned === '') {
            AlertUtil.showErrorMessage("Sex Assigned is Required");
            return false
        }
        if (historyInfo.genderIdentity === '') {
            AlertUtil.showErrorMessage("Gender Identity is Required");
            return false
        }
        if (historyInfo.genderPronoun === '') {
            AlertUtil.showErrorMessage("Gender Pronoun is Required");
            return false
        }
        return true;
    };

    saveMedicalHistory = async () => {
        if (this.validateHistory()) {
            const {historyInfo} = this.state;
            historyInfo.familyMedicationConditions = historyInfo.familyMedicationConditions?.map(el => el.name) || [];
            historyInfo.familyMentalHealthConditions = historyInfo.familyMentalHealthConditions?.map(el => el.name) || [];
            historyInfo.medicalConditionsCurrentlyTreatedFor = historyInfo.medicalConditionsCurrentlyTreatedFor?.map(el => el.name) || [];
            historyInfo.mentalHealthConditionsCurrentlyTreatedFor = historyInfo.mentalHealthConditionsCurrentlyTreatedFor?.map(el => el.name) || [];
            historyInfo.previouslyDiagnosedMedicalConditions = historyInfo.previouslyDiagnosedMedicalConditions?.map(el => el.name) || [];
            historyInfo.previouslyDiagnosedMentalHealthConditions = historyInfo.previouslyDiagnosedMentalHealthConditions?.map(el => el.name) || [];
            const userId = this.patientId;
            const payload = {
                patientId: userId,
                tagItems: [
                    {
                        domainElementId: this.state.historyElementId,
                        metaData: {
                            historyInfo
                        }
                    }
                ]
            };
            this.setState({isLoading: true});
            const response = await ConversationService.associateDomainElement(payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                AlertUtil.showSuccessMessage("Medical History updated");
                this.backClicked();
            }

        }
    };

    getLookupPairs = (keys, lookupKey)=>{
        if(!keys) {
            return [];
        }
        return keys.map(key=> getLookupPair(lookupKey, key, this.state.lookupMap));
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {historyInfo, modalLookupKey} = this.state;
        let modalSelectedValues = this.state.modalSelectedValues;
        let modalKeyValues = [];
        if (modalLookupKey !== '') {
            const keyValues = this.state.lookupMap[modalLookupKey];
            if (keyValues && keyValues.length > 0) {
                modalKeyValues = keyValues
            }

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
                <Content
                    enableResetScrollToCoords={false}
                    contentContainerStyle={{paddingTop: 24}}>
                    <View style={styles.titleWrap}>
                        <Text style={styles.mainHeader}>
                            Update Medical History
                        </Text>
                    </View>

                    <View style={styles.genderBox}>
                        <Text style={styles.boxHeader}>Sex Assigned</Text>
                        <View>
                            <DropDownInputField keyValuePair
                                testId={'medication-days'}
                                hasError={false}
                                hasFocus={false}
                                keyboardType={'default'}
                                onChange={(value) => {
                                    historyInfo.sexAssigned = value;
                                    this.setState({historyInfo});
                                }}
                                value={historyInfo.sexAssigned}
                                labelText={'gender'}
                                editable={true}
                                options={this.state.lookupMap.sex}
                                type={'None'}
                                dropDownIconColor={Colors.colors.mainBlue}

                            />
                        </View>
                    </View>
                    <View style={styles.genderBox}>
                        <Text style={styles.boxHeader}>Gender identity</Text>
                        <View>
                            <DropDownInputField keyValuePair
                                testId={'medication-days'}
                                hasError={false}
                                hasFocus={false}
                                keyboardType={'default'}
                                onChange={(value) => {
                                    historyInfo.genderIdentity = value;
                                    this.setState({historyInfo});
                                }}
                                value={historyInfo.genderIdentity}
                                labelText={'gender'}
                                editable={true}
                                options={this.state.lookupMap.genderIdentity}
                                type={'None'}
                                dropDownIconColor={Colors.colors.mainBlue}

                            />
                        </View>
                    </View>
                    <View style={styles.genderBox}>
                        <Text style={styles.boxHeader}>Gender pronoun</Text>
                        <View>
                            <DropDownInputField keyValuePair
                                testId={'medication-days'}
                                hasError={false}
                                hasFocus={false}
                                keyboardType={'default'}
                                onChange={(value) => {
                                    historyInfo.genderPronoun = value;
                                    this.setState({historyInfo});
                                }}
                                value={historyInfo.genderPronoun}
                                labelText={'gender'}
                                editable={true}
                                options={this.state.lookupMap.genderPronoun}
                                type={'None'}
                                dropDownIconColor={Colors.colors.mainBlue}

                            />
                        </View>
                    </View>

                    <View style={styles.historyBox}>
                        <Text style={styles.boxHeader}>Medical history</Text>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previously seen a provider</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previouslySeenProvider}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previouslySeenProvider = !historyInfo.previouslySeenProvider;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previously diagnosed</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previouslyDiagnosed}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previouslyDiagnosed = !historyInfo.previouslyDiagnosed;
                                        historyInfo.previouslyDiagnosedMedicalConditions = [];
                                        historyInfo.previouslyDiagnosedMentalHealthConditions = [];
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        {
                            historyInfo.previouslyDiagnosed && this.renderMultiSelectionValues(
                                'previouslyDiagnosedMentalHealthConditions',
                                'mentalHealthCondition',
                                'Previously diagnosed mental health conditions',
                                historyInfo
                            )
                        }

                        {
                            historyInfo.previouslyDiagnosed && this.renderMultiSelectionValues(
                                'previouslyDiagnosedMedicalConditions',
                                'medicalCondition',
                                'Previously diagnosed medical conditions',
                                historyInfo
                            )
                        }


                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previous overdose</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previousOverDose}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previousOverDose = !historyInfo.previousOverDose;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previously hospitalized for psychiatric care</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previouslyHospitalizedForPsychiatricCare}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previouslyHospitalizedForPsychiatricCare = !historyInfo.previouslyHospitalizedForPsychiatricCare;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previous suicide attempt</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previousSuicideAttempt}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previousSuicideAttempt = !historyInfo.previousSuicideAttempt;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Previous received substance use treatment</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.previouslyReceivedSubstanceUseTreatment}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.previouslyReceivedSubstanceUseTreatment = !historyInfo.previouslyReceivedSubstanceUseTreatment;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Has support network</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.hasSupportNetwork}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.hasSupportNetwork = !historyInfo.hasSupportNetwork;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                        <View style={styles.toggleBox}>
                            <Text style={styles.toggleText}>Criminal justice involvement</Text>
                            <View>
                                <ToggleSwitch
                                    testId={'medication-toggle'}
                                    switchOn={historyInfo.criminalJusticeInvolvement}
                                    backgroundColorOn={Colors.colors.secondaryIcon}
                                    onPress={() => {
                                        historyInfo.criminalJusticeInvolvement = !historyInfo.criminalJusticeInvolvement;
                                        this.setState({historyInfo});
                                    }}
                                />
                            </View>
                        </View>
                    </View>


                    {
                        this.renderMultiSelectionValues(
                            'mentalHealthConditionsCurrentlyTreatedFor',
                            'mentalHealthCondition',
                            'Mental health conditions currently treated for',
                            historyInfo
                        )
                    }
                    {
                        this.renderMultiSelectionValues(
                            'familyMentalHealthConditions',
                            'mentalHealthCondition',
                            'Family mental health conditions',
                            historyInfo
                        )
                    }

                    {
                        this.renderMultiSelectionValues(
                            'medicalConditionsCurrentlyTreatedFor',
                            'medicalCondition',
                            'Medical conditions currently treated for',
                            historyInfo
                        )
                    }
                    {
                        this.renderMultiSelectionValues(
                            'familyMedicationConditions',
                            'medicalCondition',
                            'Family medical conditions',
                            historyInfo
                        )
                    }
                    <View style={styles.historyBox}>
                        <Text style={styles.boxHeader}>Previous problems with medication</Text>
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={'default'}
                            // blur={this.validateName}
                            // focus={this.focusName}
                            changeText={(value) => {
                                historyInfo.previousProblemsWithMedication = value;
                                this.setState({historyInfo});
                            }}
                            returnKeyType={'next'}
                            // submitEditing={this.performLogin}
                            value={historyInfo.previousProblemsWithMedication}
                            // labelErrorText={''}
                            labelText={'Previous problems with medication'}
                            editable={true}
                        />
                    </View>
                    <View style={styles.historyBox}>
                        <Text style={styles.boxHeader}>Allergies</Text>
                        {
                            historyInfo.allergies && historyInfo.allergies.length > 0 && (
                                <View style={styles.diagnoseList}>
                                    {historyInfo.allergies.map((value) => this.renderRemovableChip(value, (removedValue) => {
                                        historyInfo.allergies = historyInfo.allergies.filter(v => v !== removedValue);
                                        this.setState({
                                            historyInfo
                                        });
                                    }))}
                                </View>
                            )
                        }
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={'default'}
                            // blur={this.validateName}
                            // focus={this.focusName}
                            changeText={(value) => {
                                this.setState({currentAllergy: value});
                            }}
                            returnKeyType={'next'}
                            // submitEditing={this.performLogin}
                            value={this.state.currentAllergy}
                            // labelErrorText={''}
                            labelText={'Type Single Allergy Here'}
                            editable={true}
                        />
                        {
                            this.state.currentAllergy !== '' && (
                                <PrimaryButton
                                    testId="Select"
                                    bgColor={Colors.colors.primaryColorBG}
                                    textColor={Colors.colors.primaryText}
                                    onPress={() => {
                                        if(historyInfo.allergies) {
                                            historyInfo.allergies.push(this.state.currentAllergy);
                                        } else {
                                            historyInfo.allergies = [this.state.currentAllergy]
                                        }

                                        this.setState({
                                            currentAllergy: '',
                                            historyInfo
                                        })
                                    }}
                                    text="Add Allergy"
                                />
                            )
                        }

                    </View>
                    <View style={styles.historyBox}>
                        <Text style={styles.boxHeader}>Preferred Pharmacy</Text>
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={'default'}
                            changeText={(value) => {
                                historyInfo.preferredPharmacy = value;
                                this.setState({historyInfo});
                            }}
                            returnKeyType={'next'}
                            // submitEditing={this.performLogin}
                            value={historyInfo.preferredPharmacy}
                            // labelErrorText={''}
                            labelText={'Preferred Pharmacy'}
                            editable={true}
                        />
                    </View>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <PrimaryButton
                            testId="Select"
                            onPress={this.saveMedicalHistory}
                            text="Continue"
                        />
                    </View>

                </Content>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={this.state.modalOpen}
                    onClosed={this.conditionDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '80%'}}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalMentalCondition"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.conditionTitle}>{this.state.modalTitle}</Text>
                        <Text style={styles.conditionSubTitle}>Select all that applicable</Text>
                        <FlatList
                            data={modalKeyValues}
                            style={styles.conditionList}
                            renderItem={({item, index}) =>
                                <SingleCheckListItem
                                    listTestId={'list - ' + index + 1}
                                    checkTestId={'checkbox - ' + index + 1}
                                    keyId={index}
                                    listPress={() => {
                                        if (modalSelectedValues.includes(item)) {
                                            modalSelectedValues = modalSelectedValues.filter(el => el.name !== item.name);
                                        } else {
                                            modalSelectedValues.push(item);
                                        }
                                        this.setState({
                                            modalSelectedValues
                                        });
                                    }}
                                    itemSelected={modalSelectedValues.includes(item)}
                                    itemTitle={item.value}
                                />
                            }
                            keyExtractor={item => item.id}
                        />

                    </Content>
                    <View
                        {...addTestID('view')}
                        style={{ paddingVertical: 24 }}>
                        <PrimaryButton
                            testId="continue"
                            onPress={() => {
                                this.state.modalOnSubmit(modalSelectedValues);
                                this.conditionDrawerClose();
                            }}
                            text="Continue"
                        />
                    </View>
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
        marginBottom: 16,
        marginTop: 12,
        paddingLeft: 24,
        paddingRight: 24
    },
    mainHeader: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.highContrast,
        marginBottom: 22
    },
    medicationBox: {
        paddingHorizontal: 24
    },
    medicineName: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextL,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 16
    },
    boxHeader: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextL,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 32
    },
    medicineInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    medicineDose: {
        width: '45%',
        marginRight: 16
    },
    medicineAmount: {
        width: '45%'
    },
    mediRefillBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 32
    },
    refillText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium
    },
    toggleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16
    },
    toggleText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        flex: 1,
        paddingRight: 10
    },
    genderBox: {
        paddingHorizontal: 24,
        marginVertical: 16
    },
    historyBox: {
        paddingHorizontal: 24,
        marginVertical: 32
    },
    diagnoseList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 32
    },
    singleDiagnose: {
        ...CommonStyles.styles.shadowBox,
        paddingHorizontal: 12,
        paddingVertical: 5,
        margin: 4,
        borderRadius: 16,
        backgroundColor: Colors.colors.highContrastBG
    },
    diagnoseText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium
    },
    conditionTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 8
    },
    conditionSubTitle: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        marginBottom: 40
    },
    conditionList: {
        paddingBottom: 20
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    }
});
