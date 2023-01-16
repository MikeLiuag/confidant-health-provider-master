import React, {Component} from 'react';
import {FlatList, Platform, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors, CommonStyles,
    CommonTextArea,
    FloatingInputField,
    getHeaderHeight, getLookupPair,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles,
    ToggleSwitch
} from 'ch-mobile-shared';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {SingleTagItem} from "../../components/post-appointment/SingleTagItem.component";
import {Screens} from '../../constants/Screens';
import {DropDownInputField} from "ch-mobile-shared/src/components/DropDownInputField";
import ConversationService from "../../services/ConversationService";
import Loader from "../../components/Loader";
import {DOMAIN_IMPORTANCE_COLORS, DOSE_REGEX, SEGMENT_EVENT} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";
import moment from "moment";

const HEADER_SIZE = getHeaderHeight();
const IMPORTANCE_ORDERS = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
    RESOLVED: 5,
    MISREPORTED: 6,
    UNRELATED: 7
}

export default class AssignDomainElementScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.patientId = navigation.getParam('patientId', null);
        this.selectedElements =navigation.getParam("selectedElements", []);
        this.selectedType = navigation.getParam("selectedType", null);
        this.relatedMedications = navigation.getParam("relatedMedications", []);
        this.relatedSubstanceUse = navigation.getParam("relatedSubstanceUse", []);
        this.segmentSessionCompletedPayload = navigation.getParam('segmentSessionCompletedPayload', null);
        this.appointment = navigation.getParam('appointment', null);
        this.provider = navigation.getParam('provider', null);
        this.state = {
            isLoading: false,
            selections: this.initializeEmptyInfo(),
            lookupMap: {},
        };
    }

    componentDidMount() {
        this.getLookupKeys();
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

    getLookupPairs = (keys, lookupKey)=>{
       return (keys && keys.map(key=> getLookupPair(lookupKey, key, this.state.lookupMap))) || [];
    };

    initializeEmptyInfo = () => {
        const selections = {};
        this.selectedElements.forEach(domainElement => {
            const {metaDataSpec} = domainElement.metaData;
            const supportedImportanceLevels = this.getSupportedImportanceLevels(domainElement);
            const values = {};
            if (supportedImportanceLevels.length > 0) {
                values.selectedImportance = '';
            }
            if (metaDataSpec.requireSubstanceUse) {
                values.substanceUse = {
                    methodOfUse: '',
                    unitOfUse: '',
                    lastUse: '',
                    howLongUsingThisLevel: '',
                    currentFrequencyOfUse: ''
                };
            }
            if (metaDataSpec.requireRxInfo) {
                values.rxDrugInfo = {
                    dose: '',
                    doseUnit: '',
                    supply: '',
                    supplyUnit: '',
                    doseFrequency: '',
                    refillable: true

                }
            }
            if (metaDataSpec.requireNotes) {
                values.notes = '';
            }
            if (metaDataSpec.requireInterferenceWithLifeInfo) {
                values.interferenceInLife = false;
            }
            if (metaDataSpec.requireSpecification) {
                values.specification = {
                    relatedToMedicalCondition: [],
                    relatedToMedication: [],
                    relatedToSubstanceUse: [],
                    relatedToWithdrawal: [],
                };
                values.toggles = {
                    relatedToMedicalCondition: false,
                    relatedToMedication: false,
                    relatedToSubstanceUse: false,
                    relatedToWithdrawal: false,
                };

            }

            selections[domainElement.Id] = values;
        });
        return selections;
    };

    getSupportedImportanceLevels = (domainElement) => {
        const {metaDataSpec} = domainElement.metaData;
        const {importanceLevels} = metaDataSpec;
        return Object.keys(importanceLevels)
            .filter(key => !!importanceLevels[key])
            .sort((v1,v2)=>{
                return IMPORTANCE_ORDERS[v1]-IMPORTANCE_ORDERS[v2]
            })
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    validateDose = (dose) => {
        if (dose.startsWith('.')) {
            dose = '0' + dose;
        }
        if (dose.indexOf('.') === -1) {
            dose = dose + '.0';
        }
        if (dose.indexOf('.') === dose.length - 1) {
            return false;
        }
        const doseError = !DOSE_REGEX.test(dose);
        return !doseError;
    };

    isFormValid = () => {
        let validated = true;
        for (let i = 0; i < this.selectedElements.length; i++){
            const domainElement = this.selectedElements[i];
            const supportedImportanceLevels = this.getSupportedImportanceLevels(domainElement);
            const {metaDataSpec} = domainElement.metaData;
            const selections = this.state.selections[domainElement.Id];
            const lookupMap = this.state.lookupMap;
            if (supportedImportanceLevels.length > 0) {
                if (selections.selectedImportance === null || selections.selectedImportance === '') {
                    AlertUtil.showErrorMessage("Select importance level for " + domainElement.name);
                    return false;
                }
            }
            if (metaDataSpec.requireSubstanceUse) {
                if (selections.substanceUse) {
                    const substanceUse = selections.substanceUse

                    if (substanceUse.methodOfUse.trim() === '' || substanceUse.methodOfUse.trim() === null) {
                        AlertUtil.showErrorMessage("Method of use required " + domainElement.name);
                        return false;
                    }
                    if (substanceUse.unitOfUse.trim() === '' || substanceUse.unitOfUse.trim() === null) {
                        AlertUtil.showErrorMessage("Unit of use required " + domainElement.name);
                        return false;
                    }
                    if (substanceUse.lastUse.trim() === '' || substanceUse.lastUse.trim() === null) {
                        AlertUtil.showErrorMessage("Last use required " + domainElement.name);
                        return false;
                    }
                    if (substanceUse.howLongUsingThisLevel.trim() === '' || substanceUse.howLongUsingThisLevel.trim() === null) {
                        AlertUtil.showErrorMessage("How long using this level Required " + domainElement.name);
                        return false;
                    }
                    if (substanceUse.currentFrequencyOfUse.trim() === '' || substanceUse.currentFrequencyOfUse.trim() === null) {
                        AlertUtil.showErrorMessage("Current frequency required " + domainElement.name);
                        return false;
                    }
                }
            }
            if (metaDataSpec.requireRxInfo) {
                if (selections.rxDrugInfo) {
                    const rxDrugInfo = selections.rxDrugInfo
                    let doseValid = !this.validateDose(rxDrugInfo.dose);
                    if (rxDrugInfo.dose.trim() === null || rxDrugInfo.dose.trim() === '' || doseValid) {
                        AlertUtil.showErrorMessage(doseValid ? "Invalid dose" : "Dose required" + domainElement.name);
                        return false;
                    }
                    if (rxDrugInfo.doseUnit.trim() === null || rxDrugInfo.doseUnit.trim() === '' || !lookupMap.doseUnit.some(unit => (unit.value.toLowerCase().trim() === rxDrugInfo.doseUnit.toLowerCase().trim()))) {
                        AlertUtil.showErrorMessage("Dose unit required " + domainElement.name);
                        return false;
                    }
                    if (rxDrugInfo.supply.trim() === null || rxDrugInfo.supply.trim() === '') {
                        AlertUtil.showErrorMessage("Supply required " + domainElement.name);
                        return false;
                    }
                    if (rxDrugInfo.supplyUnit.trim() === null || rxDrugInfo.supplyUnit.trim() === '' || !lookupMap.supplyUnit.some(unit => (unit.value.toLowerCase().trim() === rxDrugInfo.supplyUnit.toLowerCase().trim()))) {
                        AlertUtil.showErrorMessage("Supply unit required " + domainElement.name);
                        return false;
                    }
                    if (rxDrugInfo.doseFrequency.trim() === null || rxDrugInfo.doseFrequency.trim() === '') {
                        AlertUtil.showErrorMessage("Dose frequency required " + domainElement.name);
                        return false;
                    }
                    if (rxDrugInfo.refillable === null || rxDrugInfo.refillable === '') {
                        AlertUtil.showErrorMessage("Refillable required " + domainElement.name);
                        return false;
                    }
                }
            }

        }
        return validated;
    };

    associateElementsToPatient = async () => {
        if (this.isFormValid()) {
            const {selections} = this.state;
            const patientId = this.patientId;
            const payload = {
                patientId,
                tagItems: Object.keys(selections).map(key => {
                    return {
                        domainElementId: key,
                        metaData: {
                            ...selections[key]
                        }
                    }
                })
            };
            this.setState({isLoading: true});
            try {
                const response = await ConversationService.associateDomainElement(payload);
                if (response.errors) {
                    AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                    this.setState({isLoading: false})
                } else {
                    const successMessage = this.selectedElements.length + " " + this.selectedType.typeName + " associated to member";
                    AlertUtil.showSuccessMessage(successMessage);
                    if(selections && selections.length>0) {
                        await this.dataDomainElementAddedSegmentEvent();
                    }
                    this.props.navigation.navigate(Screens.DATA_DOMAIN_LIST_SCREEN);
                }
            } catch (e) {
                this.setState({isLoading: false})
                console.log("Error", e);
            }
        }
    };

    dataDomainElementAddedSegmentEvent = async () => {
        const {selections} = this.state;
        selections.forEach(domainElement => {
            const segmentPayload = {
                telesessionId: this.segmentSessionCompletedPayload?.sessionId,
                encounterId: this.segmentSessionCompletedPayload?.encounterId,
                userId: this.appointment?.participantId,
                providerId: this.provider?.providerId,
                providerName: this.provider?.fullName,
                providerRole: this.provider?.designation,
                appointmentName: this.appointment?.serviceName,
                dataDomainElementName: domainElement?.name,
                importanceLevel: this.getSupportedImportanceLevels(domainElement),
                dateAdded: moment.utc(Date.now()).format('MMMM Do YYYY'),
                timeAdded: moment.utc(Date.now()).format('h:mm:ss a')
            };
            Analytics.track(SEGMENT_EVENT.DATA_DOMAIN_ELEMENT_ADDED, segmentPayload);
        })
    }

    renderSubstanceUseInfo = (selections, metaDataValues, currentElementId) => {
        return <View>
            <Text style={styles.medicineName}>Substance Use Info</Text>
            <View style={styles.medicineInfo}>
                <View style={styles.medicineAmount}>
                    <DropDownInputField keyValuePair
                        testId={'medication-dose'}
                        hasError={false}
                        hasFocus={false}

                        keyboardType={'default'}
                        onChange={(value, type) => {
                            const {substanceUse} = selections;
                            substanceUse.methodOfUse = value;
                            this.setElementStateByKey(currentElementId, 'substanceUse', substanceUse);
                        }}
                        value={selections.substanceUse.methodOfUse}
                        labelText={"Method of Use"}
                        editable={true}
                        options={this.getLookupPairs(metaDataValues.substanceUse.methodOfUse,'methodsOfSubstanceUse')}
                        label={"Method of use"}
                        dropDownIconColor={Colors.colors.mainBlue}

                    />
                </View>
                <View style={styles.medicineAmount}>
                    <DropDownInputField keyValuePair
                        testId={'medication-dose'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value, type) => {
                            const {substanceUse} = selections;
                            substanceUse.unitOfUse = value;
                            this.setElementStateByKey(currentElementId, 'substanceUse', substanceUse);
                        }}
                        value={selections.substanceUse.unitOfUse}
                        labelText={"Unit of Use"}
                        editable={true}
                        options={this.getLookupPairs(metaDataValues.substanceUse.unitOfUse,'unitsOfSubstanceUse')}
                        label={"Unit of use"}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>

            </View>
            <View style={styles.medicineInfo}>
                <View style={styles.medicineAmount}>
                    <DropDownInputField keyValuePair
                        testId={'medication-dose'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value, type) => {
                            const {substanceUse} = selections;
                            substanceUse.lastUse = value;
                            this.setElementStateByKey(currentElementId, 'substanceUse', substanceUse);
                        }}
                        value={selections.substanceUse.lastUse}
                        labelText={"Last Used"}
                        editable={true}
                        options={this.getLookupPairs(metaDataValues.substanceUse.lastUse,'lastSubstanceUse')}
                        label={"Last Used"}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>
                <View style={styles.medicineAmount}>
                    <DropDownInputField keyValuePair
                        testId={'medication-dose'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value, type) => {
                            const {substanceUse} = selections;
                            substanceUse.currentFrequencyOfUse = value;
                            this.setElementStateByKey(currentElementId, 'substanceUse', substanceUse);
                        }}
                        value={selections.substanceUse.currentFrequencyOfUse}
                        labelText={"Current Frequency of Use"}
                        editable={true}
                        options={this.getLookupPairs(metaDataValues.substanceUse.currentFrequencyOfUse,'currentFrequencyOfSubstanceUse')}
                        label={"Current Frequency of Use"}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>

            </View>
            <View style={styles.medicineInfo}>
                <View style={styles.medicineAmount}>
                    <DropDownInputField keyValuePair
                        testId={'medication-dose'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value, type) => {
                            const {substanceUse} = selections;
                            substanceUse.howLongUsingThisLevel = value;
                            this.setElementStateByKey(currentElementId, 'substanceUse', substanceUse);
                        }}
                        value={selections.substanceUse.howLongUsingThisLevel}
                        labelText={"How long have you been using at this level"}
                        editable={true}
                        options={this.getLookupPairs(metaDataValues.substanceUse.howLongUsingThisLevel,'continuousLevelOfSubstanceUse')}
                        label={"How long been using at this level"}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>
            </View>
        </View>
    }

    renderMedicationInfo = (selections, metaDataValues, currentElementId) => {
        return <View>

            <Text style={styles.medicineName}>Rx Info</Text>
            <View style={styles.medicationBox}>
                <View style={styles.medicineInfo}>
                    <View style={styles.medicineDose}>
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={Platform.OS === 'ios' ? 'name-phone-pad' : "numeric"}
                            // blur={this.validateName}
                            // focus={this.focusName}
                            changeText={(value) => {
                                if(!isNaN(value)){
                                    const {rxDrugInfo} = selections;
                                    rxDrugInfo.dose =  value.replace(/[- #*;,<>\{\}\[\]\\\/]/gi, '');
                                    this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                                }
                            }}
                            returnKeyType={'next'}
                            // submitEditing={this.performLogin}
                            value={selections.rxDrugInfo.dose}
                            // labelErrorText={''}
                            labelText={'Dose'}
                            editable={true}
                            maxLength = {10}
                        />
                    </View>
                    <View style={styles.medicineAmount}>
                        <DropDownInputField keyValuePair
                            testId={'medication-dose'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={'default'}
                            onChange={(value, type) => {
                                const {rxDrugInfo} = selections;
                                rxDrugInfo.doseUnit = value;
                                this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                            }}
                            value={selections.rxDrugInfo.doseUnit}
                            // labelText={'Dose Unit'}
                            editable={true}
                            options={this.state.lookupMap.doseUnit}
                            label={' '}
                            hasLabel={false}
                            dropDownIconColor={Colors.colors.mainBlue}

                        />
                    </View>
                </View>
                <View style={styles.medicineInfo}>
                    <View style={styles.medicineDose}>
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={Platform.OS === 'ios' ? 'name-phone-pad' : "numeric"}
                            // blur={this.validateName}
                            // focus={this.focusName}
                            changeText={(value) => {
                                if(!isNaN(value)){
                                    const {rxDrugInfo} = selections;
                                    rxDrugInfo.supply =  value.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '');
                                    this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                                }
                            }}
                            returnKeyType={'next'}
                            // submitEditing={this.performLogin}
                            value={selections.rxDrugInfo.supply}
                            // labelErrorText={''}
                            labelText={'Supply'}
                            editable={true}
                            maxLength = {4}
                        />
                    </View>
                    <View style={styles.medicineAmount}>
                        <DropDownInputField keyValuePair
                            testId={'medication-days'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={'default'}
                            onChange={(value, type) => {
                                const {rxDrugInfo} = selections;
                                rxDrugInfo.supplyUnit = value;
                                this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                            }}
                            value={selections.rxDrugInfo.supplyUnit}
                            // labelText={'Supply Unit'}
                            editable={true}
                            options={this.state.lookupMap.supplyUnit}
                            label={' '}
                            hasLabel={false}
                            dropDownIconColor={Colors.colors.mainBlue}

                        />
                    </View>
                </View>
                <View>
                    <Text style={{color: Colors.colors.highContrast,
                        ...TextStyles.mediaTexts.bodyTextS,
                        ...TextStyles.mediaTexts.manropeMedium}}>How many times a day should they take this medication?</Text>
                </View>
                <View style={styles.medicineInfo}>
                    <View style={{...styles.medicineDose, width: '75%'}}>
                        <FloatingInputField
                            testId={'medication-type'}
                            hasError={false}
                            hasFocus={false}
                            keyboardType={Platform.OS === 'ios' ? 'name-phone-pad' : "numeric"}
                            // blur={this.validateName}
                            // focus={this.focusName}
                            changeText={(value) => {
                                if(!isNaN(value)){
                                    const {rxDrugInfo} = selections;
                                    rxDrugInfo.doseFrequency =  value.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '');
                                    this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                                }
                            }}
                            returnKeyType={'done'}
                            // submitEditing={this.performLogin}
                            value={selections.rxDrugInfo.doseFrequency}
                            // labelErrorText={''}
                            labelText={'Times per day'}
                            editable={true}
                            maxLength = {4}
                        />
                    </View>
                </View>
                <View style={styles.mediRefillBox}>
                    <Text style={styles.refillText}>Medication refillable</Text>
                    <View>
                        <ToggleSwitch
                            testId={'medication-toggle'}
                            switchOn={selections.rxDrugInfo.refillable}
                            backgroundColorOn={Colors.colors.secondaryIcon}
                            onPress={() => {
                                const {rxDrugInfo} = selections;
                                rxDrugInfo.refillable = !rxDrugInfo.refillable;
                                this.setElementStateByKey(currentElementId, 'rxDrugInfo', rxDrugInfo)
                            }}
                        />
                    </View>
                </View>
                <Text style={styles.tagTitle}>Medication Type</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.rxDrugInfo.medicationType}</Text>
                </View>
                <Text style={styles.tagTitle}>Generic</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.rxDrugInfo.generic}</Text>
                </View>
                <Text style={styles.tagTitle}>Medication Class</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.rxDrugInfo.medicationClass}</Text>
                </View>
            </View>
        </View>
    };

    renderInterferenceInfo = (selections, currentElementId) => {
        return <View style={styles.mediRefillBox}>
            <Text style={styles.tagTitle}>Interference in Life</Text>
            <View>
                <ToggleSwitch
                    testId={'medication-toggle'}
                    switchOn={selections.interferenceInLife}
                    backgroundColorOn={Colors.colors.secondaryIcon}
                    onPress={() => {
                        this.setElementStateByKey(currentElementId, 'interferenceInLife', !selections.interferenceInLife)
                    }}
                />
            </View>
        </View>
    }

    renderDiagnosisInfo = (metaDataValues) => {
        return <View style={styles.sectionWrapper}>
            <Text style={styles.tagTitle}>Diagnosis Info</Text>
            <View>
                <Text style={styles.tagTitle}>Summary</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.diagnosisInfo.summary}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.tagTitle}>Approach</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.diagnosisInfo.approach}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.tagTitle}>Therapeutic Philosophy</Text>
                <View>
                    <Text style={styles.summaryText}>{metaDataValues.diagnosisInfo.therapeuticPhilosophy}</Text>
                </View>
            </View>

        </View>
    };

    renderNotesInfo = (selections, currentElementId) => {
        return <View style={styles.areaWrap}>
            <Text style={styles.tagTitle}>Write some notes</Text>
            <CommonTextArea
                testID={'Enter-notes'}
                value={selections.notes}
                autoFocus={false}
                multiline={true}
                placeholderText={'Your notes'}
                borderColor={Colors.colors.borderColor}
                onChangeText={(text) => {
                    this.setElementStateByKey(currentElementId, 'notes', text);
                }}
                // getRef={this.publicGetRef}
            />
        </View>
    }

    toggleSection = (currentSelections, currentElementId, stateKey) => {
        currentSelections.toggles[stateKey] = !currentSelections.toggles[stateKey];
        const {selections} = this.state;
        selections[currentElementId] = currentSelections;
        this.setState({
            selections
        });
    }

    renderRelatedToInfo = (selections, currentElementId) => {
        const relatedTo = [
            {name: "Related to medical condition", stateKey: "relatedToMedicalCondition"},
            {name: "Related to medication", stateKey: "relatedToMedication"},
            {name: "Related to substance use", stateKey: "relatedToSubstanceUse"},
            {name: "Related to withdrawal", stateKey: "relatedToWithdrawal"},
        ]

        return <View>
            <Text style={styles.medicineName}>Related To Info</Text>
            <View style={styles.sectionWrapper}>
                {relatedTo.map((relatedItem, index) => {
                    let selected = [];
                    selected = selections.specification[relatedItem.stateKey];
                    const sectionToggled = selections.toggles[relatedItem.stateKey];
                    let data: [];
                    let keyValuePair = false;
                    switch (relatedItem.stateKey) {
                        case 'relatedToMedicalCondition':
                            data = this.state.lookupMap.medicalCondition;
                            keyValuePair = true;
                            break;
                        case 'relatedToMedication':
                            data = this.relatedMedications;
                            break;
                        case 'relatedToSubstanceUse':
                        case 'relatedToWithdrawal':
                            data = this.relatedSubstanceUse;
                            break;
                        default:
                            data = [];
                    }
                    if (data && data.length > 0) {
                        return (
                            <View>
                                <View style={{
                                    flexDirection: "row",
                                    padding: 24,
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: Colors.colors.mainBlue05,
                                }}>
                                    <View style={styles.headTextWrap}>
                                        <Text style={styles.medicineName}>{relatedItem.name}</Text>
                                        <Text style={styles.selectedText}>{selected.length} selected</Text>
                                    </View>
                                    <TouchableOpacity onPress={()=>{
                                        this.toggleSection(selections, currentElementId, relatedItem.stateKey);
                                    }} style={styles.selectedText}>
                                        <AntDesignIcon name={sectionToggled?'minus': 'plus'} size={22}/>
                                    </TouchableOpacity>

                                </View>
                                {
                                    sectionToggled && (
                                        <View style={{marginTop: 8}}>
                                            <FlatList
                                                data={data}
                                                renderItem={({item, index}) => {
                                                    return (<SingleCheckListItem
                                                        listTestId={'list - ' + index + 1}
                                                        checkTestId={'checkbox - ' + index + 1}
                                                        keyId={index}
                                                        listPress={() => this.updateList(item, selections, currentElementId, relatedItem.stateKey)}
                                                        itemSelected={selected.includes(item.name)}
                                                        itemTitle={item.value}
                                                    />);
                                                }}
                                                keyExtractor={item => item.id}
                                            />
                                        </View>
                                    )
                                }

                            </View>
                        )
                    }
                })}
            </View>
        </View>
    }

    updateList = (item, currentSelections, currentElementId, stateKey) => {
        if (currentSelections.specification[stateKey].includes(item.name)) {
            currentSelections.specification[stateKey] = currentSelections.specification[stateKey].filter(value => value !== item.name);
        } else {
            currentSelections.specification[stateKey].push(item.name);
        }
        const {selections} = this.state;
        selections[currentElementId] = currentSelections
        this.setState({
            selections
        });

    }

    setElementStateByKey = (domainElementId, key, value) => {
        const {selections} = this.state;
        selections[domainElementId][key] = value;
        this.setState({selections})
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
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

                <Content
                    enableResetScrollToCoords={false}
                    contentContainerStyle={{padding: 24}}>
                    {
                        this.selectedElements.map(domainElement => {
                            const currentElementId = domainElement.Id;
                            const {metaDataSpec, metaDataValues} = domainElement.metaData;
                            const selections = this.state.selections[currentElementId];
                            const {
                                requireDiagnosisInfo, requireNotes,
                                requireInterferenceWithLifeInfo, requireRelatedToInfo, requireRelatedToMedicalCondition,
                                requireRxInfo, requireSubstanceUse, requireSpecification
                            } = metaDataSpec;
                            const supportedImportanceLevels = this.getSupportedImportanceLevels(domainElement);
                            return (
                                <View key={`assign-el-${currentElementId}`} style={styles.sectionWrapper}>
                                    <Text style={styles.subAddTitle}>
                                        {domainElement.name}
                                    </Text>
                                    <View style={styles.tagWrapper}>
                                        {
                                            supportedImportanceLevels.length > 0 && (
                                                <>
                                                    <Text style={styles.tagTitle}>
                                                        Select importance level
                                                    </Text>
                                                    <View style={styles.tagList}>
                                                        {
                                                            supportedImportanceLevels.map(importance =>
                                                                <SingleTagItem
                                                                    tagTitle={importance}
                                                                    bgColor={selections.selectedImportance === importance ? DOMAIN_IMPORTANCE_COLORS[importance].textColor : Colors.colors.white}
                                                                    onPress={() => {
                                                                        this.setElementStateByKey(currentElementId, "selectedImportance", importance);
                                                                    }}
                                                                    textColor={selections.selectedImportance === importance ? Colors.colors.white : DOMAIN_IMPORTANCE_COLORS[importance].textColor}
                                                                />)
                                                        }
                                                    </View>
                                                </>
                                            )
                                        }
                                    </View>
                                    {requireNotes && this.renderNotesInfo(selections, currentElementId)}
                                    {requireRxInfo && this.renderMedicationInfo(selections, metaDataValues, currentElementId)}
                                    {requireDiagnosisInfo && this.renderDiagnosisInfo(metaDataValues)}
                                    {requireInterferenceWithLifeInfo && this.renderInterferenceInfo(selections, currentElementId)}
                                    {requireSubstanceUse && this.state.lookupMap && this.state.lookupMap["methodsOfSubstanceUse"]?.length >0 && this.renderSubstanceUseInfo(selections, metaDataValues, currentElementId)}
                                    {requireSpecification && this.renderRelatedToInfo(selections, currentElementId)}

                                </View>
                            )
                        })
                    }

                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="add-social"
                        onPress={() => {
                            this.associateElementsToPatient();
                        }}
                        text={"Add " + this.selectedType.typeName}
                    />
                </View>

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
    subAddTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 32
    },
    tagWrapper: {
        marginBottom: 16
    },
    areaWrap: {
        marginBottom: 32,
    },
    sectionWrapper: {
        marginBottom: 52,
    },
    tagTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 16,
        marginTop: 7
    },
    summaryText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeRegular,
        marginBottom: 12
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    singleDomainItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.highContrastBG,
        paddingTop: 16,
        paddingBottom: 16
    },
    domainInfo: {
        flex: 1
    },
    domainStatus: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold
    },
    domainTitle: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium
    },
    domainIcon: {},
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    medicationBox: {
        // paddingHorizontal: 24
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
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16
    },
    medicineDose: {
        width: '45%',
        marginRight: 16
    },
    medicineAmount: {
        width: '45%',
        marginTop: -24
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
});
