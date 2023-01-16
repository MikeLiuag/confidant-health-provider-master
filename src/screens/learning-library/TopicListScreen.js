import React, {Component} from "react";
import {StatusBar} from "react-native";
import {Screens} from "../../constants/Screens";
import {TopicListComponent, getAvatar} from "ch-mobile-shared";
import {connectEducationalContent} from "../../redux";
import Analytics from '@segment/analytics-react-native';
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";

class TopicListScreen extends Component<Props> {


    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.forAssignment = navigation.getParam('forAssignment', false),
        this.category = navigation.getParam('category', null);
        this.connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: true,
            searchQuery: "",
            topicItems: []
        };
    }

    componentDidUpdate(prevProps, prevState, ss) {
        this.forAssignment = this.props.navigation.getParam('forAssignment', null);
        this.connection = this.props.navigation.getParam('connection', null);
    }

    componentWillUnmount() {
        if (this.screenBlurListener) {
            this.screenBlurListener.remove();
            this.screenBlurListener = null;
        }
    }

    async componentDidMount(): void {
        this.screenBlurListener = this.props.navigation.addListener(
            'willBlur',
            payload => {
                if (this.componentRef) {
                    this.componentRef.willBlur();
                }
            }
        );


        let topicItems = [];
        const entries = this.category.categoryTopics;
        if (entries) {
            topicItems = entries.filter(entry => entry.fields).map(entry => {
                return {
                    topic: entry.fields.name,
                    topicDescription: entry.fields.description,
                    topicIcon: entry.fields.icon ? entry.fields.icon : '',
                    topicImage: entry.fields.coverImage ? entry.fields.coverImage : '',
                    educationOrder: entry.fields.educationOrder ? entry.fields.educationOrder : [],
                    totalArticles: entry.fields.educationOrder ? entry.fields.educationOrder.filter(entry => entry.fields).length : 0,
                };
            });
        }

        await Analytics.track(SEGMENT_EVENT.SECTION_OPENED, {
            userId: this.props.auth?.meta?.userId,
            sectionName: this.category?.categoryName,
            openedAt: moment.utc(Date.now()).format(),
            isProviderApp : true
        });

        this.setState({topicItems, isLoading: false});
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    onTopicSelected = (item) => {
        if (this.forAssignment) {
            this.props.navigation.navigate(Screens.ASSIGNABLE_CONTENT_LIST, {
                topicName: item.topic,
                selectedConnection: {...this.connection, avatar: getAvatar(this.connection)},
                educationOrder:item.educationOrder,
            });
        } else {
            this.props.navigation.navigate(Screens.TOPIC_CONTENT_LIST_SCREEN, {
                topicName: item.topic,
                topicDescription: item.topicDescription,
                topicImage: item.topicImage,
                topicIcon: item.topicIcon,
                educationOrder: item.educationOrder,
                category : this.category
            });
        }


    };


    navigateToNext = (contentSlug, topicName)=>{
        let educationOrder = this.state.educationOrder;
        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            topicName,
            educationOrder

        });
    }

    openSelectedEducation = (item, contentSlug, topicName) => {
        this.setState({isLoading:true});
        let educationOrder = [];
        if(this.state.topicItems) {
            if(this.state.topicItems && this.state.topicItems.length>0) {
                this.state.topicItems.filter((topicItem) => {
                    if (topicItem.educationOrder && topicItem.educationOrder.length > 0) {
                        topicItem.educationOrder.filter((educationOrderItem) => {
                            if (educationOrderItem.sys.id === contentSlug) {
                                educationOrder = topicItem.educationOrder;
                            }
                        });
                    }
                });
            }
        }

        this.setState({educationOrder:educationOrder,isLoading:false} , ()=>{
            this.navigateToNext(contentSlug, topicName);

        })


    };

    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        const filteredItems = this.state.topicItems.filter(item => {
            return (
                this.state.searchQuery.trim() === '' ||
                item.title
                    .toLowerCase()
                    .indexOf(this.state.searchQuery.trim().toLowerCase()) > -1
            );
        });

        return (
            <TopicListComponent
                ref={(ref) => {
                    this.componentRef = ref;
                }}
                filteredItems={filteredItems}
                backClicked={this.backClicked}
                readArticles={0}
                showReadInfo={false}
                isLoading={this.state.isLoading}
                onTopicSelected={this.onTopicSelected}
                openSelectedEducation={this.openSelectedEducation}
                category={this.category}
                bookmarked={this.props.profile.bookmarked}
                fromChat={false}
                categoryName={this.category.categoryName}
            />
        )
    };
}

export default connectEducationalContent()(TopicListScreen);
