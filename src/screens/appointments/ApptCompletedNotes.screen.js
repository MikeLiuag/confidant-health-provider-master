import React, {Component} from 'react';
import {Image, Platform,KeyboardAvoidingView, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import {
    AlertUtil,
    Colors,
    CommonStyles, CommonTextArea,
    FloatingInputField, getAvatar,
    getHeaderHeight, NAME_REGEX,
    PrimaryButton,
    SecondaryButton,
    TextStyles, valueExists
} from "ch-mobile-shared";
import {Body, Button, Container, Content, Header, Left, Right, Text} from "native-base";
import EntypoIcons from "react-native-vector-icons/Entypo";
import FeatherIcon from "react-native-vector-icons/Feather";
import {ProgressBar} from 'react-native-paper';
import {isIphoneX} from "ch-mobile-shared/src/utilities";
import Modal from "react-native-modalbox";
import FAIcon from "react-native-vector-icons/FontAwesome";
import ConversationService from "../../services/ConversationService";
import {
    APPOINTMENT_SIGNOFF_STATUS,
    DEFAULT_AVATAR_COLOR,
    HISTORY_CONSTANT,
    NOTES,
    PROVIDER_ROLES
} from "../../constants/CommonConstants";
import {connectConnections} from "../../redux";
import ProfileService from "../../services/ProfileService";
import Loader from "../../components/Loader";
import ScheduleService from "../../services/ScheduleService";
import momemt from "moment";
import {NavigationActions, StackActions} from "react-navigation";
import {Screens} from "../../constants/Screens";

const HEADER_SIZE = getHeaderHeight();

class ApptCompletedNotesScreen extends Component<Props> {

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.patientId = navigation.getParam('patientId', null);
        this.state = {
            isLoading: true,
            appointment: this.appointment,
            providerDetails: null
        };
    }

    componentDidMount = () => {
        this.getLookupKeys();
        this.getMedicalHistory();
        this.getProviderDetails();
       // this.getAssociatedTagsList();
        this.getComparedAssociatedTagsForPatient()
    }


    /**
     * @function getMedicalHistory
     * @description This method is used to get before & after medical history
     */
    getMedicalHistory = async () => {
        try {
            this.setState({isLoading: true});
            const {appointment} = this.state;
            const response = await ConversationService.getBeforeAfterMedicalHistory(appointment?.participantId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                if (response.tagItems && response.tagItems.length > 0) {
                    const tagItem = response.tagItems[0];
                    this.setState({
                        historyElementId: tagItem.domainElementId,
                        historyData: response
                    });
                } else {
                    AlertUtil.showErrorMessage("Medical History not configured in system");
                }
            }
        } catch (e) {
            console.log({e})
            AlertUtil.showErrorMessage("Whoops!Something went wrong");
        }
    };


  /*  /!**
     * @function getAssociatedTagsList
     * @description This method is used to get Associated Tags list by patient Id.
     *!/
    getAssociatedTagsList = async () => {
        try {
            const {appointment} = this.state;
            const response = await ConversationService.getAssociatedTagsList(appointment?.participantId);
            console.log({associatedTag: response})
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                response.types = response?.types?.sort((type1, type2) => {
                    if (type1.requireHistory) {
                        return -1;
                    }
                    return 0;
                })
                this.setState({domainTypes: response, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});

        }
    }*/


    /**
     * @function getAssociatedTagsList
     * @description This method is used to get Associated Tags list by patient Id.
     */
    getComparedAssociatedTagsForPatient = async () => {
        try {
            const {appointment} = this.state;
            const response = await ConversationService.getComparedAssociatedTagsForPatient(appointment?.participantId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                response.types = response?.types?.sort((type1, type2) => {
                    if (type1.requireHistory) {
                        return -1;
                    }
                    return 0;
                })
                this.setState({domainTypes: response, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});

        }
    }


    /**
     * @function findAvatarColorCode
     * @description This method is used to get avatar color code
     */
    findAvatarColorCode = (connectionId) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR;

    };

    /**
     * @function getProviderDetails
     * @description This method is used to get Providers detail.
     */
    getProviderDetails = async () => {
        const {appointment} = this.state;
        let provider = await ProfileService.getProviderProfile(appointment?.practitionerId);
        if (provider.errors) {
            console.warn(provider.errors[0].endUserMessage);
        } else {
            if (!provider.profileImage) {
                provider = {...provider, colorCode: this.findAvatarColorCode(this.providerId)};
            }
            this.setState({
                providerDetails: provider,
            });
        }
    };


    /**
     * @function getPatientAssociatedTagDetails
     * @description This method is used to get Patient Associated Tag details for given user.
     */

    getPatientAssociatedTagDetails = async (itemId) => {
        this.setState({isLoading: true});
        try {
            const {appointment} = this.state;
            const payload = {
                associatedTagId: itemId,
                patientId: appointment?.participantId
            }
            const selectedTagDetails = await ProfileService.getUserAssociatedTagDetails(payload);
            if (selectedTagDetails.errors) {
                AlertUtil.showErrorMessage(selectedTagDetails.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({selectedTagDetails, isLoading: false})
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    /**
     * @function validateSuperNotes
     * @description This method is used to validate super notes.
     */
    validateSuperNotes = () => {
        const {appointment, notes, status} = this.state;
        if (!valueExists(appointment?.appointmentId)) {
            AlertUtil.showErrorMessage("Invalid appointment Id");
            return false;
        }
        if (!valueExists(notes)) {
            AlertUtil.showErrorMessage("Invalid notes");
            return false;
        }

        if (!valueExists(status)) {
            AlertUtil.showErrorMessage("Invalid Status");
            return false;
        }
        return true;
    }


    /**
     * @function saveSupervisorNotes
     * @description This method is used to save supervisor notes.
     */
    saveSupervisorNotes = async () => {
        if (this.validateSuperNotes()) {

            this.setState({isLoading: true});
            const {appointment, notes, status} = this.state;
            const payload = {
                appointmentId: appointment?.appointmentId,
                notes: notes,
                status: status
            };
                const response = await ScheduleService.saveSupervisorNotes(payload, payload?.appointmentId);
            if (response?.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.closeModal();
            } else {
                AlertUtil.showSuccessMessage(`Notes ${status?.toLowerCase()} successfully`);
                this.closeModal();
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: Screens.TAB_VIEW})],
                });
                this.props.navigation.dispatch(resetAction);
            }
        }
    };


    /**
     * @function getLookupKeys
     * @description This method is used to get lookup keys.
     */
    getLookupKeys = async () => {
        try {
            const response = await ConversationService.getDomainLookups();
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                this.setState({
                    lookupData: response?.lookupMap
                });
            }
        } catch (e) {
            console.log(e);
        }
    };


    /**
     * @function renderScreenHeader
     * @description This method is used to render page main header.
     */
    renderScreenHeader = () => {
        return (<Header noShadow={false} transparent style={styles.header}>
            <StatusBar
                backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                translucent
                barStyle={"dark-content"}
            />
            <Left style={{flex: 1}}>
                <Button
                    transparent
                    style={styles.backButton}
                    onPress={this.backClicked}>
                    <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                </Button>
            </Left>
            <Body style={{flex: 2}}>
            </Body>
            <Right style={{flex: 1}}>
                {this.props?.profile?.profile?.signOffRole === PROVIDER_ROLES.SUPERVISOR && this.appointment?.signOffStatus === APPOINTMENT_SIGNOFF_STATUS.REVIEW && (
                    <Button transparent style={styles.filterBtn} onPress={() => {
                        this.openModal("modalBottomButtons", null, null)
                    }}>
                        <FeatherIcon color={Colors.colors.mainBlue} type={'Feather'} name="more-horizontal" size={24}/>
                    </Button>
                )}
            </Right>
        </Header>)
    }

    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type, status, selectedItem) => {
        this.setState({
            modalDetails: this.getRenderModalDetails(type),
            status: status ? status : this.state.status,
            selectedItem: selectedItem,
            openModal: true,

        })
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({notes: null, selectedItem: null, modalDetails: null, openModal: false, isLoading: false})
    }


    /**
     * @function backClicked
     * @description This method is used to navigate back.
     */
    backClicked = () => {
        this.props.navigation.goBack();
    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
        const {openModal, modalDetails} = this.state;
        return (<Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            isOpen={openModal && !this.state.isLoading}
            onClosed={() => {
                this.closeModal();
            }}
            style={{
                ...CommonStyles.styles.commonModalWrapper,
                height: modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                backgroundColor: Colors.colors.screenBG
            }}
            entry={"bottom"}
            position={"bottom"}
            ref={modalDetails?.ref}
            swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}/>
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {modalDetails?.method()}
            </KeyboardAvoidingView>
        </Modal>)
    }

    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'modalRemoveAllNotes' :
                return {ref: "modalRemoveAllNotes", maxHeight: null, method: () => this.renderRemoveAllNotesModal()};
            case 'modalSignOffNotes' :
                return {ref: "modalSignOffNotes", maxHeight: 380, method: () => this.renderSignOffNotesModal()};
            case 'modalMedicalHistory' :
                return {ref: "modalMedicalHistory", maxHeight: '70%', method: () => this.renderMedicalHistoryModal()};
            case 'modalDiagnosisChanges' :
                return {
                    ref: "modalDiagnosisChanges",
                    maxHeight: '90%',
                    method: () => this.renderDiagnosisChangesModal()
                };
            case 'modalEvaluations' :
                return {ref: "modalEvaluations", maxHeight: '70%', method: () => this.renderEvaluationsModal()};
            case 'modalAddSignOffNotes' :
                return {ref: "modalAddSignOffNotes", maxHeight: 380, method: () => this.renderAddSignOffNotesModal()};
            case 'modalBottomButtons' :
                return {ref: "modalBottomButtons", maxHeight: null, method: () => this.renderBottomButtons()};
            default :
                return null
        }
    }

    /**
     * @function renderRemoveAllNotesModal
     * @description This method is used to render remove all notes.
     */
    renderRemoveAllNotesModal = () => {
        return (<View>
            <View style={{...styles.actionsTopWrapper}}>
                <View style={{...styles.modalTitleWrapper,}}>
                    <Text style={{...styles.modalTitleTextSm}}>You are about to reject notes</Text>
                </View>
            </View>
            <View style={styles.actionList}>
                <View style={{...styles.btnOptions, marginBottom: 0}}>
                    <SecondaryButton
                        text={'Keep notes'}
                        textColor={Colors.colors.primaryText}
                        onPress={() => {
                            this.closeModal();
                        }}
                    />
                </View>
                <View style={styles.btnOptions}>
                    <PrimaryButton
                        text={'Reject notes'}
                        bgColor={Colors.colors.errorIcon}
                        textColor={Colors.colors.whiteColor}
                        color={Colors.colors.whiteColor}
                        onPress={() => {
                            this.saveSupervisorNotes();
                        }}
                    />
                </View>
            </View>
        </View>)
    }


    /**
     * @function validateFullName
     * @description This method is used to validate full Name field.
     */
    validateFullName = () => {
        const {fullName} = this.state;
        let hasFullNameError = false;
        this.setState({fullNameFocus: false});
        if (!valueExists(fullName)) {
            hasFullNameError = true;
        } else if (valueExists(fullName)) {
            hasFullNameError = !NAME_REGEX.test(fullName.trim());
        }
        this.setState({fullName, hasFullNameError});
        return !hasFullNameError;
    };


    /**
     * @function renderAddSignOffNotesModal
     * @description This method is used to render add sign off notes.
     */
    renderAddSignOffNotesModal = () => {
        return (
            <View style={{flex: 1}}>
                <View style={{marginBottom: 40}}>
                    <View style={{...styles.actionsTopWrapper, marginBottom: 24}}>
                        {this.state.status === APPOINTMENT_SIGNOFF_STATUS.APPROVED &&
                            <View style={{...styles.modalTitleWrapper}}>
                                <Text style={{...styles.modalTitleTextSm}}>Add Your Notes</Text>
                            </View>
                        }
                        {this.state.status === APPOINTMENT_SIGNOFF_STATUS.REJECTED &&
                            <View style={{...styles.modalTitleWrapper}}>
                                <Text style={{...styles.modalTitleTextSm}}>Reason For Rejection</Text>
                            </View>
                        }
                    </View>
                    <CommonTextArea
                        testId={'notes-input'}
                        onChangeText={(notes) => {
                            this.setState({notes});
                        }}
                        value={this.state?.notes}
                        labelErrorText={'Incorrect Notes'}
                        borderColor={Colors.colors.borderColor}
                        labelText={'Notes'}
                        editable={true}
                        placeHolderText={this.state.status === APPOINTMENT_SIGNOFF_STATUS.REJECTED ? "This will allow the provider to add an amendment to the completed note" : "Write something here"}
                    />
                </View>
                <View style={styles.actionList}>
                    <View style={styles.btnOptions}>
                        <PrimaryButton
                            color={Colors.colors.whiteColor}
                            text={"Add Notes"}
                            disabled={!this.state?.notes}
                            onPress={() => {
                                //this.closeModal();
                                setTimeout(() => {
                                    if (this.state.status === APPOINTMENT_SIGNOFF_STATUS.APPROVED) {
                                        this.openModal('modalSignOffNotes', this.state.status, null)
                                    } else {
                                        this.openModal('modalRemoveAllNotes', this.state.status, null)
                                    }
                                }, 1000)
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }


    /**
     * @function renderSignOffNotesModal
     * @description This method is used to render sign off notes.
     */
    renderSignOffNotesModal = () => {
        return (
            <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <View style={{...styles.actionsTopWrapper, marginBottom: 24}}>
                        <View style={{...styles.modalTitleWrapper}}>
                            <Text style={{...styles.modalTitleTextSm}}>Type your full name to sign off on this
                                note.</Text>
                            <Text style={{...styles.modalTitleSubText,}}>Please note: once you’ve signed off on an
                                appointment note, the note is no longer editable.</Text>
                        </View>
                    </View>
                    <View style={styles.inputRow}>
                        <FloatingInputField
                            testId={'fullName-input'}
                            hasError={this.state?.hasFullNameError}
                            hasFocus={this.state?.fullNameFocus}
                            keyboardType={'default'}
                            blur={() => {
                                this.validateFullName()
                            }}
                            focus={() => {
                                this.setState({fullNameFocus: true})
                            }}
                            changeText={(fullName) => {
                                this.setState({fullName});
                            }}
                            returnKeyType={'next'}
                            value={this.state?.fullName}
                            labelErrorText={'Incorrect Full Name'}
                            labelText={'Please type your full name'}
                            editable={true}
                        />
                    </View>
                </View>
                <View style={styles.actionList}>
                    <View style={styles.btnOptions}>
                        <PrimaryButton
                            color={Colors.colors.whiteColor}
                            disabled={!this.state.fullName}
                            text={"Sign off on notes"}
                            onPress={() => {
                                this.saveSupervisorNotes()
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }

    /**
     * @function renderDiagnosisChangesModal
     * @description This method is used to render Diagnosis Changes.
     */
    renderDiagnosisChangesModal = () => {
        const {selectedItem, selectedTagDetails, providerDetails} = this.state;
        const relatedElements = selectedItem?.relatedElements.filter(relatedElement => relatedElement.name === selectedItem?.elementName)
        let currentData = null;
        let previousData = relatedElements?.[0];
        if (selectedItem?.relatedElements?.length > 1) {
            currentData = relatedElements?.[1];

        }
        return (
            <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                <View style={{...styles.actionsTopWrapper}}>
                    <View style={{...styles.modalTitleWrapper, marginBottom: 0}}>
                        <Text style={{
                            ...styles.modalTitleSubText,
                            marginBottom: 8
                        }}>{selectedTagDetails?.elementName}</Text>
                        <Text
                            style={{...styles.modalTitleText, marginBottom: 0}}>{selectedTagDetails?.elementName}</Text>
                    </View>
                </View>
                <View style={styles.boxStatusWrapper}>
                    {previousData && (
                    <Text style={{
                        ...styles.boxStatusText,
                        color: Colors.colors.errorText
                    }}>{previousData?.priority?.name}</Text>
                    )}
                    <FAIcon style={{marginHorizontal: 12}} name="long-arrow-right" size={20}
                            color={Colors.colors.neutral50Icon}/>
                    {currentData && (<Text style={{...styles.boxStatusText, color: Colors.colors.warningText}}>{currentData?.priority?.name}</Text>)}
                </View>
                {providerDetails && (
                    <View style={styles.personalInfoWrapper}>
                        <View>
                            <View>
                                {providerDetails?.providerProfile ?
                                    <Image style={styles.personalProImage}
                                           resizeMode={"cover"}
                                           source={{uri: getAvatar(providerDetails?.providerProfile)}}
                                           alt="Icon"
                                    />
                                    :
                                    providerDetails?.name && (
                                        <View
                                            style={{...styles.personalProBgMain, backgroundColor: Colors.colors.mainBlue}}>
                                            <Text
                                                style={styles.personalProLetterMain}>{providerDetails?.fullName?.charAt(0)?.toUpperCase()}</Text>
                                        </View>
                                    )
                                }
                            </View>
                        </View>
                        <View style={styles.personalDetailWrapper}>
                            <Text
                                style={styles.personalName}>{`${providerDetails?.fullName}, ${providerDetails?.designation}`}</Text>
                            <Text style={styles.personalDes} numberOfLines={1}>Reported
                                on {momemt(selectedTagDetails?.assignedAt).format("MMMM D , YYYY")}</Text>
                        </View>
                    </View>
                )}
                <View style={styles.desTextView}>
                    <Text style={{...styles.desTextTitleModal}}>Report notes</Text>
                    <Text style={{...styles.desTextDescriptionModal}}>{selectedTagDetails?.notes}</Text>
                    {/*<Button transparent style={styles.seeAllBtn}>
                        <Text uppercase={false} style={styles.seeAllBtnText}>Read more</Text>
                        <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
                    </Button>*/}
                </View>
                {/*<View style={styles.personalInfoWrapper}>
                    <View>
                        <View>
                            <Image style={styles.personalProImage}
                                resizeMode={"cover"}
                                source={{uri: getAvatar({})}}
                                alt="Icon"
                                />
                                :
                            <View style={{...styles.personalProBgMain, backgroundColor: Colors.colors.mainBlue}}>
                                <Text style={styles.personalProLetterMain}>JT</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.personalDetailWrapper}>
                        <Text style={styles.personalName}>Jane Cooper, Coach</Text>
                        <Text style={styles.personalDes} numberOfLines={1}>Reported on March 12, 2021</Text>
                    </View>
                </View>
                <View style={styles.desTextView}>
                    <Text style={{...styles.desTextTitleModal}}>Report notes</Text>
                    <Text style={{...styles.desTextDescriptionModal}}>Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                    <Button transparent style={styles.seeAllBtn}>
                        <Text uppercase={false} style={styles.seeAllBtnText}>Read more</Text>
                        <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
                    </Button>
                </View>
                <View style={styles.desTextView}>
                    <Text style={{...styles.desTextTitleModal}}>Summary</Text>
                    <Text style={{...styles.desTextDescriptionModal}}>Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                    <Button transparent style={styles.seeAllBtn}>
                        <Text uppercase={false} style={styles.seeAllBtnText}>Read more</Text>
                        <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
                    </Button>
                </View>
                <View style={styles.desTextView}>
                    <Text style={{...styles.desTextTitleModal}}>Therapeutic Philosophy </Text>
                    <Text style={{...styles.desTextDescriptionModal}}>Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                    <Button transparent style={styles.seeAllBtn}>
                        <Text uppercase={false} style={styles.seeAllBtnText}>Read more</Text>
                        <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
                    </Button>
                </View>*/}
            </Content>
        )
    }


    /**
     * @function renderNotesTopSection
     * @description This method is used to render notes .
     */
    renderNotesTopSection = () => {
        const {appointment} = this.state;
        return (
            <View>
                {NOTES && Object.keys(NOTES).map(note => {
                    return (
                        <View style={styles.desTextView}>
                            <Text style={styles.desTextTitle}>{note}</Text>
                            <Text style={styles.desTextDescription}>{appointment?.[note?.toLowerCase()] || 'N/A'}</Text>
                        </View>
                    )
                })}
            </View>
        )
    }


    /**
     * @function renderNotesTopSection
     * @description This method is used to render notes .
     */
    renderMedicalHistory = () => {
        return (
            <View style={styles.desTextView}>
                <Text style={styles.desTextTitle}>Medical history changes</Text>
                {this.renderHistoryInformation()}
            </View>
        )
    }

    /**
     * @function renderBottomButtons
     * @description This method is used to render screen bottom buttons
     */
    renderBottomButtons = () => {
        return (
            (this.props?.profile?.profile?.signOffRole === PROVIDER_ROLES.SUPERVISOR && this.appointment?.signOffStatus === APPOINTMENT_SIGNOFF_STATUS.REVIEW &&
                <View style={styles.greBtn}>
                    <View style={{marginBottom: 16}}>
                        <PrimaryButton
                            text={'Reject notes'}
                            bgColor={Colors.colors.errorIcon}
                            textColor={Colors.colors.whiteColor}
                            color={Colors.colors.whiteColor}
                            size={24}
                            onPress={() => {
                                this.closeModal();
                                setTimeout(() => {
                                    this.openModal('modalAddSignOffNotes', APPOINTMENT_SIGNOFF_STATUS.REJECTED, null)
                                }, 500)

                            }}
                        />
                    </View>
                    <PrimaryButton
                        color={Colors.colors.whiteColor}
                        text={"Sign off on notes"}
                        onPress={() => {
                            this.closeModal();
                            setTimeout(() => {
                                this.openModal('modalAddSignOffNotes', APPOINTMENT_SIGNOFF_STATUS.APPROVED, null)
                            }, 500)

                        }}
                    />
                </View>)
        )
    }


    toFindDuplicates = (arry) =>{
        const uniqueElements = new Set(arry);
        const filteredElements = arry.filter(item => {
            if (uniqueElements.has(item)) {
                uniqueElements.delete(item);
            } else {
                return item;
            }
        });

        return [...new Set(filteredElements)]
    }


    /**
     * @function renderChangesSection
     * @description This method is used to render changes .
     */
    renderChangesSection = () => {
        const {domainTypes} = this.state;
        return (
            domainTypes?.types && domainTypes?.types?.filter(type => type.typeName !== "Medical History")?.map(domainType => {
                const relatedElementsNames = domainType?.relatedElements?.map(relatedElement => relatedElement?.name);
                const uniqueRelatedElementsNames  = this.toFindDuplicates(relatedElementsNames);

                return (
                    <View>
                        <View style={styles.desTextView}>
                            <Text style={styles.desTextTitle}>{`${domainType?.typeName} changes`}</Text>
                            {(domainType?.relatedElements?.length > 0 && uniqueRelatedElementsNames?.length>0) ?
                                uniqueRelatedElementsNames.map(relatedElementName => {
                                    const relatedElement = domainType?.relatedElements?.find(relatedElement=> relatedElement?.name === relatedElementName)
                                    return (
                                        <TouchableOpacity onPress={() => {
                                            this.getPatientAssociatedTagDetails(relatedElement?.id)
                                            this.openModal('modalDiagnosisChanges', null, {...domainType,elementName :relatedElementName })
                                        }} style={styles.singleItem}>
                                            <View style={styles.itemDetail}>
                                                <Text style={styles.itemName}>{relatedElementName}</Text>
                                            </View>
                                            <View style={styles.nextWrapper}>
                                                <Button transparent onPress={() => {
                                                    this.getPatientAssociatedTagDetails(relatedElement?.id)
                                                    this.openModal('modalDiagnosisChanges', null, {...domainType,elementName :relatedElementName})
                                                }} style={styles.itemNextButton}>
                                                    <EntypoIcons size={24} color={Colors.colors.primaryIcon}
                                                                 name="chevron-thin-right"/>
                                                </Button>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }) :
                                <View style={styles.noChangeWrapper}>
                                    <Text style={styles.itemName}>No Change</Text>
                                </View>

                            }
                        </View>
                    </View>
                )
            })
        )
    }

    /**
     * @function renderEvaluationsModal
     * @description This method is used to render Evaluations.
     */
    renderEvaluationsModal = () => {
        return (
            <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                <View style={{...styles.actionsTopWrapper, marginBottom: 16}}>
                    <View style={{...styles.modalTitleWrapper, marginBottom: 0}}>
                        <Text style={{...styles.modalTitleSubText, marginBottom: 8}}>Evaluation</Text>
                        <Text style={{...styles.modalTitleText, marginBottom: 0}}>Med management</Text>
                    </View>
                </View>
                <View style={{...styles.progressDetails, marginTop: 0}}>
                    <ProgressBar style={styles.progressBarr}
                                 progress={20}
                                 color={Colors.colors.mainBlue}
                                 borderRadius={8}/>
                    <View style={styles.progressBottomWrapper}>
                        <Text style={styles.lightText}>Due in {15} days</Text>
                        <Text style={styles.completedText}>90%</Text>
                    </View>
                </View>
            </Content>
        )
    }


    /**
     * @function renderNotesTopSection
     * @description This method is used to render notes .
     */
    renderEvaluationSection = () => {
        return (
            <View style={styles.desTextView}>
                <Text style={styles.desTextTitle}>Evaluations</Text>
                <TouchableOpacity onPress={() => {
                    this.openModal('modalEvaluations', null, null)
                }} style={styles.multipleItem}>
                    <View style={{...styles.singleItem, paddingVertical: 0, paddingHorizontal: 0}}>
                        <View style={styles.itemDetail}>
                            <Text style={styles.itemName}>Med management</Text>
                        </View>
                        <View style={styles.nextWrapper}>
                            <Button transparent style={styles.itemNextButton}>
                                <EntypoIcons size={24} color={Colors.colors.primaryIcon} name="chevron-thin-right"/>
                            </Button>
                        </View>
                    </View>
                    <View style={styles.progressDetails}>
                        <ProgressBar style={styles.progressBarr}
                                     progress={20}
                                     color={Colors.colors.mainBlue}
                                     borderRadius={8}/>
                        <View style={styles.progressBottomWrapper}>
                            <Text style={styles.lightText}>Due in {15} days</Text>
                            <Text style={styles.completedText}>90%</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * @function renderNotesTopSection
     * @description This method is used to render notes .
     */
    renderTranscriptSection = () => {
        return (
            <View style={styles.desTextView}>
                <Text style={styles.desTextTitle}>Transcript</Text>
                <TouchableOpacity style={styles.singleItem}>
                    <View style={styles.itemDetail}>
                        <Text style={styles.itemName}>Review Transcript</Text>
                        <Text style={styles.itemDescription}>30 minutes</Text>
                    </View>
                    <View style={styles.nextWrapper}>
                        <Button transparent style={styles.itemNextButton}>
                            <EntypoIcons size={24} color={Colors.colors.primaryIcon} name="chevron-thin-right"/>
                        </Button>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }


    getValueText = (value) => {
        const type = typeof value;
        if (type === 'object') {
            let listText = '';
            if (value?.length > 0) {
                for (let each of value) {
                    listText = listText?.replace(/_/g, ' ') + ' , ' + each;
                }
            } else {
                listText = "N/A"
            }
            return listText?.trim()?.replace(/(^,)|(,$)/g, '');

        } else if (type === 'boolean') {
            return value === true ? "true" : "false";
        } else {
            return value?.replace(/_/g, ' ');
        }
    }

    /**
     * @function renderMedicalHistoryModal
     * @description This method is used to render Medical History.
     */
    renderMedicalHistoryModal = () => {
        const {selectedItem, historyData, providerDetails} = this.state;
        let previousHistoryData = null;
        let currentHistoryData = historyData?.tagItems?.[0]?.metaData?.historyInfo;
        if (historyData?.tagItems?.length > 1) {
            previousHistoryData = historyData?.tagItems?.[1]?.metaData?.historyInfo;
        }
        if (currentHistoryData) {
            const previousValue = previousHistoryData ? this.getValueText(previousHistoryData[selectedItem]) : '';
            const currentValue = this.getValueText(currentHistoryData[selectedItem]);

            return (
                <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                    <View style={{...styles.actionsTopWrapper}}>
                        <View style={{...styles.modalTitleWrapper, marginBottom: 0}}>
                            <Text style={{...styles.modalTitleSubText, marginBottom: 8}}>Medical history changed</Text>
                            <Text
                                style={{
                                    ...styles.modalTitleText,
                                    marginBottom: 0
                                }}>{HISTORY_CONSTANT[selectedItem]}</Text>
                        </View>
                    </View>
                    <View style={styles.boxStatusWrapper}>
                        <Text
                            style={{...styles.boxStatusText, color: Colors.colors.highContrast}}>{previousValue}</Text>
                        <FAIcon style={{marginHorizontal: 12}} name="long-arrow-right" size={20}
                                color={Colors.colors.neutral50Icon}/>
                        <Text style={{...styles.boxStatusText, color: Colors.colors.highContrast}}>{currentValue}</Text>
                    </View>
                    {providerDetails && (
                        <View style={styles.personalInfoWrapper}>
                            <View>
                                <View>
                                    {providerDetails?.providerProfile ?
                                        <Image style={styles.personalProImage}
                                               resizeMode={"cover"}
                                               source={{uri: getAvatar(providerDetails?.providerProfile)}}
                                               alt="Icon"
                                        />
                                        :
                                        providerDetails?.name && (
                                            <View
                                                style={{
                                                    ...styles.personalProBgMain,
                                                    backgroundColor: Colors.colors.mainBlue
                                                }}>
                                                <Text
                                                    style={styles.personalProLetterMain}>{providerDetails?.fullName?.charAt(0)?.toUpperCase()}</Text>
                                            </View>
                                        )
                                    }
                                </View>
                            </View>
                            <View style={styles.personalDetailWrapper}>
                                <Text
                                    style={styles.personalName}>{`${providerDetails?.fullName} , ${providerDetails?.designation}`}</Text>
                            </View>
                        </View>
                    )}
                    {/* <View style={styles.personalInfoWrapper}>
                    <View>
                        <View>
                            <Image style={styles.personalProImage}
                                resizeMode={"cover"}
                                source={{uri: getAvatar({})}}
                                alt="Icon"
                                />
                                :
                            <View style={{...styles.personalProBgMain, backgroundColor: Colors.colors.mainBlue}}>
                                <Text style={styles.personalProLetterMain}>JT</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.personalDetailWrapper}>
                        <Text style={styles.personalName}>Jane Cooper, Coach</Text>
                        <Text style={styles.personalDes} numberOfLines={1}>Reported on March 12, 2021</Text>
                    </View>
                </View>
                <View style={styles.desTextView}>
                    <Text style={{...styles.desTextTitleModal}}>Report notes</Text>
                    <Text style={{...styles.desTextDescriptionModal}}>Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                </View>*/}
                </Content>
            )
        }
    }

    /**
     * @function renderHistoryInformation
     * @description This method is used to render History information
     */
    renderHistoryInformation = () => {
        const {historyData} = this.state;
        let previousHistoryData = null;
        let currentHistoryData = historyData?.tagItems?.[0]?.metaData?.historyInfo;
        if (historyData?.tagItems?.length > 1) {
            previousHistoryData = historyData?.tagItems?.[1]?.metaData?.historyInfo;
        }
        return (
            <View style={styles.historyList}>
                {HISTORY_CONSTANT && Object.keys(HISTORY_CONSTANT).map(historyField => {
                    if (previousHistoryData && !this.isValueEqual(currentHistoryData?.[historyField], previousHistoryData?.[historyField])) {
                        return (
                            <TouchableOpacity onPress={() => {
                                this.openModal('modalMedicalHistory', null, historyField)
                            }} style={styles.singleItem}>
                                <View style={styles.itemDetail}>
                                    <Text style={styles.itemName}>{HISTORY_CONSTANT[historyField]}</Text>
                                </View>
                                <View style={styles.nextWrapper}>
                                    <Button transparent style={styles.itemNextButton}>
                                        <EntypoIcons size={24} color={Colors.colors.primaryIcon}
                                                     name="chevron-thin-right"/>
                                    </Button>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                })}

            </View>
        )
    }



    checkArrayValues(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    isValueEqual(value1, value2) {
        const isListType = typeof value1 == "object";
        if (isListType) {
            return this.checkArrayValues(value1, value2);
        } else {
            return value1 === value2;
        }
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {modalDetails, openModal, historyData} = this.state;
        let previousHistoryData = null;
        let currentHistoryData = historyData?.tagItems?.[0]?.metaData?.historyInfo;
        if (historyData?.tagItems?.length > 1) {
            previousHistoryData = historyData?.tagItems?.[1]?.metaData?.historyInfo;
        }

        const hasMedicalHistoryChanges = JSON.stringify(currentHistoryData) === JSON.stringify(previousHistoryData);
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                {this.renderScreenHeader()}
                <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false} style={{paddingHorizontal: 24}}>
                    <View style={styles.mainTitleView}>
                        <Text style={styles.mainTitleText}>Completed Notes</Text>
                    </View>
                    {this.renderNotesTopSection()}
                    {!hasMedicalHistoryChanges && this.renderMedicalHistory()}
                    {this.renderChangesSection()}
                    {/*{this.renderEvaluationSection()}
                    {this.renderTranscriptSection()}*/}
                    {this.renderBottomButtons()}
                </Content>
                {openModal && modalDetails && this.renderPageMainModal()}
            </Container>

        );
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 23,
        paddingRight: 16,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    filterBtn: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    backButton: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    mainTitleView: {
        marginBottom: 32,
    },
    mainTitleText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
    },
    desTextView: {
        marginBottom: 24,
    },
    desTextTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.lowContrast,
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    desTextDescription: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    singleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginBottom: 8,
        ...CommonStyles.styles.shadowBox
    },
    itemDetail: {
        flex: 2,
    },
    itemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
    },
    itemDescription: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginTop: 4,
    },
    itemNextButton: {
        paddingLeft: 0,
        paddingRight: 0,
        height: 35,
    },
    noChangeWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginBottom: 8,
        backgroundColor: Colors.colors.highContrastBG
    },
    noChangeText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast
    },
    multipleItem: {
        flexDirection: 'column',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 24,
        marginBottom: 8,
        ...CommonStyles.styles.shadowBox
    },
    progressDetails: {
        marginTop: 24,
    },
    progressBarr: {
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 8,
        height: 8,
        marginBottom: 8,

    },
    progressBottomWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    lightText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.neutral300Icon,
    },
    completedText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast,
    },
    greBtn: {
        paddingBottom: isIphoneX() ? 36 : 24,
    },
    actionsTopWrapper: {
        marginBottom: 16,
    },
    modalTitleWrapper: {
        marginBottom: 10,
    },
    modalTitleText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    modalTitleTextSm: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    modalTitleSubText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
    desTextTitleModal: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    desTextDescriptionModal: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    },
    btnOptions: {
        marginBottom: 16,
    },
    inputRow: {
        borderColor: Colors.colors.borderColor,
        borderTopWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    inputSelf: {
        borderColor: Colors.colors.borderColor,
        borderWidth: 1,
        borderRadius: 8,
        height: 64,
        ...TextStyles.mediaTexts.inputText,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        paddingLeft: 16,
    },
    personalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    personalProImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: 'hidden',
    },
    personalProBgMain: {
        width: 48,
        height: 48,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    personalProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.whiteColor,
    },
    personalDetailWrapper: {
        paddingLeft: 12,
    },
    personalName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    personalDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast,
    },
    boxStatusWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        // height: 56,
        marginBottom: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...CommonStyles.styles.shadowBox
    },
    boxStatusText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast,
        width: '45%',
        textAlign: 'center'
    },
    seeAllBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 24,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    seeAllBtnText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.primaryText,
        paddingRight: 8,
        paddingLeft: 0,
    },
})


export default connectConnections()(ApptCompletedNotesScreen);
