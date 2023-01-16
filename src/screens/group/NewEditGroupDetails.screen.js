import React, {Component} from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import {
    Container, Text, View, Left, Body, Title, Button, Right, Header,
    Input, Content, Icon, Item
} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    CommonTextArea,
    TransactionSingleActionItem,
    PrimaryButton,
    BackButton,
    ToggleSwitch,
    getHeaderHeight,
    isIphoneX,
    addTestID,
    AlertUtil,
    getTimeFromMilitaryStamp,
    DEFAULT_GROUP_IMAGE
} from 'ch-mobile-shared';
import Modal from 'react-native-modalbox';
import AntIcons from "react-native-vector-icons/AntDesign";
import FeatherIcons from "react-native-vector-icons/Feather";
import ProfileService from "../../services/ProfileService";
import {Screens} from "../../constants/Screens";
import {connectConnections} from "../../redux";
import {PERMISSIONS, request} from "react-native-permissions";
import ImagePicker from "react-native-image-picker";
import Overlay from "react-native-modal-overlay";
import Loader from "../../components/Loader";
import {
    DAYS,
    GROUP_MANAGEMENT_DETAILS_ACTIONS,
    GROUP_MANAGEMENT_LIST_TYPES,
    S3_BUCKET_LINK
} from "../../constants/CommonConstants";
import AwesomeIcons from "react-native-vector-icons/FontAwesome";
import {MeetingSlotSelectionComponent} from "../../components/group/MeetingSlotSelectionComponent";
import {StackedInputField} from "ch-mobile-shared/src/components/StackedInputField";

const HEADER_SIZE = getHeaderHeight();

const TOGGLE_LIST = [
    {
        title: 'Is group discoverable?',
        description: 'Public group option for members.',
        fieldName: 'groupTypePublic'
    },
    {
        title: 'Is group anonymous?',
        description: 'Anonymous group option for members.',
        fieldName: 'groupAnonymous'
    },
    {
        title: 'Group Contributions',
        description: 'Group Contribution option for members.',
        fieldName: 'donationsEnabled'
    }
]


class NewEditGroupDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.group = navigation.getParam('group', null);
        this.state = {
            isLoading: false,
            nameFocus: false,
            imageUploaded: false,
            profilePicture: '',
            name: '',
            groupDescription: '',
            groupTypePublic: false,
            groupAnonymous: false,
            donationsEnabled: false,
            whoCanBenefitsEnabled: false,
            tagsEnabled: false,
            rulesEnabled: false,
            groupDonationSettings: {},
            groupRules: [],
            tags: [],
            whoCanBenefits: [],
            selectedListType: '',
            selectedItem: '',
            selectedItemIndex: '',
            confirmModal: false,
            suggestedAmount: '10',
            meetings: [],
            meetingSlot: {meetingStartTime: 900, meetingEndTime: 1800},
            startTime: false,
            selectedMeetingDay: '',
            androidPickerVisible: false
        };
    }

    componentDidMount = () => {
        if (this.group) {
            this.mapPropsToState();
        }
    }


    /**
     * @function mapPropsToState
     * @description This method is used to map props to state.
     */
    mapPropsToState = () => {
        this.setState({
            ...this.state,
            ...this.group,
            groupRules: this.group?.groupRuleSettings?.rules?.map(rule => rule.description) || [],
            suggestedAmount: this.group?.groupDonationSettings?.suggestedAmount?.toString() || '10',
            imageUploaded: !!this.group?.profilePicture,
            meetings: this.group?.meetings ? this.populateMeetingData() : []
        })
    }


    /**
     * @function populateMeetingData
     * @description This method is used to populate meetings .
     */
    populateMeetingData = () => {
        const {meetings} = this.group;
        return meetings.map(meeting => {
            return {
                ...meeting,
                description: this.getMeetingsPopulatedDescription(meeting.day,
                    {meetingStartTime: meeting.meetingStartTime, meetingEndTime: meeting.meetingEndTime})
            }
        });
    }

    /**
     * @function goBack
     * @description This method is used to navigate back .
     */
    goBack = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function showEditOptions
     * @description This method is used to show Options for group image .
     */
    showEditOptions = () => {
        this.refs.modalEditOptions.open();
    };

    /**
     * @function hideEditOptions
     * @description This method is used to hide Options for group image
     */
    hideEditOptions = () => {
        this.refs.modalEditOptions.close();
    };

    showDayTimeDrawer = (selectedListType, selectedItem, selectedItemIndex, editValue) => {
        let {meetings, meetingSlot, selectedMeetingDay} = this.state;
        if (editValue && selectedListType === GROUP_MANAGEMENT_LIST_TYPES.MEETINGS) {
            meetingSlot = meetings[selectedItemIndex];
            selectedMeetingDay = meetingSlot.day;
            meetingSlot = {
                meetingStartTime: meetingSlot.meetingStartTime,
                meetingEndTime: meetingSlot.meetingEndTime
            }

        }
        this.setState({
            selectedItem,
            selectedListType,
            selectedItemIndex,
            editValue,
            meetingSlot,
            selectedMeetingDay,
            openTimeModal: true
        });
        this.hideModalOptionsForList();
        this.refs.modalDayTimeDrawer.open();
    };

    hideDayTimeDrawer = () => {
        this.setState({openTimeModal: false});
        this.refs.modalDayTimeDrawer.close();
    };


    /**
     * @function updateGroupDetails
     * @description This method is used to show modal ( options for CRUD type fields )
     * @params selectedListType
     */
    showModalIOptionsForList = (selectedListType, selectedItem, selectedItemIndex) => {
        let {meetings, meetingSlot} = this.state;
        if (selectedListType === GROUP_MANAGEMENT_LIST_TYPES.MEETINGS) {
            meetingSlot = meetings[selectedItemIndex];
            meetingSlot = {
                meetingStartTime: meetingSlot.meetingStartTime,
                meetingEndTime: meetingSlot.meetingEndTime
            }
        }
        this.setState({selectedItem, selectedListType, selectedItemIndex, meetingSlot, editValue: false});
        this.refs.addEditModalGroup.close();
        this.refs.modalListOptions.open();
    };


    /**
     * @function hideModalOptionsForList
     * @description This method is used to hide modal ( options for CRUD type fields )
     */
    hideModalOptionsForList = () => {
        this.refs.modalListOptions.close();
    };

    /**
     * @function showAddEditModal
     * @description This method is used to show add/edit new item modal
     * @params selectedListType,editValue
     */
    showAddEditModal = (selectedListType, editValue) => {
        this.setState({editValue, selectedListType: selectedListType || this.state.selectedListType})
        this.refs.modalListOptions.close();
        this.refs.addEditModalGroup.open();
    };

    /**
     * @function hideAddEditModal
     * @description This method is used to hide add/edit new item modal
     */
    hideAddEditModal = () => {
        this.refs.addEditModalGroup.close();
    };


    /**
     * @function deleteGroupImage
     * @description This method is used to remove group Image .
     */
    deleteGroupImage = () => {
        this.setState({imageUploaded: false, fileData: null, profilePicture: DEFAULT_GROUP_IMAGE });
        this.hideEditOptions();
    }


    /**
     * @function checkPermissions
     * @description This method is ued to check permissions
     */
    checkPermissions = () => {
        this.hideEditOptions();
        request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(result => {
            if (result === 'denied' || result === 'blocked') {
                AlertUtil.showErrorMessage("Permission denied. Please allow Photo Library Permissions from your phone settings");
            } else {
                this.chooseFile();
            }
        })
    };


    /**
     * @function chooseFile
     * @description This method is used to choose file from the gallery
     */
    chooseFile = async () => {
        let options = {
            title: 'Update Group Picture',
            allowsEditing: true,
            mediaType: 'photo',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                if (response.error === 'Photo library permissions not granted' || response.error === 'Camera permissions not granted' || response.error === 'Permissions weren\'t granted') {
                    AlertUtil.showErrorMessage(response.error + '. Please go to application settings and allow permissions.');
                }
            } else if (response.customButton) {
                AlertUtil.showErrorMessage(response.customButton);
            } else {
                let source = 'data:' + response.type + ';base64,' + response.data;
                let imageSize = response.fileSize / 1000000;
                if (imageSize >= 10) {
                    AlertUtil.showErrorMessage('Uploaded file size is too large');
                } else {
                    this.setState({
                        imageUploaded: true,
                        profilePicture: source,
                        fileData: {
                            uri: response.uri,
                            name: response.fileName ? response.fileName : 'confidant-health-group-image.jpeg',
                            type: response.type
                        }
                    });
                }

            }
        });
    };

    /**
     * @function validateCost
     * @description This method is used to validate cost.
     */

    validateCost = () => {
        const costRegex = /^\d+\.\d{0,2}$/;
        let cost = this.state.cost;
        if (cost.startsWith('.')) {
            cost = '0' + cost;
        }
        if (cost.indexOf('.') === -1) {
            cost = cost + '.0';
        }
        if (cost.indexOf('.') === cost.length - 1) {
            return false;
        }
        const costError = !costRegex.test(cost);
        return !costError;
    };


    /**
     * @function updateGroupDetails
     * @description Generic method for updating group details ( CRUD List ) based on action type
     * @params actionType
     */
    updateGroupDetails = (actionType) => {
        const {selectedListType, selectedItem, selectedItemIndex} = this.state;
        const listToBeUpdate = this.state[selectedListType];
        if (actionType === GROUP_MANAGEMENT_DETAILS_ACTIONS.ADD) {
            if (!listToBeUpdate.includes(selectedItem)) {
                listToBeUpdate.push(selectedItem);
            }
        } else {
            if (selectedItemIndex > -1) {
                if (actionType === GROUP_MANAGEMENT_DETAILS_ACTIONS.UPDATE) {
                    listToBeUpdate[selectedItemIndex] = selectedItem;
                } else {
                    listToBeUpdate.splice(selectedItemIndex, 1);
                }
            }
        }
        this.setState({[selectedListType]: listToBeUpdate, confirmModal: false, selectedItem: ''});
        this.hideAddEditModal();
    };

    /**
     * @function renderAddedItems
     * @description Generic method for rendering added items in the list .
     * @params listToBeRender,listType
     */


    renderAddedItems = (list, listType) => {
        let listToBeRender = list;
        if (list && listType === GROUP_MANAGEMENT_LIST_TYPES.MEETINGS) {
            listToBeRender = list.map(value => value.description);
        }
        return (
            <View>
                <View style={styles.groupItemList}>
                    {listToBeRender && listToBeRender.length > 0 && listToBeRender.map((description, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.groupSingleItem}>
                                <Text style={styles.groupContentText}>{description}</Text>
                                <Button
                                    onPress={() => {
                                        this.showModalIOptionsForList(listType, description, index)
                                    }}
                                    transparent
                                    style={styles.moreBtn}>
                                    <Icon style={styles.moreIcon} type={'Feather'}
                                          name="more-horizontal"/>
                                </Button>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <View style={styles.groupBtn}>
                    <PrimaryButton
                        onPress={() => {
                            Keyboard.dismiss();
                            if (listType === 'meetings') {
                                this.showDayTimeDrawer(listType, null, null, false);
                            } else {
                                this.showAddEditModal(listType, false)
                            }
                        }}
                        iconName={'plus'}
                        type={'Feather'}
                        size={30}
                        color={Colors.colors.primaryIcon}
                        bgColor={Colors.colors.primaryColorBG}
                        textColor={Colors.colors.primaryIcon}
                        text={`New ${this.getTypeText(listType)}`}
                    />
                </View>
            </View>
        )
    }


    /**
     * @function getTypeText
     * @description This method is used to get type text based on selected item .
     * @params selectedListType
     */
    getTypeText = (selectedListType) => {
        switch (selectedListType) {
            case 'groupRules' :
                return 'group rule'
            case 'whoCanBenefits' :
                return 'group benefit'
            case 'tags' :
                return 'group tag'
            case 'meetings':
                return 'meeting time'
            default :
                return ''
        }
    }


    /**
     * @function renderSingleToggle
     * @description Generic method is used to render single toggle item
     * @params fieldName
     */
    renderSingleToggle = (fieldName) => {
        return (
            <View>
                <ToggleSwitch
                    testId={`${fieldName}-toggle`}
                    switchOn={this.state[fieldName]}
                    backgroundColorOn={Colors.colors.mainPink}
                    onPress={() => {
                        this.setState({[fieldName]: !this.state[fieldName]})
                    }}
                />
            </View>
        )
    }


    /**
     * @function renderToggleList
     * @description This method is used to render toggle items like ( donation , anonymous , contribution )
     */
    renderToggleList = () => {
        return (
            <View>
                {TOGGLE_LIST && TOGGLE_LIST.map((eachToggle, index) => {
                    return (
                        <View key={index} style={styles.singleToggle}>
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleTitle}>{eachToggle.title}</Text>
                                <Text style={styles.toggleDes}>{eachToggle.description}</Text>
                            </View>
                            {this.renderSingleToggle(eachToggle.fieldName)}
                        </View>
                    )
                })}
            </View>
        )
    }

    /**
     * @function validateGroupDetails
     * @description This method is used to validate GroupDetails.
     */

    validateGroupDetails = () => {
        const {name, suggestedAmount, donationsEnabled} = this.state;
        if(!name){
            AlertUtil.showErrorMessage("Invalid group name");
            return false;
        }
        if(donationsEnabled && suggestedAmount < 2 ){
            AlertUtil.showErrorMessage("Suggested amount must be greater than 2");
            return false;
        }
        return true;
    };

    /**
     * @function saveGroup
     * @description This method is used to create/update group .
     */
    saveGroup = async () => {
        if(this.validateGroupDetails()) {
            this.setState({isLoading: true});
            try {
                const {
                    profilePicture, channelUrl, name, groupDescription, suggestedAmount, tagsEnabled,
                    rulesEnabled, whoCanBenefitsEnabled, groupRules, tags, whoCanBenefits,
                    donationsEnabled, groupTypePublic, groupAnonymous, fileData, meetings
                } = this.state;
                const groupParams = {
                    groupName: name?.trim(),
                    channelUrl,
                    imageUrl: profilePicture,
                    groupDescription: groupDescription?.trim(),
                    donationsEnabled, tagsEnabled,
                    rulesEnabled, whoCanBenefitsEnabled, groupTypePublic, groupAnonymous, whoCanBenefits,
                    groupRuleSettings: {
                        description: null,
                        rules: groupRules.map(groupRule => {
                            return {
                                ruleId: null,
                                description: groupRule
                            }
                        })
                    },
                    tags,
                    groupDonationSettings: {
                        description: null,
                        suggestedAmount: donationsEnabled ? Number(suggestedAmount.replace('$', '')) : 0
                    },
                    meetings: meetings.map(meeting => {
                        return {
                            day: meeting.day,
                            meetingStartTime: meeting.meetingStartTime,
                            meetingEndTime: meeting.meetingEndTime
                        }
                    })
                };
                const payload = {group: groupParams};
                payload.file = fileData;
                let groupCall = ProfileService.createGroup;
                if (this.group) {
                    groupCall = ProfileService.updateGroup;
                }
                const groupResponse = await groupCall(payload);
                if (groupResponse.errors) {
                    AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
                    this.setState({isLoading: false});
                } else {
                    const payload = {
                        ...groupParams,
                        ...groupResponse,
                    };
                    this.props.newChatGroupCreated(payload);
                    this.props.fetchConnections();
                    AlertUtil.showSuccessMessage(this.group ? 'Group updated successfully' : 'New chat group created.');
                    this.props.navigation.navigate(Screens.TAB_VIEW);
                }
            } catch (e) {
                console.log({e})
                AlertUtil.showErrorMessage('Whoops! Something went wrong ');
                this.setState({isLoading: false});
            }
        }
    };


    /**
     * @function getMeetingsPopulatedDescription
     * @description Method is used to get description based on start/end time
     * @params selectedMeetingDay , meetingSlot
     */
    getMeetingsPopulatedDescription = (selectedMeetingDay, meetingSlot) => {
        const startMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingStartTime);
        const endMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingEndTime);
        return `Every ${selectedMeetingDay}'s, ${startMilitaryTime.desc} - ${endMilitaryTime.desc}`;
    }

    /**
     * @function saveGroupMeeting
     * @description Method used to perform crud operations for meeting
     * @params actionType
     */
    saveGroupMeeting = (actionType, meetingItem) => {
        const {meetings, selectedItemIndex} = this.state;
        if (actionType === GROUP_MANAGEMENT_DETAILS_ACTIONS.ADD) {
            meetings.push(meetingItem);
        } else {
            if (selectedItemIndex > -1) {
                if (actionType === GROUP_MANAGEMENT_DETAILS_ACTIONS.UPDATE) {
                    meetings[selectedItemIndex] = meetingItem;
                } else {
                    meetings.splice(selectedItemIndex, 1);
                }
            }
        }
        this.setState({
            meetings, confirmModal: false, selectedItem: '',
            selectedMeetingDay: '', meetingSlot: {meetingStartTime: 900, meetingEndTime: 1800}
        });
        this.hideDayTimeDrawer();
    }

    onChangedCost = (cost) => {
        return cost.replace(/^0+/, '');
    };


    render = () => {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {profilePicture, name, groupDescription, suggestedAmount,
            tagsEnabled, rulesEnabled, whoCanBenefitsEnabled, groupRules, tags, whoCanBenefits,
            confirmModal, selectedListType, donationsEnabled, meetings, editValue, selectedMeetingDay,
            meetingSlot, openTimeModal
        } = this.state;
        const selectedTypeText = this.getTypeText(selectedListType);
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <BackButton onPress={this.goBack}/>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title style={styles.headerTitle}>{this.group ? 'Edit' : 'Create'} group</Title>
                    </Body>
                    <Right/>
                </Header>
                <KeyboardAvoidingView
                    style={{flex: 1, bottom: 0}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Content enableResetScrollToCoords={false} contentContainerStyle={{padding: 24}}>
                        <View style={styles.imageBox}>
                            {
                                    <TouchableOpacity
                                        {...addTestID('check-permissions')}
                                        style={styles.imgCircle} onPress={this.checkPermissions}>
                                        <Image
                                            resizeMode={'cover'}
                                            style={styles.groupMainImg}
                                            source={{uri: profilePicture? (profilePicture.includes("data:image")? profilePicture : S3_BUCKET_LINK + profilePicture) : S3_BUCKET_LINK + DEFAULT_GROUP_IMAGE}}/>
                                        <View style={styles.editBox}>
                                            <AwesomeIcons name="pencil" size={15} color="#3fb2fe"/>
                                        </View>
                                    </TouchableOpacity>

                                    /*<TouchableOpacity style={styles.uploadCircle} onPress={this.checkPermissions}>
                                        <EvilIcon color="#3fb2fe" name="image" size={45}/>
                                    </TouchableOpacity>*/
                            }

                            <Button style={styles.editImgBtn} onPress={this.showEditOptions} transparent>
                                <Text style={styles.editImgText} uppercase={false}>Edit group image</Text>
                            </Button>
                        </View>


                        <View style={styles.fieldsWrapper}>
                            <View style={styles.inputWrap}>
                                <StackedInputField
                                    {...addTestID('input-group-name')}
                                    hasFocus={false}
                                    hasError={false}
                                    editable={true}
                                    keyboardType={'default'}
                                    labelText={'Group name'}
                                    value={name}
                                    changeText={(name) => {
                                        this.setState({name})
                                    }}
                                    onFocus={() => {
                                        this.setState({nameFocus: true});
                                    }}
                                    onBlur={() => {
                                        this.setState({nameFocus: false});
                                        Keyboard.dismiss();
                                    }}
                                />
                            </View>
                            <Text style={styles.textAreaTitle}>About group</Text>
                            <CommonTextArea
                                placeHolderText={'Enter group description here'}
                                value={groupDescription}
                                borderColor={Colors.colors.shadowColor}
                                onChangeText={(groupDescription) => {
                                    this.setState({groupDescription})
                                }}
                            />
                        </View>

                        <View style={styles.toggleList}>
                            {this.renderToggleList()}
                            {donationsEnabled && (
                                <View style={[styles.donationAmountView, {...CommonStyles.styles.shadowBox}]}>
                                    <Text style={styles.donationAmountHeading}>Recommended contribution</Text>

                                    <Item style={{ borderBottomWidth: 0 }}>
                                        <Text numberOfLines={1} style={styles.dollarText}>$</Text>

                                        <Input
                                            {...addTestID('cost-input')}
                                            style={styles.inputBox}
                                            value={suggestedAmount}
                                            keyboardType="decimal-pad"
                                            onBlur={() => {
                                                Keyboard.dismiss();
                                                this.validateCost();
                                            }}
                                            onChangeText={cost => {
                                                if (!isNaN(Number(cost))) {
                                                    this.setState({
                                                        suggestedAmount: this.onChangedCost(cost)
                                                    });
                                                }

                                            }}
                                        />
                                    </Item>
                                </View>
                            )}
                        </View>

                        <View style={styles.groupSectionList}>

                            <View style={styles.groupSection}>
                                <View style={styles.groupHead}>
                                    <Text style={styles.groupTitle}>Group rules</Text>
                                    {this.renderSingleToggle("rulesEnabled")}
                                </View>

                                {rulesEnabled && this.renderAddedItems(groupRules, GROUP_MANAGEMENT_LIST_TYPES.GROUP_RULES)}
                            </View>

                            <View style={styles.groupSection}>
                                <View style={styles.groupHead}>
                                    <Text style={styles.groupTitle}>Who can benefit</Text>
                                    {this.renderSingleToggle("whoCanBenefitsEnabled")}
                                </View>

                                {whoCanBenefitsEnabled && this.renderAddedItems(whoCanBenefits, GROUP_MANAGEMENT_LIST_TYPES.WHO_CAN_BENEFITS)}
                            </View>

                            <View style={styles.groupSection}>
                                <View style={styles.groupHead}>
                                    <Text style={styles.groupTitle}>Group Tags</Text>
                                    {this.renderSingleToggle("tagsEnabled")}
                                </View>
                                {tagsEnabled && this.renderAddedItems(tags, GROUP_MANAGEMENT_LIST_TYPES.TAGS)}
                            </View>

                            <View style={styles.groupSection}>
                                <View style={styles.groupHead}>
                                    <Text style={styles.groupTitle}>Group meetings</Text>
                                </View>
                                {this.renderAddedItems(meetings, GROUP_MANAGEMENT_LIST_TYPES.MEETINGS)}
                            </View>

                        </View>
                        <View style={styles.greBtn}>
                            <PrimaryButton
                                disabled={!name}
                                text={'Save group settings'}
                                onPress={() => {
                                    this.saveGroup();
                                }}
                            />
                        </View>
                    </Content>
                </KeyboardAvoidingView>

                {this.state.openTimeModal && (
                    <MeetingSlotSelectionComponent
                        openTimeModal={openTimeModal}
                        selectedMeetingDay={selectedMeetingDay}
                        meetingSlot={meetingSlot}
                        meetings={meetings}
                        editValue={editValue}
                        saveGroupMeeting={this.saveGroupMeeting}
                        hideDayTimeDrawer={this.hideDayTimeDrawer}
                    />
                )}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.hideModalOptionsForList()
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '50%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalListOptions"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <Text style={styles.groupOptionHeader}>{this.state.selectedItem}</Text>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={`Delete ${selectedTypeText}`}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <AntIcons size={22} color={Colors.colors.errorIcon} name="delete"/>
                                }
                                onPress={() => {
                                    this.hideModalOptionsForList();
                                    this.setState({confirmModal: true})
                                }}
                            />
                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={`Edit ${selectedTypeText}`}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="edit-2"/>
                                }
                                onPress={() => {
                                    if (selectedListType === GROUP_MANAGEMENT_LIST_TYPES.MEETINGS) {
                                        this.showDayTimeDrawer(selectedListType, this.state.selectedItem,
                                            this.state.selectedItemIndex, true)
                                    } else {
                                        this.showAddEditModal(null, true)
                                    }
                                }}
                            />
                        </View>
                    </Content>
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.hideAddEditModal()
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: 310
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"addEditModalGroup"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <KeyboardAvoidingView
                        style={{flex: 1, bottom: 0}}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <Content
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}>
                            <Text
                                style={styles.groupOptionHeader}>{`${this.state.editValue ? 'Edit' : 'Add New'} ${selectedTypeText}`}</Text>
                            <View style={{marginTop: 20, marginBottom: 20}}>
                                <Input
                                    {...addTestID('edit')}
                                    numberOfLines={1}
                                    style={styles.groupRuleInput}
                                    value={this.state.selectedItem}
                                    placeholder={`Please add ${selectedTypeText}`}
                                    onChangeText={selectedItem => {
                                        this.setState({selectedItem: selectedItem});
                                    }}
                                />
                            </View>
                            <View style={styles.greBtn}>
                                <PrimaryButton
                                    disabled={!this.state.selectedItem?.trim()}
                                    text={`${this.state.editValue ? 'Edit' : 'Add New'} ${selectedTypeText}`}
                                    onPress={() => {
                                        this.updateGroupDetails(this.state.editValue ? GROUP_MANAGEMENT_DETAILS_ACTIONS.UPDATE : GROUP_MANAGEMENT_DETAILS_ACTIONS.ADD);
                                    }}
                                />
                            </View>
                        </Content>
                    </KeyboardAvoidingView>
                </Modal>


                {/*Image edit drawer*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.hideEditOptions()
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '30%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalEditOptions"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={'Delete group image'}
                                    iconBackground={Colors.colors.white}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <AntIcons size={22} color={Colors.colors.errorIcon} name="delete"/>
                                    }
                                    onPress={() => {
                                        this.deleteGroupImage()
                                    }}
                                />
                            </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Upload new image'}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="upload-cloud"/>
                                }
                                onPress={() => {
                                    this.checkPermissions()
                                }}
                            />
                        </View>
                    </Content>
                </Modal>

                <Overlay
                    containerStyle={styles.confirmOverlay}
                    childrenWrapperStyle={styles.confirmWrapper}
                    visible={confirmModal}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.confirmHeader}>
                            Are you sure you want to remove this {selectedTypeText}?
                        </Text>
                        <View style={styles.confirmBtns}>
                            <Button style={{...styles.outlineBtn, flex: 1 }}
                                    onPress={() => {
                                        this.updateGroupDetails(GROUP_MANAGEMENT_DETAILS_ACTIONS.DELETE)
                                    }}
                            >
                                <Text style={styles.outlineText}>Yes, Remove</Text>
                            </Button>
                            <View style={styles.noBtn}>
                                <PrimaryButton
                                    onPress={() => {
                                        this.setState({confirmModal: false})
                                    }}
                                    text="No"
                                />
                            </View>
                        </View>
                    </View>

                </Overlay>

            </Container>
        );
    };
}

const styles = StyleSheet.create({
    inputBox: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.inputBox,
        color: Colors.colors.highContrast,
        height: Platform.OS === 'ios' ? 34 : 60,
        textAlign: 'center',
        flex: 0,
        maxWidth: 130,
        marginTop: Platform.OS === 'ios' ? -4 : 6
    },
    header: {
        paddingTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
        elevation: 0,
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 0,
        paddingLeft: 0
    },
    headerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast
    },
    imageBox: {
        alignItems: 'center',
        marginBottom: 24
    },
    groupMainImg: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 0.5
    },
    editImgBtn: {},
    editImgText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryText,
        textAlign: 'center'
    },
    fieldsWrapper: {},
    inputWrap: {},
    textAreaTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 12,
        marginTop: 40
    },
    toggleList: {
        marginTop: 24
    },
    singleToggle: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 16
    },
    toggleContent: {
        flex: 1,
        paddingRight: 16
    },
    toggleTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    toggleDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    },
    donationAmountView: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 0.5,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 32,
        borderRadius: 8,
        // height: 64
    },
    donationAmountHeading: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    donationAmountNumber: {
        ...TextStyles.mediaTexts.bodyTextL,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 34,
        // height: 40
        width:23
    },
    groupSectionList: {
        paddingBottom: 30
    },
    groupSection: {
        marginBottom: 24
    },
    groupHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    groupTitle: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast
    },
    groupItemList: {},
    groupSingleItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingRight: 16
    },
    groupContentText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        flex: 1,
        paddingRight: 10
    },
    moreBtn: {
        marginRight: 0,
        paddingRight: 0,
        paddingLeft: 0
    },
    moreIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30
    },
    groupBtn: {},
    groupOptionHeader: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 32
    },
    singleOption: {
        marginBottom: 16
    },
    monthWrapper: {
        flexDirection: 'row',
        marginBottom: 40
    },
    monthSlide: {
        marginRight: 24
    },
    currentMonthText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.secondaryText
    },
    monthText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.mainPink20
    },
    pickers: {
        marginBottom: 16
    },
    pickerSection: {
        marginBottom: 24
    },
    pickerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 16,
        textTransform: 'uppercase'
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 8,
        overflow: 'hidden',
        height: Platform.OS === 'ios' ? 120 : 50
    },
    pickerStyle: {
        backgroundColor: '#fff',
        width: 322,
        alignSelf: 'center',
        height: 180,
        fontSize: 15,
        marginTop: -50
    },
    pickerBtn: {},
    pickerBtnText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        fontStyle: 'italic'
    },
    groupRuleInput: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.inputText,
        color: Colors.colors.highContrast,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: Colors.colors.borderColor,
    },
    greBtn: {
        paddingBottom: isIphoneX() ? 34 : 24
    },
    editBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        position: 'absolute',
        bottom: 15,
        right:30
    },
    uploadCircle: {
        width: 120,
        height: 120,
        borderWidth: 1,
        borderColor: Colors.colors.blue3,
        backgroundColor: '#f7f9ff',
        borderStyle: 'dashed',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    labelDollar: {
        ...TextStyles.mediaTexts.inputLabel,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: Colors.colors.darkBlue,
        ...TextStyles.mediaTexts.bodyTextL,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    confirmWrapper: {
        height: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 40 : 25,
        paddingTop: 36,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 3,
        shadowOffset: {width: 0, height: 10},
        shadowColor: '#f5f5f5',
        shadowOpacity: 0.5,
    },
    outlineBtn: {
        borderColor: Colors.colors.mainPink,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: Colors.colors.whiteColor,
        height: 64,
        justifyContent: 'center',
        elevation: 0,
    },
    outlineText: {
        color: Colors.colors.mainPink,
        ...TextStyles.mediaTexts.overlineTextM,
        ...TextStyles.mediaTexts.manropeBold,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
    },
});

export default connectConnections()(NewEditGroupDetailsScreen);
