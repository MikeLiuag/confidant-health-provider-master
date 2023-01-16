import React, {Component} from "react";
import {connectConnections} from "../../redux";
import ProfileService from "../../services/ProfileService";
import {ShareContentComponent, getAvatar, AlertUtil} from "ch-mobile-shared"
import momemt from 'moment'
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";
import moment from "moment";

class ShareContentScreen extends Component<props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.topicName = navigation.getParam('topicName', null);
        this.categoryName = navigation.getParam('categoryName', null);
        const education = navigation.getParam('educationalContentInfo', null);
        const entryId = navigation.getParam('entryId', null);
        this.educationInfo = {
            avatar: education.contentAudio
                ? require('../../assets/images/read-listen-icon.png')
                : require('../../assets/images/reading-icon.png'),
            title: education.title,
            subtitle: education.description,
            duration: education.contentLengthduration,
            slug: entryId

        };
        this.state = {
            isLoading:true,
            activeConnections: [],
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentDidMount = async () => {

        try {
            console.log(this.educationInfo.slug)
            const slugAssignedTo = await ProfileService.getSlugAssignedTo(this.educationInfo.slug);
            if (slugAssignedTo.errors) {
                AlertUtil.showErrorMessage(slugAssignedTo.errors[0].endUserMessage);
            }
            const connections = this.props.connections.activeConnections
                .filter(connection => connection.type === "PATIENT")
                .map(connection => {
                    return {
                        avatar: connection.profilePicture?{uri: getAvatar(connection)}:null,
                        title: connection.name,
                        subtitle: 'Connected Since ' + momemt(connection.lastModified).format('MMM Y'),
                        contentShared: slugAssignedTo.includes(connection.connectionId),
                        connectionId: connection.connectionId,
                        colorCode:connection.colorCode
                    };
                });
            this.setState({activeConnections: connections,isLoading:false})
        } catch (e) {
            console.log(e)
        }
    }


    shareContent = async ({connectionId}) => {
        this.setState({isLoading: true});
        try {
            const requestInfo = {
                connectionId: connectionId,
                contentSlug: this.educationInfo.slug
            }
            const response = await ProfileService.shareContentWithMember(requestInfo)
            if (response.errors) {
                const msg = 'Content is already assigned to the member';
                if (response.errors[0].endUserMessage === msg) {
                    AlertUtil.showErrorMessage(msg);
                    this.updateShareButtons(connectionId);
                    this.setState({isLoading: false});
                } else {
                    AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                    this.setState({isLoading: false});
                }
            }
            else {
                AlertUtil.showSuccessMessage("Content assigned successfully");
                await Analytics.track(SEGMENT_EVENT.RECOMMENDED_EDUCATION_CONTENT,{
                     providerId : this.props?.auth?.meta?.userId,
                     providerName : this.props?.auth?.meta?.nickName,
                     providerRole : this.props?.profile?.profile?.designation,
                     userId : connectionId,
                     sectionName : this.category?.categoryName,
                     topicName : this.topicName,
                     educationName : this.educationInfo?.title,
                     assignedAt : moment.utc(Date.now()).format(),
                     isProviderApp : true
                });
                this.updateShareButtons(connectionId);
                this.setState({isLoading: false});
            }
        }
        catch (e) {
            console.log(e)
        }
    };

    updateShareButtons = (connectionId) => {
        let connectionsUpdated = this.state.activeConnections;
        connectionsUpdated.forEach(connection => {
            if (connectionId === connection.connectionId) {
                connection.contentShared = !connection.contentShared;
            }
        })
        this.setState({activeConnections: connectionsUpdated})
    }


    render() {
        return (
            <ShareContentComponent
                data={this.state.activeConnections}
                shareContent={this.shareContent}
                educationSelected={true}
                goBack={this.backClicked}
                selection={this.educationInfo}
                shareContentWithMembers={true}
                isLoading={this.state.isLoading}
            />
        );
    }

}

export default connectConnections()(ShareContentScreen);
