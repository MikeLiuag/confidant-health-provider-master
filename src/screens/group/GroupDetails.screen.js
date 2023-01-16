import React, {Component} from 'react';
import {Colors, AlertUtil, GroupDetailComponent, getAvatar} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import {connectChat} from "../../redux";
import {AVATAR_COLOR_ARRAY} from "../../constants/CommonConstants";
import BranchLinksService from "../../services/BranchLinksService";

const BUTTON_OPTIONS = [
    {
        title: 'Edit group',
        iconName: "edit-2",
        iconBackground: Colors.colors.primaryColorBG,
        iconColor: Colors.colors.primaryIcon,
        type: 'EDIT_GROUP',
        isModalOption: true,
        isListOption: true
    },
    {
        title: 'Manage group members',
        iconName: "users",
        iconBackground: Colors.colors.warningBG,
        iconColor: Colors.colors.warningIcon,
        type: 'ADD_MEMBERS_GROUP',
        isModalOption: false,
        isListOption: true
    },
    {
        title: 'Share group',
        iconName: "share",
        iconBackground: Colors.colors.secondaryColorBG,
        iconColor: Colors.colors.secondaryIcon,
        type: 'SHARE_GROUP',
        isModalOption: true,
        isListOption: true
    },
    {
        title: 'Invite Members',
        iconName: "user-plus",
        iconBackground: Colors.colors.warningBG,
        iconColor: Colors.colors.warningIcon,
        type: 'INVITE_GROUP',
        isModalOption: true,
        isListOption: false
    }
]

class GroupDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            channelUrl: navigation.getParam('channelUrl', null),
        };

    }

    componentDidMount(): void {
        this.getGroupDetails();
        this.screenBlurListener = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.getGroupDetails();
            }
        );
    }

    /**
     * @function getGroupDetails
     * @description This method is used to get group details.
     */
    getGroupDetails = async () => {
        try {
            const {channelUrl} = this.state;
            const groupsResponse = await ProfileService.getGroupDetails(channelUrl);
            if (groupsResponse.errors) {
                AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
                this.props.fetchConnections();
                this.props.navigation.navigate(Screens.TAB_VIEW);
            } else {
                if (groupsResponse && groupsResponse.members && groupsResponse.members.length > 0) {
                    groupsResponse.members = groupsResponse.members.map((item, index) => {
                        if (!item.profilePicture && item.userId !== this.props?.auth?.meta?.userId) {
                            item.colorCode = this.findAvatarColorCode(item.userId, index);
                        }
                        return item;
                    });
                }
                let members = groupsResponse?.members;
                const groupOrganizer = groupsResponse?.members.find(member => member.userId === groupsResponse?.groupOrganizer);
                if(groupOrganizer){
                    members = groupsResponse?.members.filter(member => member.userId !== groupOrganizer?.userId)
                }
                this.setState({
                    groupDetails: {
                        ...this.props.navigation.state.params,
                        ...groupsResponse,
                        groupOrganizer: groupOrganizer,
                        members : members,
                        meetings : groupsResponse?.meetings ? groupsResponse?.meetings:[],
                        groupDescription : groupsResponse.groupDescription? groupsResponse.groupDescription?.trim() : null
                    }, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage('Whoops ! something went wrong ! ');
            this.props.fetchConnections();
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }

    };


    /**
     * @function findAvatarColorCode
     * @description This method is used to get avatar color code.
     * @param connectionId,index
     */
    findAvatarColorCode = (connectionId, index) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length];
    }

    /**
     * @function goBack
     * @description This method is used to navigate back.
     */
    goBack = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function navigateToConnectionProfile
     * @description This method is used to navigate to connection Profile.
     */
    navigateToConnectionProfile = (connection) => {
        connection = {
            ...connection,
            connectionId: connection.userId
        }
        if (connection.userType === 'PRACTITIONER' || connection.userType === 'MATCH_MAKER') {
            this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
                providerId: connection.userId,
                type: connection.type,
            });
        } else if (connection.userType === 'PATIENT') {
            this.props.navigation.navigate(Screens.MEMBER_EMR_DETAILS_SCREEN, {
                connection: connection,
                channelUrl: this.state.channelUrl
            })
        }
    };

    /**
     * @function navigateToShareGroupDetails
     * @description This method is used to share group.
     */
    navigateToShareGroupDetails = () => {
        const {channelUrl} = this.state;
        setTimeout(async () => {
            await BranchLinksService.shareGroupLink('facebook', channelUrl);
        }, 500);
    }

    /**
     * @function navigateToEditGroupDetails
     * @description This method is used to navigate to edit group details screen.
     */
    navigateToEditGroupDetails = () => {
        const {groupDetails} = this.state;
        this.props.navigation.navigate(Screens.NEW_EDIT_GROUP_DETAILS_SCREEN, {
            group: groupDetails
        });
    }


    /**
     * @function navigateToInviteGroupDetails
     * @description This method is used to navigate to Manage group members screen.
     */
    navigateToInviteGroupDetails = () => {
        this.props.navigation.navigate(Screens.MANAGE_GROUP_MEMBERS_SCREEN,this.props.navigation.state.params,{
            channelUrl: this.state.channelUrl
        });
    }

    /**
     * @function navigateToManageMembers
     * @description This method is used to navigate to Manage group members screen.
     */
    navigateToManageMembers = () => {
        this.props.navigation.navigate(Screens.MANAGE_GROUP_MEMBERS_SCREEN,this.props.navigation.state.params);
    }

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () => {
        const {groupDetails} = this.state;
        const {connections} = this.props;
        let connection = connections.activeConnections.find(item => item.connectionId === groupDetails.channelUrl);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: {...groupDetails}
            });
        }
    }

    render() {
        const {isLoading,groupDetails} = this.state;
        return (
            <GroupDetailComponent
                isLoading = {isLoading}
                navigateBack = {this.goBack}
                groupDetails = {groupDetails}
                buttonOptions = {BUTTON_OPTIONS}
                navigateToShareGroupDetails = {this.navigateToShareGroupDetails}
                navigateToInviteGroupDetails = {this.navigateToInviteGroupDetails}
                navigateToManageMembers = {this.navigateToManageMembers}
                navigateToConnectionProfile = {this.navigateToConnectionProfile}
                navigateToEditGroupDetails = {this.navigateToEditGroupDetails}
                isProviderApp = {true}
                goToGroupChat = {this.navigateToLiveChat}
            />
        );
    }
}

export default connectChat()(GroupDetailsScreen);
