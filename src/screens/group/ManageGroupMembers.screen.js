import React, {Component} from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import {Container, Text, View, Button, Header, CheckBox, Content, Icon, Left} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    SliderSearch, CommonSegmentHeader,
    SearchFloatingButton,
    TransactionSingleActionItem,
    getHeaderHeight, isIphoneX, addTestID, PrimaryButton, AlertUtil, getAvatar
} from 'ch-mobile-shared';
import Modal from 'react-native-modalbox';
import AntIcons from "react-native-vector-icons/AntDesign";
import FeatherIcons from "react-native-vector-icons/Feather";
import ProfileService from "../../services/ProfileService";
import {Screens} from "../../constants/Screens";
import {connectChat} from "../../redux";
import {AVATAR_COLOR_ARRAY} from "../../constants/CommonConstants";
import Loader from "../../components/Loader";
import Overlay from "react-native-modal-overlay";

const HEADER_SIZE = getHeaderHeight();

const tabs = [
    {title: 'Patients', segmentId: 'patients'},
    {title: 'Providers', segmentId: 'providers'},
];
class ManageGroupMembersScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            channelUrl: navigation.getParam('channelUrl', null),
            androidPickerVisible: false,
            activeSegmentId: null,
            itemSelected: true,
            confirmModal: false,
            selectedConnections: [],
            filterItem: []
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };


    componentDidMount(): void {
        this.getGroupDetails();
    }

    getGroupDetails = async () => {
        try {
            let groupsResponse = await ProfileService.getGroupDetails(this.state.channelUrl);
            if (groupsResponse.errors) {
                AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
            } else {
                if (groupsResponse && groupsResponse.members && groupsResponse.members.length > 0) {
                    groupsResponse.members = groupsResponse.members.map((item, index) => {
                        if (!item.profilePicture && item.userId !== this.props.auth.meta.userId) {
                            item.colorCode = this.findAvatarColorCode(item.userId, index);
                        }
                        return item;
                    });
                }
                let providerMemberList = [] , patientMemberList = [];
                if(groupsResponse.members && groupsResponse.members.length>0){
                    providerMemberList = groupsResponse.members.filter(member => member?.userType === "PRACTITIONER");
                    patientMemberList = groupsResponse.members.filter(member => member?.userType === "PATIENT");
                }

                this.setState({
                    groupMembers: groupsResponse,
                    patientMemberList: patientMemberList,
                    filterPatientMemberList: patientMemberList,
                    providerMemberList: providerMemberList,
                    filterProviderMemberList: providerMemberList,
                    selectedConnections : [],
                    isLoading: false
                });
            }


        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage('Whoops ! something went wrong ! ');
        }

    };

    findAvatarColorCode = (connectionId, index) => {

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length];

    };

    removeMember = async (userId) => {
        this.setState({isLoading: true});
        const response = await ProfileService.removeMember(this.state.channelUrl, userId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({
                isLoading: false,
            });
        } else {
            AlertUtil.showSuccessMessage('Member removed from group');
            this.getGroupDetails();
        }

    };

    viewProfile = () => {
        this.setState({
            modalVisible: false,
        });
        const {selectedItem} = this.state;
        const connection = {
            ...selectedItem,
            connectionId: selectedItem.userId
        }
        if (selectedItem.userType === 'PRACTITIONER' || selectedItem.userType === 'MATCH_MAKER') {
            this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
                providerId: selectedItem?.userId,
                type: selectedItem?.userType,
            });
        } else if (selectedItem.userType === 'PATIENT') {
            this.props.navigation.navigate(Screens.MEMBER_EMR_DETAILS_SCREEN, {
                connection: connection,
                channelUrl: this.state.channelUrl
            })
        }
    };

    getMembersList = () => {
        const existingMembers = [
            ...this.state.groupMembers.members.map(member => member.userId),
            ...this.state.groupMembers.pendingMembers.map(member => member.userId),
        ];
        let activeConnections = this.props.connections.activeConnections.filter(connection => connection.type !== 'CHAT_BOT'
            && !existingMembers.includes(connection.connectionId)
            && connection.type !== 'CHAT_GROUP',
        );
        if (activeConnections.length > 0) {
            this.setState({connections: activeConnections, filteredItems: activeConnections});
        } else {
            AlertUtil.showMessage('All connections already added to group', 'Dismiss', 'top', 'warning');
        }
    };

    showMemberOptions = (item) => {
        this.setState({selectedItem: item},()=>{
            this.refs.modalMemberOptions.open()
        });
    };

    hideMemberOptions = () => {
        this.refs.modalMemberOptions.close();
    };

    showAddMemberList = () => {
        this.getMembersList()
        this.refs.modalAddMemberList.open();

    };

    hideAddMemberList = () => {
        this.refs.modalAddMemberList.close();
        this.setState({selectedConnections: []});
    };

    selectConnection = (item)=>{
        let {selectedConnections}= this.state;
        if(selectedConnections.includes(item.connectionId)) {
            selectedConnections = selectedConnections?.filter(conId=>conId!==item.connectionId);
        }else {
            selectedConnections.push(item.connectionId);
        }
        this.setState({selectedConnections});
    };


    addMembersToGroup = async (selectedConnections) => {

        this.setState({isLoading: true});
        const groupParams = {
            channelUrl: this.state.channelUrl,
            selectedConnections,
        };
        const groupResponse = await ProfileService.addGroupMembers(groupParams);
        if (groupResponse.errors) {
            AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
            this.setState({isLoading: false, selectedConnections: []});
        } else {
            AlertUtil.showSuccessMessage('New members added successfully');
            this.setState({isLoading: false, selectedConnections: []});
            this.getGroupDetails();
        }
    };

    propagateMemberList = (result)=>{
        const { activeSegmentId} = this.state;
        if(activeSegmentId === 'patients' ){
            this.setState({filterPatientMemberList:result.patient});
        }else {
            this.setState({filterProviderMemberList:result.provider});
        }
    }

    propagateAddMember = (list) => {
        this.setState({filteredItems: list.members});
    };

    render = () => {
        if(this.state.isLoading){
            return <Loader/>
        }
        const { filterPatientMemberList, filterProviderMemberList,activeSegmentId} = this.state;
        let DATA;
        if(activeSegmentId === 'patients' ){
            DATA = filterPatientMemberList;
        }else {
            DATA = filterProviderMemberList;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    {/*<Left>*/}
                    {/*    <Button*/}
                    {/*        onPress={()=>this.goBack()}*/}
                    {/*        transparent*/}
                    {/*        style={styles.backButton}>*/}
                    {/*        <EntypoIcons size={30} color={Colors.colors.blue2} name="chevron-thin-left"/>*/}
                    {/*    </Button>*/}
                    {/*</Left>*/}
                    <SliderSearch
                        options={{
                            screenTitle: 'Manage group members',
                            searchFieldPlaceholder: 'Search members',
                            isDrawer: false,
                            listItems: {
                                patient: this.state.patientMemberList,
                                provider: this.state.providerMemberList
                            },
                            filter: (listItems, query) => {

                                const patient = listItems.patient.filter(patient =>
                                    patient.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );
                                const provider = listItems.provider.filter(provider =>
                                    provider.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );

                                return {provider: provider, patient: patient};
                            },
                            showBack: true,
                            backClicked: this.goBack
                        }}
                        propagate={this.propagateMemberList}
                    />

                </Header>
                <View style={{paddingHorizontal: 24,
                    ...CommonStyles.styles.headerShadow
                }}>
                    <CommonSegmentHeader
                        segments={tabs}
                        segmentChanged={(segmentId) => {
                            this.setState({activeSegmentId: segmentId});
                        }}
                    />
                </View>
                <Content enableResetScrollToCoords={false} contentContainerStyle={{ paddingHorizontal: 24}}>
                    <FlatList
                        data={DATA}
                        style={styles.memberList}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                // key={index}
                                style={styles.memberSingleItem}>
                                <View style={styles.memberImgWrap}>
                                    {item.profilePicture?
                                        <Image
                                            style={styles.proImage}
                                            resizeMode="cover"
                                            source={{uri: getAvatar(item)}} />
                                        :
                                        <View style={{
                                            ...styles.proBgMain,
                                            backgroundColor: item.colorCode?item.colorCode:AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length]
                                        }}><Text
                                            style={styles.proLetterMain}>{item.name.charAt(0).toUpperCase()}</Text></View>
                                    }

                                        {/*<View style={styles.statusDot}></View>*/}
                                </View>
                                <View style={styles.memberContent}>
                                    <Text style={styles.memberName}>{item.name}</Text>
                                    {/*<Text style={styles.memberRole}>{item.role}</Text>*/}
                                </View>
                                <Button
                                    onPress={() => this.showMemberOptions(item)}
                                    transparent
                                    style={styles.moreBtn}>
                                    <Icon style={styles.moreIcon} type={'Feather'} name="more-horizontal"/>
                                </Button>
                            </TouchableOpacity>}
                    />

                </Content>

                <SearchFloatingButton
                    icon="plus"
                    onPress={() => {
                        this.showAddMemberList();
                    }}
                />

                {/*Member More Options drawer*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.hideMemberOptions}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '45%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalMemberOptions"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.modalMemberInfo}>
                                {this.state.selectedItem?.profilePicture?
                                    <Image
                                        style={styles.proImage}
                                        resizeMode="cover"
                                        source={{uri: getAvatar(this.state.selectedItem)}} />
                                    :
                                    <View style={{
                                        ...styles.proBgMainModal,
                                        backgroundColor: this.state.selectedItem?.colorCode?this.state.selectedItem?.colorCode:AVATAR_COLOR_ARRAY[AVATAR_COLOR_ARRAY.length]
                                    }}><Text
                                        style={styles.proLetterMain}>{this.state.selectedItem?.name.charAt(0).toUpperCase()}</Text></View>
                                }
                            {/*<View style={styles.statusDotModal}></View>*/}

                            <View style={styles.modalMemberContent}>
                                <Text style={styles.modalMemberName}>{this.state.selectedItem?.name}</Text>
                            </View>
                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'View profile'}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                onPress={this.viewProfile}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="user"/>
                                }
                            />
                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Remove from group'}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                onPress={() => {
                                    this.removeMember(this.state.selectedItem.userId);
                                    this.setState({
                                        confirmModal: false,
                                        memberToRemove: null
                                    });
                                }}
                                renderIcon={(size, color) =>
                                    <AntIcons size={22} color={Colors.colors.errorIcon} name="delete"/>
                                }
                            />
                        </View>
                    </Content>
                </Modal>

                {/*Add Group Member drawer*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.hideAddMemberList}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        paddingLeft: 12,
                        paddingRight: 16,
                        maxHeight: '85%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalAddMemberList"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        enableResetScrollToCoords={false}
                        showsVerticalScrollIndicator={false}>
                        <SliderSearch
                            options={{
                                screenTitle: 'Add group members',
                                searchFieldPlaceholder: 'Search Members',
                                listItems: {
                                    members: this.state.connections,
                                },
                                filter: (listItems, query) => {
                                    return {
                                        members: listItems.members.filter(member =>
                                            member.name
                                                .toLowerCase()
                                                .includes(query.toLowerCase().trim()),
                                        ),
                                    };
                                },
                                showBack: this.state.showBack,
                                backClicked: this.backClicked,
                            }}
                            propagate={this.propagateAddMember}
                        />

                        <FlatList
                            data={this.state.filteredItems}
                            style={styles.addMemberList}
                            renderItem={({item}) =>
                                <TouchableOpacity
                                    // key={index}
                                    style={styles.addMemberSingle}
                                    onPress={()=>{this.selectConnection(item)}}
                                >
                                    <View style={styles.memberImgWrap}>
                                        {item?.profilePicture?
                                            <Image
                                                style={styles.proImage}
                                                resizeMode="cover"
                                                source={{uri: getAvatar(item)}} />
                                            :
                                            <View style={{
                                                ...styles.proBgMainModal,
                                                backgroundColor: item?.colorCode?item?.colorCode:AVATAR_COLOR_ARRAY[AVATAR_COLOR_ARRAY.length]
                                            }}><Text
                                                style={styles.proLetterMain}>{item?.name.charAt(0).toUpperCase()}</Text></View>
                                        }
                                        {/*<View style={styles.statusDot}></View>*/}
                                    </View>
                                    <View style={styles.memberContent}>
                                        <Text style={styles.memberName}>{item.name}</Text>
                                        <Text style={styles.memberRole}>{item.type}</Text>
                                    </View>
                                    <View style={styles.checkWrap}>
                                        <CheckBox
                                            style={
                                                this.state.itemSelected ?
                                                    [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck
                                            }
                                            color={Colors.colors.mainBlue}
                                            checked={this.state.selectedConnections?.includes(item.connectionId)}
                                            onPress={()=>{this.selectConnection(item)}}
                                        />
                                    </View>
                                </TouchableOpacity>}
                            // keyExtractor={index => index}
                        />
                    </Content>
                    <View style={styles.greBtn}>
                        <PrimaryButton
                            text={'Add Members'}
                            disabled={this.state.selectedConnections?.length<1}
                            onPress={() => {
                                this.addMembersToGroup(this.state.selectedConnections);
                            }}
                        />
                    </View>
                </Modal>

                <Overlay
                    containerStyle={styles.confirmOverlay}
                    childrenWrapperStyle={styles.confirmWrapper}
                    visible={this.state.confirmModal}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.confirmHeader}>
                            Are you sure you want to remove this member?
                        </Text>
                        <View style={styles.confirmBtns}>
                            <Button
                                {...addTestID('remove-member')}
                                style={{...styles.outlineBtn, flex: 1 }}
                                onPress={() => {
                                    this.props.removeMember(this.state.memberToRemove);
                                    this.setState({
                                        confirmModal: false,
                                        memberToRemove: null
                                    });
                                }}
                            >
                                <Text style={styles.outlineText}>Yes, Remove</Text>
                            </Button>
                            <View style={styles.noBtn}>
                                <PrimaryButton
                                    testId = "no"
                                    onPress={()=>{this.setState({confirmModal: false, memberToRemove: null})}}
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
    header: {
        paddingTop: 15,
        paddingLeft: 14,
        paddingRight: 20,
        elevation: 0,
        height: HEADER_SIZE,
    },
    memberList: {
        paddingBottom: 30
    },
    memberSingleItem: {
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2
    },
    memberImgWrap: {
        width: 48,
        height: 48,
        position: 'relative'
    },
    memberImg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderColor: Colors.colors.borderColor,
        borderWidth: 0.5
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    memberContent: {
        flex: 1,
        paddingHorizontal: 12
    },
    memberName: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast
    },
    memberRole: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast
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
    modalMemberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24
    },
    modalMemberImgWrap: {
        width: 68,
        height: 68,
        position: 'relative'
    },
    modalMemberImg: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderColor: Colors.colors.borderColor,
        borderWidth: 0.5
    },
    statusDotModal: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        //position: 'absolute',
        bottom: 3,
        right: -1
    },
    modalMemberContent: {
        flex: 1,
        paddingHorizontal: 12
    },
    modalMemberName: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast
    },
    modalMemberRole: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast
    },
    singleOption: {
        marginBottom: 16
    },
    addMemberList: {
        paddingTop: 40,
        paddingHorizontal: 8
    },
    addMemberSingle: {
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    checkWrap: {
        width: 34
    },
    multiCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.mainBlue
    },
    greBtn: {
        paddingTop: 16,
        paddingHorizontal: 8,
        paddingBottom: isIphoneX()? 34 : 24
    },
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden'
    },
    proBgMain:{
        width: 48,
        height: 48,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proBgMainModal:{
        width: 48,
        height: 48,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },

    proLetterMain: {
    fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
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
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
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
    backButton: {
        marginLeft: 0,
        paddingLeft: 0,
    },
});

export default connectChat()(ManageGroupMembersScreen);
