import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {SectionListComponent} from "ch-mobile-shared";
import {ContentfulClient} from "ch-mobile-shared";
import {Screens} from '../../constants/Screens';
import {connectEducationalContent} from "../../redux";
import Analytics from '@segment/analytics-react-native';

class SectionListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.forAssignment = navigation.getParam('forAssignment', false),
            this.connection = navigation.getParam('connection', false),

            this.state = {
                iconColor: '#3fb2fe',
                isLoading: true,
            };
    }


    async componentDidMount(): void {
        this.screenBlurListener = this.props.navigation.addListener(
            "willBlur",
            payload => {
                if (this.componentRef) {
                    this.componentRef.willBlur();
                }
            },
        );
        let finalQuery = {
            content_type: "category",
            skip: 0,
            include: 2,
            limit: 10,
        };
        let entries = await ContentfulClient.getEntries(finalQuery);
        let categoryItems = [];
        if (entries) {
            await this.convertToCategory(entries);
            this.totalCount = entries?.total;
            this.fetchCount = this.fetchCount + entries?.items?.length;
            while (this.fetchCount <= this.totalCount) {
                finalQuery.skip = finalQuery.limit;
                finalQuery.limit = finalQuery.limit + 10;
                console.log(finalQuery);
                entries = await ContentfulClient.getEntries(finalQuery);
                if (entries) {
                    await this.convertToCategory(entries);
                    this.totalCount = entries?.total;
                    this.fetchCount = this.fetchCount + entries?.items?.length;
                }
            }
        }
    }

    convertToCategory = async (entries) => {
        const categoryItems = entries.items.map(entry => {
            return {
                categoryName: entry.fields.name,
                categoryImage: entry.fields.displayImage ? entry.fields.displayImage.fields.file.url : '',
                categoryTopics: entry.fields.topics,
            };
        });
        if (this.state.categoryItems === null || this.state.categoryItems === undefined) {
            this.setState({categoryItems});
        } else {
            const tempItem = this.state.categoryItems.concat(categoryItems)
            this.setState({categoryItems: tempItem});
        }
        this.setState({isLoading: false});
    };


    navigateToTopicList = (category) => {
        this.props.navigation.navigate(Screens.TOPIC_LIST_SCREEN, {
            category,
            forAssignment: this.props.navigation.getParam('forAssignment', false),
            connection: this.props.navigation.getParam('connection', false),
        });
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNext = (contentSlug, topicName) => {
        let educationOrder = this.state.educationOrder;
        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            topicName,
            educationOrder

        });
    }


    openSelectedEducation = (item, contentSlug, topicName) => {
        this.setState({isLoading: true});
        let educationOrder = [];
        if (this.state.categoryItems) {
            this.state.categoryItems.filter((categoryItem) => {
                if (categoryItem.categoryTopics && categoryItem.categoryTopics.length > 0) {
                    categoryItem.categoryTopics.filter((categoryTopics) => {
                        if (categoryTopics.fields) {
                            if (categoryTopics.fields.educationOrder && categoryTopics.fields.educationOrder.length > 0) {
                                categoryTopics.fields.educationOrder.filter((educationOrderItem) => {
                                    if (educationOrderItem.sys.id === contentSlug) {
                                        educationOrder = categoryTopics.fields.educationOrder;
                                    }
                                });
                            }
                        }
                    });
                }

            });
        }

        this.setState({educationOrder: educationOrder, isLoading: false}, () => {
            this.navigateToNext(contentSlug, topicName);

        })
    };


    render(): React.ReactNode {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <SectionListComponent
                categoryItems={this.state.categoryItems}
                navigateToTopicList={this.navigateToTopicList}
                isLoading={this.state.isLoading}
                isMemberApp={false}
                openSelectedEducation={this.openSelectedEducation}
                backClicked={this.backClicked}
                readArticles={this.props.profile.markAsCompleted}
                showReadInfo={true}
                bookmarked={this.props.profile.bookmarked}
            />
        )
    };
}

export default connectEducationalContent()(SectionListScreen);
