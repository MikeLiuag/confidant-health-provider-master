import React, {Component} from 'react';
import {Body, Container, Content, Header, Label, Left, Right, Text, Title, View} from "native-base";
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    PermissionsAndroid,
    Image
} from "react-native";
import {
    addTestID,
    AlertUtil,
    BackButton,
    Colors,
    CommonTextArea,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton, S3_BUCKET_LINK,
    TextStyles, valueExists,
} from "ch-mobile-shared";
import {CommonStyles} from "ch-mobile-shared/src/styles";
import {DropDownInputField} from "ch-mobile-shared/src/components/DropDownInputField";
import ProfileService from "../../services/ProfileService";
import {Screens} from "../../constants/Screens";
import AntDesign from "react-native-vector-icons/AntDesign";
import DocumentPicker from 'react-native-document-picker';
import FeatherIcons from "react-native-vector-icons/Feather";
import RNFetchBlob from 'rn-fetch-blob';
import Loader from "../../components/Loader";
import {CONTACT_NOTES_FLAGS, CONTACT_NOTES_TYPES, CONTACT_NOTES_TIME} from "../../constants/CommonConstants";
import {S3MediaManager} from "../../services/S3MediaManager";
import {connectConnections} from "../../redux";

const HEADER_SIZE = getHeaderHeight();


