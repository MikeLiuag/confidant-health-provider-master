import React, {Component} from 'react';
import {Body, Container, Content, Header, Left, Right, Text, Title, View} from "native-base";
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import {
    addTestID, AlertUtil, BackButton,
    Colors, CommonTextArea,
    getHeaderHeight,
    isIphoneX, PrimaryButton,
    TextStyles, valueExists,
} from "ch-mobile-shared";
import {Screens} from "../../constants/Screens";
import Modal from "react-native-modalbox";
import {CommonStyles} from "ch-mobile-shared/src/styles";
import {DropDownInputField} from "ch-mobile-shared/src/components/DropDownInputField";
import ProfileService from "../../services/ProfileService";
import {REMOVAL_REASONS} from "../../constants/CommonConstants";
import Loader from "../../components/Loader";

const HEADER_SIZE = getHeaderHeight();

export default class RemoveNotesScreen extends Component<Props> {

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.noteForUpdate = navigation.getParam('noteForUpdate', null);
        this.isUpdateFlow = navigation.getParam('isUpdateFlow', false);
        this.connection = navigation.getParam('connection', null);
        this.referrerScreen = navigation.getParam('referrerScreen', false);
        this.state = {
            isOpen: false,
            isDisabled: false,
            swipeToClose: true,
            sliderValue: 0.3,
            noteForUpdate: this.noteForUpdate,
            noteRemovalReason: '',
            removalComment: '',
            removalReasons: REMOVAL_REASONS,
            isLoading: false,
        };
    }


    /**
     * @function validateContactNotesRemovalNotes
     * @description This method is used to validate removal notes
     */


    validateContactNotesRemovalNotes = () => {
        const {noteRemovalReason, removalComment} = this.state;
        if (!valueExists(noteRemovalReason)) {
            AlertUtil.showErrorMessage("Please select reason for removal")
            return false;
        }
        if (!valueExists(removalComment)) {
            AlertUtil.showErrorMessage("Please write removal comment for note")
            return false;
        }
        return true;
    }

    /**
     * @function removeContactNote
     * @description This method is used to remove contact note
     */
    removeContactNote = async () => {
        if (this.validateContactNotesRemovalNotes()) {
            try {
                this.setState({isLoading: true})
                const {removalComment, noteRemovalReason, noteForUpdate} = this.state;
                const contactNotesPayLoad = {
                    notes: noteForUpdate?.notes,
                    prompt: noteForUpdate?.prompt,
                    flag: noteForUpdate?.flag,
                    name: noteForUpdate?.name,
                    type: noteForUpdate?.type,
                    patientId: this.connection?.connectionId,
                    notesId: noteForUpdate.notesId,
                    removalComment: removalComment,
                    removalReason: noteRemovalReason
                }
                const contactNotesResponse = await ProfileService.removePatientContactNotes(contactNotesPayLoad);
                if (contactNotesResponse.errors) {
                    AlertUtil.showErrorMessage(contactNotesResponse?.errors?.[0].endUserMessage);
                    this.setState({isLoading: false});
                } else {
                    this.setState({isLoading: false})
                    AlertUtil.showSuccessMessage('Patient contact notes removed successfully');
                    this.navigateToNotesScreen()

                }
            }catch (e){
                AlertUtil.showErrorMessage("Whoops! Something went wrong");
                this.setState({isLoading: false});
            }

        }
    }

    /**
     * @function navigateBack
     * @description This method is used to navigate back
     */

    navigateBack =()=> {
        if(this.referrerScreen){
            this.props.navigation.replace(this.referrerScreen,{
                ...this.props.navigation.state.params,
            })
        }else {
            this.props.navigation.goBack();
        }
    };


    /**
     * @function navigateToNotesScreen
     * @description This method is used to navigate to bottom tab screen
     */
    navigateToNotesScreen = ()=>{
        this.props.navigation.replace(Screens.NOTES_SCREEN,{
            connection: this.connection
        })
    }

    /**
     * @function renderModalDraggableIcon
     * @description This method is used to render modal draggable options
     */
    renderModalDraggableIcon = () => {
        return (
            <View style={styles.modalDraggableIconView}>
                <View style={styles.modalDraggableIcon}/>
            </View>
        )
    }


    /**
     * @function renderSelectDropdown
     * @description This method is used to render select removal reason dropdown
     */
    renderSelectDropdown = () => {
        const {noteRemovalReason,removalReasons} = this.state;
        return (
            <View style={styles.selectBox}>
                <View>
                    <Text style={styles.dropDownLabel}>Removal reason</Text>
                </View>
                <View>
                    <DropDownInputField
                        testId={'reason-type'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value) => {
                            this.setState({noteRemovalReason: value});
                        }}
                        value={noteRemovalReason}
                        editable={true}
                        options={removalReasons}
                        type={'Reason'}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>
                <View style={styles.helperTextView}>
                    <Text style={styles.helperText}>We need to understand why did you remove a note</Text>
                </View>
            </View>
        )
    }


    /**
     * @function renderTextArea
     * @description This method is used to render text Area
     */
    renderTextArea = () => {
        const {removalComment} = this.state;
        return (
            <View style={styles.textAreaView}>
                <Text style={styles.textAreaTitle}>Comment</Text>
                <CommonTextArea
                    placeHolderText={'Type something here ...'}
                    value={removalComment}
                    borderColor={Colors.colors.shadowColor}
                    onChangeText={(removalComment) => {
                        this.setState({removalComment})
                    }}/>
            </View>
        )
    }


    /**
     * @function confirmDeleteNote
     * @description This method is used to remove note
     */
    confirmDeleteNote = () => {
        this.refs.confirmDeleteNoteModal.close()
        this.removeContactNote()
    }

    /**
     * @function getFlagText
     * @description This method is used to get flag Text
     */
    getFlagText = (flag)=>{
        let flagText = "";
        if(valueExists(flag)) {
            const hasDashes = flag?.includes("_");
            flagText = flag?.toString()?.toLowerCase();
            if(hasDashes){
                flagText = flagText?.replace(/_/g, ' ')
            }
        }
        return flagText;
    }


    /**
     * @function renderConfirmDeleteNoteModal
     * @description This method is used to render delete modal ( for confirmation )
     */
    renderConfirmDeleteNoteModal = () => {
        const {noteForUpdate} = this.state;
        return (
            <View style={styles.modalContainer}>
                {this.renderModalDraggableIcon()}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalHeaderText}>{`You are about to delete a ${this.getFlagText(noteForUpdate?.flag)} note. Are you sure?`}</Text>
                </View>

                <View style={styles.btnOptions}>
                    <TouchableOpacity style={[styles.greBtn, styles.modalButtons]}>
                        <PrimaryButton
                            textColor={Colors.colors.primaryText}
                            bgColor={Colors.colors.primaryColorBG}
                            text={'Keep note'}
                            onPress={() => this.refs.confirmDeleteNoteModal.close()}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.greBtn, styles.modalButtons]}>
                        <PrimaryButton
                            bgColor={Colors.colors.errorIcon}
                            text={'Delete note'}
                            onPress={() => this.confirmDeleteNote()}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    /**
     * @function renderHeaderView
     * @description This method is used to render Header view
     */
    renderHeaderView = () => {
        const {noteForUpdate} = this.state;
        return (
            <View>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1, paddingLeft: 12}}>
                        <TouchableOpacity>
                            <BackButton
                                {...addTestID('Back')}
                                onPress={() => this.navigateBack()}
                            />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title style={styles.headerText}>{`Remove a ${this.getFlagText(noteForUpdate?.flag)} note`}</Title>
                    </Body>
                    <Right style={{flex: 1, paddingRight: 12}}>

                    </Right>
                </Header>
            </View>
        )
    }


    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                {this.renderHeaderView()}
                <KeyboardAvoidingView
                    style={{flex: 1, bottom: 0}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Content
                        scrollIndicatorInsets={{right: 1}}
                        showsVerticalScrollIndicator={false}
                        style={styles.contentWrapper}>
                        {this.renderSelectDropdown()}
                        {this.renderTextArea()}
                    </Content>
                </KeyboardAvoidingView>
                <TouchableOpacity style={styles.greBtn}>
                    <PrimaryButton
                        bgColor={Colors.colors.errorIcon}
                        text={'Delete note'}
                        onPress={() => {
                            if(this.validateContactNotesRemovalNotes()){
                                this.refs.confirmDeleteNoteModal.open()
                            }
                        }}
                    />
                </TouchableOpacity>
                <Modal style={[styles.modal, styles.confirmDeleteNoteModal]} position={"bottom"}
                       ref={"confirmDeleteNoteModal"}>
                    {this.renderConfirmDeleteNoteModal()}
                </Modal>
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    headerText: {
        ...TextStyles.mediaTexts.TextH5,
        fontWeight: "bold",
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        padding: 0,
    },
    modalHeaderText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        fontWeight: "bold"
    },
    header: {
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    contentWrapper: {
        backgroundColor: '#f7f9ff',
        flexDirection: 'column',
        position: 'relative',
        paddingLeft: 24,
        paddingRight: 24,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow,
    },

    btnOptions: {marginBottom: 0},

    modalButtons: {
        paddingBottom: 16,
        padding: 0,
        fontWeight: "bold"
    },
    modalHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 32
    },
    selectBox: {
        marginVertical: 32,
    },
    dropDownLabel: {
        paddingLeft: 1,
        marginBottom: 16,
        marginTop: 0,
        fontWeight: "bold",
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.darkText

    },
    helperTextView: {
        marginTop: 16,
        marginBottom: 0
    },
    helperText: {
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.disableText,
        // opacity: 0,
        fontWeight: "600"
    },
    textAreaView: {
        marginBottom: 15,
        marginTop: 15
    },
    textAreaTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.darkText,
        fontWeight: "bold",
        marginBottom: 16

    },
    modalContainer: {
        paddingTop: 8,
        paddingRight: 24,
        paddingLeft: 24,

    },
    modal: {
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
    },
    confirmDeleteNoteModal: {
        height: 300
    },
    modalHeader: {
        marginBottom: 32
    },
    modalDraggableIconView: {
        marginBottom: 32
    },
    modalDraggableIcon: {
        borderBottomColor: Colors.colors.neutral500Icon,
        borderBottomWidth: 5,
        width: 50,
        alignSelf: "center",
        borderRadius: 20,
        opacity: .2
    },

});
