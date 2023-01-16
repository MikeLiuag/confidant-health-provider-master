import React, {Component} from 'react';
import {Body, Container, Content, Header, Left, Right, Text, Title, View} from "native-base";
import {
    FlatList,
    Image, PermissionsAndroid, Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import {
    addTestID, AlertUtil,
    BackButton,
    Colors, DEFAULT_IMAGE,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton, S3_BUCKET_LINK,
    TextStyles,
    TransactionSingleActionItem
} from "ch-mobile-shared";
import {CommonStyles} from "ch-mobile-shared/src/styles";
import {Screens} from "../../constants/Screens";
import EntypoIcons from "react-native-vector-icons/Entypo";
import FeatherIcons from "react-native-vector-icons/Feather";
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/Dog_with_Can.json';
import ViewMoreText from 'react-native-view-more-text';
import Modal from "react-native-modalbox";
import {CONTACT_NOTES_FLAGS, CONTACT_NOTES_STATUS, CRUD_ACTIONS} from "../../constants/CommonConstants";
import ProfileService from "../../services/ProfileService";
import Icon from 'react-native-remix-icon';
import Loader from "../../components/Loader";
import RNFetchBlob from "rn-fetch-blob";

const HEADER_SIZE = getHeaderHeight();
export default class NotesScreen extends Component<Props> {
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: true,
            connection: connection,
            isOpen: false,
            isDisabled: false,
            swipeToClose: true,
            sliderValue: 0.3,
            flagName: 'Flag name',
            showUpdateNoteModal: false,
            selectedNotes: null,
            multipleFiles: [],
            patientContactNotes: []
        }
    }

    componentDidMount(): void {
        this.getPatientContactNotes()
        this.notesRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.getPatientContactNotes()
            },
        );
    }

    componentWillUnmount(): void {
        if (this.notesRefresher) {
            this.notesRefresher.remove();
        }
    }


    /**
     * @function getPatientContactNotes
     * @description This method is used to get Patient Contact Notes
     */
    getPatientContactNotes = async () => {
        try {
            const {connection} = this.state;
            const response = await ProfileService.getContactNotes(connection?.connectionId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({
                    isLoading: false
                })
            } else {
                const patientContactNotes = [...new Set(response?.patientContactNotes?.filter(note => note.flag === CONTACT_NOTES_FLAGS.CAUTION ||
                    note.status === CONTACT_NOTES_STATUS.ACTIVE))]
                this.setState({
                    patientContactNotes: patientContactNotes || [],
                    isLoading: false
                })
            }
        } catch (e) {
            this.setState({
                isLoading: false
            })
        }

    }

    /**
     * @function downloadFile
     * @description This method is used to download file
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
                useDownloadManager: true,
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
     * @function renderViewMore
     * @description This method is used to render more content
     */

    renderViewMore = (onPress) => {
        return (
            <View style={styles.readMoreButton}>
                <Text style={styles.readMoreButtonText} onPress={onPress}>Read more</Text>
                <FeatherIcons onPress={onPress} size={24} color={Colors.colors.primaryIcon} name="arrow-right"/>
            </View>
        )
    }

    /**
     * @function renderViewLess
     * @description This method is used to render less
     */


    renderViewLess = (onPress) => {
        return (
            <View style={styles.readMoreButton}>
                <Text style={styles.readMoreButtonText} onPress={onPress}>Read less</Text>
                <FeatherIcons onPress={onPress} size={24} color={Colors.colors.primaryIcon} name="arrow-up"/>
            </View>
        )
    }


    /**
     * @function getEmptyMessage
     * @description This method is used to get Patient Contact Notes
     */

    getEmptyMessage = () => {
        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>Notes not available</Text>
                <Text style={styles.emptyTextDes}>You don't have any notes at the moment, Tap the Add note button to
                    add new notes.</Text>
            </View>
        );
    };

    /**
     * @function navigateBack
     * @description This method is used to navigate back
     */

    navigateBack() {
        this.props.navigation.goBack();
    };


    /**
     * @function renderAddNoteModalHeader
     * @description This method is used to render add note modal header
     */
    renderAddNoteModalHeader = () => {
        return (
            <View style={[styles.modalHeader, styles.addNoteModalHeader]}>
                <Text style={styles.text}>Add a note</Text>
            </View>
        )
    }


    /**
     * @function getNoteDetail
     * @description This method is used to get note icon details
     */
    getNoteDetail = (flag) => {
        switch (flag) {
            case  CONTACT_NOTES_FLAGS.GENERAL :
                return {
                    title: 'General Note',
                    bgColor: Colors.colors.primaryColorBG,
                    iconColor: Colors.colors.primaryIcon,
                    iconName: "file-text",
                    iconType: 'feather'
                }
            case  CONTACT_NOTES_FLAGS.CAUTION :
                return {
                    title: 'Caution Note',
                    bgColor: Colors.colors.warningBG,
                    iconColor: Colors.colors.warningIcon,
                    iconName: "flag",
                    iconType: 'feather'
                }

            case  CONTACT_NOTES_FLAGS.PROHIBITIVE :
                return {
                    title: 'Prohibitive Note',
                    bgColor: Colors.colors.errorBG,
                    iconColor: Colors.colors.errorIcon,
                    iconName: "x-circle",
                    iconType: 'feather'
                }

            case  CONTACT_NOTES_FLAGS.CONTACT :
                return {
                    title: 'Contact Note',
                    bgColor: Colors.colors.secondaryColorBG,
                    iconColor: Colors.colors.secondaryIcon,
                    iconName: "ri-contacts-line",
                    iconType: 'icon'
                }

            case  CONTACT_NOTES_FLAGS.RELEASE_OF_INFORMATION :
                return {
                    title: 'Release of Information Note',
                    bgColor: Colors.colors.informationBG,
                    iconColor: Colors.colors.informationIcon,
                    iconName: "info",
                    iconType: 'feather'

                }

            case  CONTACT_NOTES_FLAGS.LAB_REQUEST :
                return {
                    title: 'Lab Request Note',
                    bgColor: Colors.colors.successBG,
                    iconColor: Colors.colors.successIcon,
                    iconName: "ri-flask-line",
                    iconType: 'icon'
                }
            default :
                return null
        }
    }

    formatFileByte = (bytes) => {
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let l = 0, n = parseInt(bytes, 10) || 0;
        while(n >= 1024 && ++l){
            n = n/1024;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }
    /**
     * @function renderAddNoteModal
     * @description This method is used to render add modal details
     */
    renderAddNoteModal = () => {
        return (
            <View style={styles.modalContainer}>
                {this.renderAddNoteModalHeader()}
                <ScrollView fadingEdgeLength={1}>
                    <View style={styles.btnOptions}>
                        {CONTACT_NOTES_FLAGS && Object.keys(CONTACT_NOTES_FLAGS)?.map(note => {
                            const btnDetails = this.getNoteDetail(note);
                            return (
                                <View style={styles.addNoteModalItems}>
                                    <TransactionSingleActionItem
                                        title={btnDetails.title}
                                        iconBackground={btnDetails?.bgColor}
                                        renderIcon={(size, color) => {
                                            if (btnDetails.iconType === 'icon') {
                                                return <Icon size={24} color={btnDetails.iconColor}
                                                             name={btnDetails.iconName}/>
                                            } else {
                                                return <FeatherIcons size={24} color={btnDetails.iconColor}
                                                                     name={btnDetails.iconName}/>
                                            }
                                        }
                                        }
                                        onPress={() => {
                                            this.navigateToAddOrEditNotesScreen(note, 'ADD');
                                        }}
                                    />
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
        )
    }

    /**
     * @function renderDocumentSection
     * @description This method is used to render Document Section
     */
    renderDocumentSection = () => {
        const {selectedNotes} = this.state;
        return (
            <View style={styles.uploadedFilesView}>
                {selectedNotes?.attachments?.map((item, key) => (
                    <View style={styles.attachmentView} key={key}>
                        <View style={styles.attachmentDetailsView}>
                            {item.attachmentType?.includes('pdf')  &&
                                <Image source={require("../../assets/images/pdf.png")}
                                       style={{width: 30, height: 40}}/>}
                            {(item.attachmentType?.includes('jpeg') || item.attachmentType?.includes('jpg') || item.attachmentType?.includes('png')) &&
                                <Image source={require("../../assets/images/jpg.png")}
                                       style={{width: 30, height: 40}}/>
                            }
                            <View style={styles.attachmentDetailInner}>
                                {item?.attachmentName && (
                                    <Text style={styles.attachmentTitleText}>{item.attachmentName}</Text>)}
                                {item?.attachmentSize && (
                                    <Text style={styles.attachmentSizeText}>{this.formatFileByte(item.attachmentSize)}</Text>)}
                            </View>
                        </View>
                        {item.attachmentUrl && (
                            <TouchableOpacity onPress={() => this.checkPermission(item.attachmentUrl)}>
                                <View style={styles.attachmentDownloadButton}>
                                    <FeatherIcons size={20} color={Colors.colors.primaryIcon} name="download"/>
                                    <Text style={styles.attachmentDownloadButtonText}>Download</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
        )
    }

    /**
     * @function renderAddNoteModal
     * @description This method is used to render edit modal details
     */
    renderUpdateNoteModal = () => {
        const {selectedNotes} = this.state;
        if (selectedNotes?.flag) {
            const btnDetails = this.getNoteDetail(selectedNotes?.flag);
            return (
                <View style={{...styles.modalContainer, flex: 1}}>
                    <Content
                        scrollIndicatorInsets={{right: 1}}
                        showsVerticalScrollIndicator={false}
                        style={[styles.contentWrapper, styles.updateNoteModalContentView]}>
                        <View style={styles.modalHeader}>
                            <Text style={{...styles.updateNoteModalContentHeading, marginBottom: 8}}>{selectedNotes?.name}</Text>
                            <View style={styles.modalSubHeader}>

                                <View
                                    style={[styles.notesIconWrap,
                                        {backgroundColor: btnDetails.bgColor}
                                    ]}>

                                    {btnDetails.iconType === 'icon' ?
                                        <Icon size={24} color={btnDetails.iconColor}
                                              name={btnDetails.iconName}/>
                                        : <FeatherIcons size={24} color={btnDetails.iconColor}
                                                        name={btnDetails.iconName}/>
                                    }
                                </View>

                                <Text style={styles.modalSubHeaderText}>{btnDetails.title}</Text>
                            </View>

                        </View>
                        <View style={styles.reporterView}>
                            <View style={styles.reporterImage}>
                                <Image
                                    source={{uri: S3_BUCKET_LINK + selectedNotes?.createdBy.profileImage}}
                                    style={{width: 48, height: 48, borderRadius: 25}}
                                />
                            </View>
                            <View style={styles.reporterDetails}>

                                <View style={styles.imgView}>
                                    <Image
                                        {...addTestID('provider-image-png')}
                                        source={{
                                            uri: selectedNotes?.createdBy.profileImage
                                                ? S3_BUCKET_LINK +
                                                selectedNotes?.createdBy.profileImage
                                                : S3_BUCKET_LINK + DEFAULT_IMAGE,
                                        }}
                                        style={styles.feedImg}
                                        resizeMode={'cover'}/>
                                </View>
                                <Text style={styles.reporterDetailsTitle}>{selectedNotes?.createdBy.name}</Text>
                                <Text style={styles.reporterDetailsSubtitle}>Reported
                                    on {selectedNotes?.createdAt}</Text>
                            </View>
                        </View>
                        {/*<View style={styles.updateNoteModalContent}>
                            <Text style={styles.updateNoteModalContentHeading}>Prompt</Text>
                            <ViewMoreText
                                numberOfLines={3}
                                renderViewMore={this.renderViewMore}
                                renderViewLess={this.renderViewLess}
                                textStyle={{textAlign: 'left'}}>
                                <Text
                                    style={styles.updateNoteModalContentDetails}>{selectedNotes?.prompt || 'N/A'}</Text>
                            </ViewMoreText>
                        </View>*/}
                        <View style={styles.updateNoteModalContent}>
                            <Text style={styles.updateNoteModalContentHeading}>Description</Text>
                            <ViewMoreText
                                numberOfLines={3}
                                renderViewMore={this.renderViewMore}
                                renderViewLess={this.renderViewLess}
                                textStyle={{textAlign: 'left'}}>
                                <Text
                                    style={styles.updateNoteModalContentDetails}>{selectedNotes?.notes || "N/A"}</Text>
                            </ViewMoreText>
                        </View>
                        {selectedNotes?.attachments?.length>0 && this.renderDocumentSection()}
                    </Content>
                    <TouchableOpacity style={styles.updateNoteModalButton}>
                        <PrimaryButton
                            text={'Update Note'}
                            disabled={selectedNotes?.status !== CONTACT_NOTES_STATUS.ACTIVE}
                            onPress={() => this.navigateToAddOrEditNotesScreen(null, CRUD_ACTIONS.UPDATE)}
                            bgColor={selectedNotes?.status !== CONTACT_NOTES_STATUS.ACTIVE ? Colors.colors.mainBlue20 : Colors.colors.mainBlue}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    /**
     * @function navigateToAddOrEditNotesScreen
     * @description This method is used to navigate to add/edit notes screen
     */
    navigateToAddOrEditNotesScreen = (notesFlag, type) => {
        this.closeModal();
        const {selectedNotes, connection} = this.state;
        this.props.navigation.replace(Screens.ADD_NEW_NOTES_SCREEN, {
            noteForUpdate: selectedNotes,
            isUpdateFlow: type === CRUD_ACTIONS.UPDATE,
            notesFlag: notesFlag,
            connection: connection
        })
    }


    /**
     * @function renderNotes
     * @description This method is used to get render Notes
     */
    renderNotes = () => {
        const {patientContactNotes} = this.state;
        const renderItem = ({item}) => {
            if (item?.flag) {
                const noteIconDetail = this.getNoteDetail(item.flag);
                return (
                    <View style={styles.item}>
                        <TouchableOpacity
                            style={styles.noteButton}
                            onPress={() => {
                                this.openModal('updateNoteModal', item);
                            }}>

                            <View>
                                <View
                                    style={[styles.notesIconWrap,
                                        {backgroundColor: noteIconDetail.bgColor}
                                    ]}>
                                    {noteIconDetail.iconType === 'icon' ?
                                        <Icon size={24} color={noteIconDetail.iconColor}
                                              name={noteIconDetail.iconName}/>
                                        : <FeatherIcons size={24} color={noteIconDetail.iconColor}
                                                        name={noteIconDetail.iconName}/>
                                    }
                                </View>
                            </View>
                            <View style={styles.patientNoteDetail}>
                                <Text
                                    style={styles.patientNoteName}>{item?.name}</Text>
                                <Text
                                    style={styles.patientNoteDate} numberOfLines={2}>
                                    {item.createdAt}
                                </Text>
                            </View>
                            <View style={styles.nextWrapper}>
                                <View>
                                    <EntypoIcons size={30} color={Colors.colors.neutral50Icon}
                                                 name="chevron-thin-right"/>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            }
        };
        return (
            <SafeAreaView>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={patientContactNotes}
                    renderItem={renderItem}
                    keyExtractor={item => item?.id}
                />
            </SafeAreaView>
        )
    }


    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type, selectedItem) => {
        this.setState({
            selectedNotes: selectedItem,
            modalDetails: this.getRenderModalDetails(type),
            openModal: true
        })
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null, selectedNotes: null, openModal: false})
    }


    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'addNoteModal' :
                return {ref: "addNoteModal", maxHeight: null, method: () => this.renderAddNoteModal()};
            case 'updateNoteModal' :
                return {ref: "updateNoteModal", maxHeight: '80%', method: () => this.renderUpdateNoteModal()};
            default :
                return null
        }
    }


    /**
     * @function renderAddEditModal
     * @description This method is used to render page main model.
     */
    renderAddEditModal = () => {
        const {openModal, modalDetails} = this.state;
        return (<Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            isOpen={openModal}
            onClosed={() => {
                this.closeModal();
            }}
            style={{
                ...CommonStyles.styles.commonModalWrapper,
                height: modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                paddingLeft: 0,
                paddingRight: 0,
            }}
            entry={"bottom"}
            position={"bottom"}
            ref={modalDetails?.ref}
            swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}/>
            {modalDetails?.method()}
        </Modal>)
    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */

    renderHeader = () => {
        return (
            <Header transparent style={styles.header}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
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
                    <Title style={styles.headerText}>Patient notes</Title>
                </Body>
                <Right style={{flex: 1, paddingRight: 12}}>

                </Right>
            </Header>
        )
    }


    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {patientContactNotes, modalDetails, openModal} = this.state;
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                {this.renderHeader()}
                <Content
                    scrollIndicatorInsets={{right: 1}}
                    showsVerticalScrollIndicator={false}
                    style={styles.contentWrapper}>
                    {patientContactNotes?.length > 0 ? this.renderNotes() : this.getEmptyMessage()}
                </Content>
                <TouchableOpacity style={styles.greBtn}>
                    <PrimaryButton
                        text={'Add note'}
                        onPress={() => {
                            this.openModal('addNoteModal', null);
                        }}
                    />
                </TouchableOpacity>
                {openModal && modalDetails && this.renderAddEditModal()}
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    title: {
        fontSize: 32,
    },
    modalContainer: {
        paddingTop: 8,
        paddingRight: 24,
        paddingLeft: 24,

    },
    addNoteModalItems: {
        marginBottom: 16,
    },
    modalHeader: {
        marginBottom: 32,
        display: "flex",
        flexDirection: "column"
    },
    addNoteModalHeader: {
        marginBottom: 16,
    },
    modalSubHeader: {
        marginTop: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    modalSubHeaderText: {
        marginLeft: 8,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
    },
    modalDraggableIconView: {
        marginBottom: 28
    },
    modalDraggableIcon: {
        borderBottomColor: Colors.colors.neutral500Icon,
        borderBottomWidth: 5,
        width: 50,
        alignSelf: "center",
        borderRadius: 20,
        opacity: .2
    },
    text: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
    },
    headerText: {
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeBold,
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
    noteButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.colors.lowContrastBG,
        elevation: 1,
        borderRadius: 8,
        marginBottom: 8
    },
    notesIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 8,
        // backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 0,
        paddingBottom: 0,
        alignItems: 'center',
        justifyContent: 'center',

    },
    patientNoteDetail: {
        flex: 2,
        paddingLeft: 12
    },
    patientNoteName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },
    patientNoteDate: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
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

    btnOptions: {
        marginBottom: 8,
        height: 620
    },
    addNoteModalButtons: {
        marginBottom: 16,
        borderColor: Colors.colors.borderColorLight
    },
    contentWrapper: {
        backgroundColor: '#f7f9ff',
        flexDirection: 'column',
        position: 'relative',
        paddingHorizontal: 24
    },
    updateNoteModalContentView: {
        //paddingBottom: 265,
        backgroundColor: Colors.colors.lowContrastBG,
        padding: 0,
        paddingHorizontal: 0
    },
    updateNoteModalContent: {
        marginBottom: 24
    },
    updateNoteModalContentHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 8

    },
    updateNoteModalContentDetails: {
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.bodyTextS,
    },
    readMoreButton: {display: 'flex', flexDirection: 'row', marginTop: 8,},
    readMoreButtonText: {
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryText,
        marginRight: 8,
    },
    updateNoteModalButton: {
        padding: 0,
        paddingBottom: isIphoneX() ? 36 : 24,
    },
    modalHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    reporterView: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 28
    },
    reporterImage: {
        marginRight: 12
    },
    reporterDetails: {
        display: "flex",
        flexDirection: "column",
    },
    reporterDetailsTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
    },
    reporterDetailsSubtitle: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast
    },

    /** Empty Message Css */
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0,
    },
    emptyAnim: {
        width: '90%',
        // alignSelf: 'center',
        marginBottom: 10,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    newMemberImg: {
        width: 112,
        height: 112,
        borderRadius: 60,
        overflow: 'hidden'
    },
    feedImg: {
        width: 48
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
