import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import moment from "moment";
import {AlertUtil, ShareContentComponent} from 'ch-mobile-shared';
import {connectEducationalContent} from '../../redux';
import ProfileService from "../../services/ProfileService";
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";

class ContentSharingScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.topic = {
            name: navigation.getParam('topicName', null),
            educationOrder: navigation.getParam('educationOrder', null),
        };
        const selectedConnection = navigation.getParam('selectedConnection', null);
        this.selectedConnection = {
            title: selectedConnection.name,
            subtitle: 'Connected since ' + moment(selectedConnection.lastModified).format('MMMM D, Y'),
            avatar: {uri: selectedConnection.avatar},
            connectionId: selectedConnection.connectionId,
            profilePicture: selectedConnection.profilePicture,
            colorCode: !selectedConnection.profilePicture?selectedConnection.colorCode:null,

        };
        this.state = {
            isLoading: false,
            contentList: []
        };
    }

    componentDidMount(): void {
        this.getContentByTopic();
    }

    shareContent = async (content) => {
        this.setState({isLoading: true});
        const response = await ProfileService.shareContentWithMember({
            connectionId: this.selectedConnection.connectionId,
            contentSlug: content.slug
        });
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage('Content assigned successfully');
            await Analytics.track(SEGMENT_EVENT.APP_SHARED,{
                userId : this.props.auth?.meta?.userId,
                screenName: 'ContentSharingScreen',
                isProviderApp : true
            });
            const {contentList} = this.state;
            contentList.forEach(item => {
                if (item.slug === content.slug) {
                    item.contentShared = true;
                }
            });
            this.setState({contentList, isLoading: false});

        }

    };
    getContentByTopic = async () => {
        try {
            this.setState({isLoading: true});
            const contentList = [];
            const entries = this.topic.educationOrder;
            if (entries) {
                entries.filter(entry => entry.fields).forEach(entry => {
                    contentList.push({
                        title: entry.fields.title,
                        subtitle: entry.fields.description,
                        slug: entry.sys.id
                    });
                });
            }
            const response = await ProfileService.getAssignedSlugs(this.selectedConnection.connectionId);
            let assignedSlugs = [];
            if (!response.errors) {
                assignedSlugs = response;
            }
            contentList.map(content => {
                if (assignedSlugs.includes(content.slug)) {
                    content.contentShared = true;
                }
                return content;
            });
            this.setState({
                contentList,
                isLoading: false,
            });
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to get data from contentful');
            this.setState({isLoading: false});
        }
    };

    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ShareContentComponent
                educationSelected={false}
                isLoading={this.state.isLoading}
                shareContent={this.shareContent}
                data={this.state.contentList}
                goBack={this.goBack}
                selection={this.selectedConnection}
            />
        );
    }
}

export default connectEducationalContent()(ContentSharingScreen);
