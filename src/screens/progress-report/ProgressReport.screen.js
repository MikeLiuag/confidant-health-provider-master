import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import ProfileService from "../../services/ProfileService";
import {ProgressReportComponent} from 'ch-mobile-shared';
import {connectConnections} from "../../redux";
import {Screens} from "../../constants/Screens";
import {ContentfulClient} from 'ch-mobile-shared';
class ProgressReportScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const connection = navigation.getParam('connection', null);
        connection.fullName = connection.name;
        this.state = {
            isLoading: true,
            isError: false,
            hasAccess: true,
            outcomeCompleted: {},
            riskTags: {},
            connection: connection,
            assignedContent: {totalCount: 0, assignedContent: []},
            isMatchmakerView : this.props.profile.profile.matchmaker ? this.props.profile.profile.matchmaker : null
        };
        this.screenWillFocusListener = null;
    }

    componentWillUnmount(): void {
        if (this.screenWillFocusListener) {
            this.screenWillFocusListener.remove();
        }
    }

    loadConnectionScreen = () => {
        this.props.navigation.navigate(Screens.SUGGEST_SECOND_CONNECTION_SCREEN, {
            selectedConnection: this.state.connection,
        });

    }


    updateContentTitles = async (contentActivityList) => {
        return Promise.all(contentActivityList.map(activity => {
            return this.getContentTitle(activity).then(title => {
                activity.referenceText = title;
            });
        }));
    };

    getContentTitle = (activity) => {
        const slugContent = activity.referenceText;
        let params = {
            'content_type': 'educationalContent',
            'sys.id': slugContent,
        };
        return ContentfulClient.getEntries(params).then(entries => {
            if (entries && entries.total > 0) {
                return  entries.items[0].fields.title;
            }
        });
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if(prevProps.connections && prevProps.connections.activeConnections) {
            const isConnectedBefore = prevProps.connections.activeConnections.filter((contact) => {
                return contact.connectionId === this.state.connection.userId;
            }).length > 0;
            const isConnectedNow = this.props.connections.activeConnections.filter((contact) => {
                return contact.connectionId === this.state.connection.userId;
            }).length > 0;
            if(isConnectedBefore !== isConnectedNow) {
                console.log('Connection status changed. Refreshing');
                this.fetchUserActivities();
            }
        }

    }

    async componentWillMount(): void {
        // this.getContentAssignedByMe();
        this.fetchUserActivities();
    }

    fetchUserActivities = async () =>{
        try {
            const data: any = await ProfileService.getUserActivity(this.state.connection.userId);
            if (data.errors) {
                console.log(data.errors[0]);
                let hasAccess = true;
                if(data.errors[0].errorCode==='FORBIDDEN') {
                    hasAccess = false;
                }
                this.setState({
                    isLoading: false,
                    hasAccess,
                    isError: data.errors[0]
                });
            } else {
                const contentActivities =  data.recentActivities.filter(activity => activity.activityType === 'CONTENT');
                if (contentActivities && contentActivities.length > 0) {
                    console.log('updating content titles...');
                    await this.updateContentTitles(contentActivities);
                }

                this.setState({
                    isLoading: false,
                    isError: false,
                    hasAccess: true,
                    totalActivitiesCount: data.totalRecentActivities,
                    recentActivities: data.recentActivities ? data.recentActivities : '',
                    outcomeCompleted: data.outcomeCompleted ? data.outcomeCompleted : '',
                    riskTags: data.riskTags ? data.riskTags : ''

                });

            }
        } catch (e) {

            console.log(e);
            this.setState({isLoading: false, isError: true});
        }
    };

    getContentAssignedByMe = async () => {
        const response = await ProfileService.getContentAssignedByMe(this.state.connection.connectionId, 0, 3);
        if (response.errors) {
            console.warn(response.errors[0].endUserMessage);
        } else {
            response.assignedContent = await Promise.all(response.assignedContent.map(async content=>{
                let params = {
                    'content_type': 'educationalContent',
                    'sys.id': content.contentSlug,
                };
                const entries = await ContentfulClient.getEntries(params);
                if (entries && entries.total > 0) {
                    content.title = entries.items[0].fields.title;
                }
                return content;
            }));
            console.log(response);
            this.setState({
                assignedContent: response
            })
        }
        // if (!this.screenWillFocusListener) {
        //     this.screenWillFocusListener = this.props.navigation.addListener(
        //         'willFocus',
        //         payload => {
        //             this.getContentAssignedByMe();
        //         }
        //     );
        // }
    };


     disconnectMember = async () => {
         this.props.disconnect({
             userId: this.state.connection.userId
         });
         this.props.navigation.goBack();
     };

    seeAll = props => {
        this.props.navigation.navigate(
            Screens.PROGRESS_REPORT_SEE_ALL_SCREEN,
            props,
        );
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    assignContent = () => {
        this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN, {
            forAssignment: true,
            connection: this.state.connection,
            fromChat: false,
        });
    };

    dctDetails = (dctId, scorable) => {
        const userId = this.state.connection.userId;
        this.props.navigation.navigate(
            Screens.DCT_REPORT_VIEW_SCREEN,
            {
                dctId,
                userId,
                scorable
            }
        );
    };

    seeAll = props => {

        this.props.navigation.navigate(
            Screens.PROGRESS_REPORT_SEE_ALL_SCREEN,
            {userId: this.state.connection.userId, ...props},
        );
    };

    connect=()=>{
        this.props.connect({
            userId: this.state.connection.connectionId
        });
    };

    requestAppointmentByMatchmaker = () => {
        this.props.navigation.navigate(Screens.APPT_USER_LIST_SCREEN, {
            connection: {
                name: this.state.connection.name,
                userId: this.state.connection.connectionId,
                profilePicture: this.state.connection.avatar,
                referrerScreen: Screens.PROGRESS_REPORT_SCREEN,
                type: this.state.connection.type
            },
        });
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const isConnected = this.props.connections.activeConnections.filter((contact) => {
            return contact.connectionId === this.state.connection.userId;
        }).length > 0;
        const isRequested = this.props.connections.requestedConnections.filter((contact) => {
            return contact.connectionId === this.state.connection.userId;
        }).length > 0;
        return (
            <ProgressReportComponent
                backClicked={this.backClicked}
                profileData={this.state.connection}
                activityData={this.state.recentActivities}
                outcomeData={this.state.outcomeCompleted}
                riskTagsData={this.state.riskTags}
                isConnected={isConnected}
                hasAccess={this.state.hasAccess}
                loadConnectionScreen={this.loadConnectionScreen}
                isRequested={isRequested}
                connect={this.connect}
                seeAll={this.seeAll}
                activityError={this.state.isError}
                isProviderApp={true}
                isLoading={this.state.isLoading || this.props.connections.isLoading}
                assignedContent={this.state.assignedContent}
                assignContent={this.assignContent}
                disconnectProfile={this.disconnectMember}
                dctDetails={this.dctDetails}
                totalActivitiesCount={this.state.totalActivitiesCount}
                requestAppointmentByMatchmaker={this.requestAppointmentByMatchmaker}
                isMatchmakerView={this.props.profile.profile.matchmaker}
            />
        );
    }


}

export default connectConnections()(ProgressReportScreen);