class AddEditContactNotesScreen extends Component<Props> {
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.notesFlag = navigation.getParam('notesFlag', null);
        this.noteForUpdate = navigation.getParam('noteForUpdate', null);
        this.isUpdateFlow = navigation.getParam('isUpdateFlow', false);
        this.connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: false,
            isOpen: false,
            isDisabled: false,
            swipeToClose: true,
            sliderValue: 0.3,
            attachments: this.noteForUpdate?.attachments || [],
            prompt: this.noteForUpdate?.prompt || '',
            notes: this.noteForUpdate?.notes || '',
            type: this.noteForUpdate?.type || '',
            name: this.noteForUpdate?.name || '',
            flag: this.noteForUpdate?.flag || this.notesFlag,
            noteForUpdate: this.noteForUpdate,
            notesNameFocus: true,
            contactNotesTypes: CONTACT_NOTES_TYPES,
            options: '',
            timeSpent: this.noteForUpdate?.timeSpent ? this.noteForUpdate?.timeSpent?.toString() + " minutes" : '',
            relationship: this.noteForUpdate?.relationship || ''
        };
        this.PATIENT_NOTE_FOLDER = 'CONTACT_NOTES/' + this.connection?.connectionId + '/'
    }


    /**
     * @function downloadFile
     * @description This method is used to downlaod file
     */
    downloadFile = (fileUrl) => {
        let FILE_URL = fileUrl;
        let file_ext = this.getFileExtention(FILE_URL);
        file_ext = '.' + file_ext[0];
        const {config, fs} = RNFetchBlob;
        let RootDir = fs.dirs.PictureDir;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                path:
                    RootDir +
                    '/file_' +
                    file_ext,
                description: 'downloading file...',
                notification: true,
                // useDownloadManager works with Android only
                useDownloadManager: true,
                IOSBackgroundTask : true,
                overwrite : true
            },
        };
        config(options)
            .fetch('GET', S3_BUCKET_LINK + FILE_URL)
            .then(res => {
                AlertUtil.showSuccessMessage('File Downloaded Successfully.');
            });
    }


    /**
     * @function getFileExtention
     * @description This method is used to get file extension
     */
    getFileExtention = (fileUrl) => {
        return /[.]/.exec(fileUrl) ?
            /[^.]+$/.exec(fileUrl) : undefined;
    };


    /**
     * @function checkPermission
     * @description This method is used to check permissions
     */
    checkPermission = async (fileUrl) => {
        if (Platform.OS === 'ios') {
            this.downloadFile(fileUrl);
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message:
                            'Application needs access to your storage to download File',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    this.downloadFile(fileUrl);
                } else {
                    AlertUtil.showErrorMessage('Error! Storage Permission Not Granted');
                }
            } catch (err) {
                console.log(err);
            }
        }
    };

    /**
     * @function getFlagText
     * @description This method is used to get flag Text
     */
    getFlagText = (flag) => {
        let flagText = "";
        if (valueExists(flag)) {
            const hasDashes = flag?.includes("_");
            flagText = flag?.toString()?.toLowerCase();
            if (hasDashes) {
                flagText = flagText?.replace(/_/g, ' ')
            }
        }
        return flagText;
    }


    /**
     * @function renderHeaderView
     * @description This method is used to render header view
     */
    renderHeaderView = () => {
        const {noteForUpdate, flag} = this.state;
        let noteFlag = this.isUpdateFlow ? noteForUpdate?.flag : flag;
        noteFlag = this.getFlagText(noteFlag);
        return (
            <View>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <TouchableOpacity>
                            <BackButton
                                {...addTestID('Back')}
                                onPress={() => this.navigateBack()}
                            />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title
                            style={styles.headerText}>{`${this.isUpdateFlow ? "Update" : "Add"} ${noteFlag} note`}</Title>
                    </Body>
                    <Right style={{flex: 1, paddingRight: 12}}>
                        {(this.isUpdateFlow && noteForUpdate?.flag !== CONTACT_NOTES_FLAGS.PROHIBITIVE) &&
                            <AntDesign size={24} color={Colors.colors.mainPink} name="delete"
                                       onPress={() => this.navigateToRemoveContactNotesScreen()}/>}
                    </Right>
                </Header>
            </View>
        )
    }


    /**
     * @function getDropDownType
     * @description This method is used to get drop down type ( basis on flag )
     */
    getDropDownType = () => {
        const {noteForUpdate} = this.state;
        const flagType = this.isUpdateFlow ? noteForUpdate?.flag.toUpperCase() : this.notesFlag.toUpperCase();
        if (flagType === CONTACT_NOTES_FLAGS.GENERAL) {
            return null;
        } else if(flagType === CONTACT_NOTES_FLAGS.RELEASE_OF_INFORMATION) {
            return 'Target of release';
        }
        else {
            return 'Type';
        }
    }


    /**
     * @function renderNameOrSelectDropdown
     * @description This method is used to render name /dropdown
     */
    renderNameOrSelectDropdown = () => {
        const {name, type, contactNotesTypes, noteForUpdate, relationship} = this.state;
        const flagType = this.isUpdateFlow ? noteForUpdate?.flag?.toUpperCase() : this.notesFlag?.toUpperCase();
        const hasDropDown = this.getDropDownType();
        return (
            <View style={styles.selectBox}>
                <View style={{marginBottom: 20}}>
                    <Label style={styles.fieldLabel}>Title</Label>
                    <TextInput style={styles.textInput}
                               {...addTestID('input-notes-name')}
                               placeholder="Enter note title"
                               placeholderTextColor={Colors.colors.inputPlaceholder}
                               borderColor={Colors.colors.inputBorder}
                               value={this.replaceSpace(name)}
                               onChangeText={(notesName) => {
                                   this.showMaxAlert(notesName);
                                   this.setState({name: notesName})
                               }}
                               maxLength={100}
                    />
                </View>
                {flagType === CONTACT_NOTES_FLAGS.RELEASE_OF_INFORMATION && (
                    <View style={{marginBottom: 20}}>
                        <Label style={styles.fieldLabel}>Relationship</Label>
                        <TextInput style={styles.textInput}
                                   {...addTestID('notes-relationship')}
                                   placeholder="Type Something ..."
                                   placeholderTextColor={Colors.colors.inputPlaceholder}
                                   borderColor={Colors.colors.inputBorder}
                                   value={relationship}
                                   onChangeText={(relationship) => {
                                       this.setState({relationship: relationship})
                                   }}
                                   maxLength={256}
                        />
                    </View>
                )}
                {hasDropDown && (
                    <View style={styles.dropDownView}>
                        <View>
                            <Text style={styles.dropDownLabel}>{this.getDropDownType()}</Text>
                        </View>
                        <View>
                            <DropDownInputField
                                testId={'state-input'}
                                hasError={false}
                                hasFocus={false}
                                keyboardType={'default'}
                                onChange={(value) => {
                                    this.setState({type: value});
                                }}
                                getRef={field => {
                                    this.form.stateField = field;
                                }}
                                value={type}
                                labelErrorText={`Invalid ${this.getDropDownType()}`}
                                labelText={`Notes ${this.getDropDownType()}`}
                                editable={true}
                                options={contactNotesTypes[flagType]}
                                type={`Select a ${this.getDropDownType()}`}
                                dropDownIconColor={Colors.colors.mainBlue}
                            />
                        </View>
                        {flagType === CONTACT_NOTES_FLAGS.CONTACT && (
                            <View style={styles.helperTextView}>
                                <Text style={styles.helperText}>Please make sure to include the date & time of the phone
                                    call
                                    and a
                                    phone number.</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        )
    }

    /**
     * @function getTextAreaDetail
     * @description This method is used to get text area detail
     */
    getTextAreaDetail = (type) => {
        switch (type) {
            case 'NOTES' :
                return {
                    title: "Description",
                    fieldName: 'notes'
                }
            case 'PROMPT' :
                return {
                    title: "Prompt",
                    fieldName: 'prompt'


                }
            default :
                return null
        }
    }

    /**
     * @function renderTextArea
     * @description This method is used to render text area for Note & prompt
     */
    renderTextArea = (type) => {
        const textAreaDetail = this.getTextAreaDetail(type);
        return (
            <View>
                <View style={styles.textAreaView}>
                    <Text style={styles.title}>{textAreaDetail?.title}</Text>
                    <CommonTextArea
                        placeHolderText={'Type something...'}
                        value={this.state[textAreaDetail?.fieldName]}
                        borderColor={Colors.colors.shadowColor}
                        onChangeText={(value) => {
                            this.setState({[textAreaDetail?.fieldName]: value})
                        }}
                    />
                </View>
            </View>
        )
    }


    /**
     * @function renderAttachmentUpload
     * @description This method is used to upload attachment
     */
    renderAttachmentUpload = () => {
        return (
            <View style={styles.attachmentUploadView}>
                <Text style={styles.title}>Attachments</Text>
                <TouchableOpacity style={styles.attachmentButton}
                                  onPress={() => this.selectMultipleFile()}>
                    <FeatherIcons size={30} color={Colors.colors.primaryIcon} name="upload-cloud"/>
                    <Text style={styles.buttonText}>Upload Files</Text>
                    <Text style={[styles.helperText, {fontSize: 12}]}>File size up to 200MB</Text>
                </TouchableOpacity>
            </View>
        )
    }


    /**
     * @function renderUploadedAttachments
     * @description This method is used to render uploaded attachments
     */
    renderUploadedAttachments = () => {
        const {attachments} = this.state;
        return (
            <View style={styles.uploadedFilesView}>
                {attachments?.map((item, key) => (
                    <View style={styles.attachmentView} key={key}>
                        <View style={styles.attachmentDetailsView}>
                            {item.attachmentType?.includes('pdf') &&
                                <Image source={require("../../assets/images/pdf.png")}
                                       style={{width: 30, height: 40}}/>}
                            {(item.attachmentType?.includes('jpeg') || item.attachmentType?.includes('jpg') || item.attachmentType?.includes('png')) &&
                                <Image source={require("../../assets/images/jpg.png")}
                                       style={{width: 30, height: 40}}/>
                            }

                            <View style={styles.attachmentDetailInner}>
                                {item?.attachmentName && (
                                    <Text style={styles.attachmentTitleText}>{item.attachmentName}</Text>)}
                                {item.attachmentSize && (
                                    <Text style={styles.attachmentSizeText}>{this.formatFileByte(item.attachmentSize)}</Text>)}
                            </View>
                        </View>
                        {item.attachmentUrl && (
                            <TouchableOpacity onPress={() => this.checkPermission(item.attachmentUrl)}>
                                <View style={styles.attachmentDownloadButton}>
                                    <FeatherIcons size={20} color={Colors.colors.primaryIcon} name="download"/>
                                    <Text style={styles.attachmentDownloadButtonText}>Downloads</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
        )
    }


    /**
     * @function showMaxAlert
     * @description This method is used to show alert message on exceeding text limit
     */
    showMaxAlert = (text) => {
        let textLength = text?.length?.toString();
        if (textLength > 100) {
            AlertUtil.showMessage("Sorry, Note name exceeds the maximum length.", 'Close', 'top', "warning")
        }
    };


    /**
     * @function replaceSpace
     * @description This method is used to replace space from string
     */
    replaceSpace = (str) => {
        return str.replace(/\u0020/, '\u00a0')
    }


    /**
     * @function validateNotes
     * @description This method is used to validate Note
     */
    validateNotes = (disabledCheck) => {
        const {notes, name, type,attachments,noteForUpdate,flag} = this.state;
        let noteFlag = this.isUpdateFlow ? noteForUpdate?.flag : flag;
        const hasDropDownValue = this.getDropDownType();
        if (!valueExists(name?.trim())) {
            if (!disabledCheck) {
                AlertUtil.showErrorMessage("Invalid Name")
            }
            return false;
        }

        if (!valueExists(notes?.trim())) {
            if (!disabledCheck) {
                AlertUtil.showErrorMessage("Invalid Description")
            }
            return false;
        }
        if (hasDropDownValue) {
            if (!valueExists(type?.trim())) {
                if (!disabledCheck) {
                    AlertUtil.showErrorMessage("Invalid type")
                }
                return false;
            }
        }
        if (noteFlag === CONTACT_NOTES_FLAGS.RELEASE_OF_INFORMATION || noteFlag === CONTACT_NOTES_FLAGS.LAB_REQUEST) {
            if (attachments?.length < 1) {
                if (!disabledCheck) {
                    AlertUtil.showErrorMessage("Please select one attachment")
                }
                return false;
            }
        }
        return true;
    }

    /**
     * @function navigateBack
     * @description This method is used to navigate back
     */
    navigateBack = ()=> {
        if(this.connection) {
            this.props.navigation.replace(Screens.NOTES_SCREEN, {
                connection: this.connection
            });
        }else {
            this.props.navigation.goBack();
        }
    };



    /**
     * @function navigateToRemoveContactNotesScreen
     * @description This method is used to navigate to remove contact note screen
     */
    navigateToRemoveContactNotesScreen = () => {
        this.props.navigation.replace(Screens.REMOVE_NOTES_SCREEN, {
            ...this.props.navigation.state.params,
            referrerScreen : Screens.ADD_NEW_NOTES_SCREEN

        });
    }

    /**
     * @function selectMultipleFile
     * @description This method is used to select multiple file .
     */

    selectMultipleFile = async () => {
        try {
            let {attachments} = this.state;
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
            });
            let uploadedFilesData = results.map(fileData => {
                return {
                    attachmentSize: fileData.size,
                    attachmentName: fileData?.name,
                    attachmentUrl: this.PATIENT_NOTE_FOLDER +this.replaceSpace(fileData?.name),
                    attachmentUri: fileData?.uri,
                    attachmentType: fileData?.type
                }

            })
            attachments = [...attachments, ...uploadedFilesData];
            this.setState({attachments});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                //AlertUtil.showErrorMessage('Canceled from multiple doc picker');
            } else {
                AlertUtil.showErrorMessage('Unknown Error: ' + JSON.stringify(err));
            }
        }
    };


    /**
     * @function formatFileByte
     * @description This method is used to set file formate Byte .
     */
    formatFileByte = (bytes) => {
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let l = 0, n = parseInt(bytes, 10) || 0;
        while(n >= 1024 && ++l){
            n = n/1024;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }

    /**
     * @function uploadFilesToS3
     * @description This method is used to upload attachments files to S3
     */
    uploadFilesToS3 = async () => {
        const {attachments} = this.state;
        if(attachments?.length>0) {
            this.setState({isLoading: true});
            for (const fileData of attachments) {
                let file = {
                    name: this.replaceSpace(fileData?.attachmentName),
                    uri: fileData?.attachmentUri,
                    type: fileData?.attachmentType,
                }
                const response = await S3MediaManager.uploadContactNotesMedia(file, this.PATIENT_NOTE_FOLDER, (e) => {
                    console.log("error", e)
                });
                if (response.success) {
                    console.log("Image uploaded successfully")
                } else {
                    AlertUtil.showErrorMessage(`Media storage service failed to upload ${fileData?.attachmentName}`);
                    this.setState({isLoading: false});
                }
            }
            await this.saveOrUpdateNote();
        }else{
            this.saveOrUpdateNote();
        }
    }


    /**
     * @function saveOrUpdateNote
     * @description This method is used to save/update note
     */
    saveOrUpdateNote = async () => {
        if (this.validateNotes(false)) {
            try {
                this.setState({isLoading: true})
                const {
                    notes,
                    flag,
                    name,
                    type,
                    noteForUpdate,
                    attachments,
                    prompt,
                    timeSpent,
                    relationship
                } = this.state;
                const timeValue = timeSpent?.replace(/[^\d.]/g, '');
                const contactNotesPayLoad = {
                    attachments, notes, name, type, prompt,
                    flag: this.isUpdateFlow ? noteForUpdate?.flag : flag,
                    patientId: this.connection?.connectionId,
                    notesId: this.isUpdateFlow ? noteForUpdate?.notesId : '',
                    removalComment: this.isUpdateFlow ? noteForUpdate?.removalComment : '',
                    removalReason: this.isUpdateFlow ? noteForUpdate?.removalReason : '',
                    timeSpent: parseInt(timeValue),
                    relationship: relationship?.trim(),
                };
                let noteUpdateCall = await ProfileService.addPatientContactNotes;
                if (this.isUpdateFlow) {
                    noteUpdateCall = await ProfileService.updatePatientContactNotes;
                }
                const contactNotesResponse = await noteUpdateCall(contactNotesPayLoad);
                if (contactNotesResponse.errors) {
                    AlertUtil.showErrorMessage(contactNotesResponse?.errors?.[0]?.endUserMessage);
                    this.setState({isLoading: false});
                } else {
                    this.setState({isLoading: false})
                    AlertUtil.showSuccessMessage(`Patient contact notes ${this.isUpdateFlow ? 'updated' : 'added'} successfully`);
                    this.props.refreshConnections();
                    this.navigateBack();
                }
            } catch (e) {
                AlertUtil.showErrorMessage("Whoops! Something went wrong");
                this.setState({isLoading: false});
            }

        }
    }

    /**
     * @function renderTimeSpent
     * @description This method is used to render time spent
     */

    renderTimeSpent = () => {
        const {timeSpent} = this.state;
        return (
            <View style={{...styles.dropDownView, marginBottom: 20}}>
                <View>
                    <Text style={styles.dropDownLabel}>Time Spent</Text>
                </View>
                <View>
                    <DropDownInputField
                        testId={'state-input'}
                        hasError={false}
                        hasFocus={false}
                        keyboardType={'default'}
                        onChange={(value) => {
                            this.setState({timeSpent: value});
                        }}
                        getRef={field => {
                            this.form.stateField = field;
                        }}
                        value={timeSpent}
                        labelErrorText={`Invalid Time`}
                        labelText={`Time Spent`}
                        editable={true}
                        options={CONTACT_NOTES_TIME}
                        type={`Select a time`}
                        dropDownIconColor={Colors.colors.mainBlue}
                    />
                </View>
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
                        {this.renderNameOrSelectDropdown()}
                        {this.renderTimeSpent()}
                        {this.renderTextArea("NOTES")}
                        {/*{this.renderTextArea("PROMPT")}*/}
                        {this.renderAttachmentUpload()}
                        {this.renderUploadedAttachments()}
                    </Content>
                </KeyboardAvoidingView>
                <TouchableOpacity style={styles.greBtn}>
                    <PrimaryButton
                        disabled={!this.validateNotes(true)}
                        text={this.isUpdateFlow ? 'Update notes' : 'Save note'}
                        onPress={() => {
                            this.uploadFilesToS3()
                        }}
                    />

                </TouchableOpacity>
            </Container>
        );
    }

}
const styles = StyleSheet.create({
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        padding: 0,
    },
    header: {
        // paddingTop: 30,
        paddingLeft: 24,
        display: "flex",
        flexDirection: "row",
        alignSelf: "center",
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
    headerStyles: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH4,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    selectBox: {
        marginVertical: 20,
    },
    dropDownView: {
        // marginBottom:15
    },
    dropDownLabel: {
        paddingLeft: 1,
        marginBottom: 16,
        // paddingBottom: 16,
        paddingTop: 0,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,

    },
    helperTextView: {
        marginTop: 16,
    },
    helperText: {
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.disableText,
        // opacity: 0,
        fontWeight: "600"
    },
    title: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        // marginTop: 10
    },
    textAreaView: {
        marginBottom: 15,
    },
    textInput: {
        backgroundColor: Colors.colors.white, borderRadius: 5,
        marginTop: 10, padding: 10
    },
    fieldLabel: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    fieldInput: {
        color: Colors.colors.inputValue,
        textAlign: 'right',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.inputText
    },

    buttonText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.inputText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    attachmentUploadView: {
        marginBottom: 15,
    },
    attachmentButton: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        // width:100,
        height: 100,
        backgroundColor: Colors.colors.whiteColor,
        borderRadius: 5,
    },
    uploadedFilesView: {
        display: 'flex', flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 5,
    },
    attachmentView: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // marginVertical: 10,
        margin: 15,
    },
    attachmentDetailsView: {
        flexDirection: "row",
        width: '55%'
    },
    attachmentDetailInner: {
        display: 'flex',
        flexDirection: 'column',
        marginHorizontal: 10
    },
    attachmentTitleText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    attachmentSizeText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.highContrast,
    },
    attachmentDownloadButton: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    attachmentDownload: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    attachmentDownloadButtonText: {
        marginLeft: 8,
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
    },
});

export default connectConnections()(AddEditContactNotesScreen);
