import React, {Component} from 'react';
import Loader from "../Loader";
import {connectConnections} from "../../redux";
import {ActivityIndicator, SectionList, StyleSheet, View} from "react-native";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";
import {Text} from "native-base";
import {AlertUtil, getAvatar} from "ch-mobile-shared";
import {FeedItem} from "./FeedItem.component";
import {DEFAULT_AVATAR_COLOR, FIVE_STAR_RATING, ONE_STAR_RATING} from "../../constants/CommonConstants";
import {isCloseToBottom} from "ch-mobile-shared/src/utilities/CommonUtils";

const DEFAULT_PAGE_SIZE = 10;

export class InfiniteFeed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            data: [],
            original: [],
            refreshing: false,
            hasMore: false,
            isLoadingMore: false,
            currentPage: 0,
            selectedActivities: props.selectedActivities
        };
        this.loadDebouncer = false;
    }

    async componentDidMount(): void {

        this.activityFeedInnerRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                if(!this.props.navigateToNext) {
                    this.setState({isLoading: true, currentPage: 0});
                    this.fetchFeed(true);
                }
            }
        );
    }

    componentWillUnmount(): void {
        if (this.activityFeedInnerRefresher) {
            this.activityFeedInnerRefresher.remove();
        }


    }

    search = () => {
        if (this.props.searchQuery !== '') {
            const query = this.props.searchQuery;
            const metaDataList = this.state.original.filter(activityFeed => activityFeed.metaData);
            const searchActivityFeedList = metaDataList.filter(activityFeed => {
                    if (activityFeed.metaData.memberName && activityFeed.metaData.providerName) {
                        if (activityFeed.metaData.memberName.toLowerCase().includes(query.toLowerCase().trim())) {
                            return activityFeed;
                        } else if (activityFeed.metaData.providerName.toLowerCase().includes(query.toLowerCase().trim())) {
                            return activityFeed;
                        }
                    }
                }
            );
            this.setState({
                data: searchActivityFeedList
            })
        } else {
            this.setState({data: this.state.original})
        }
    };


    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if (this.props.type !== prevProps.type) {
            this.setState({isLoading: true, currentPage:0, data: []});
            this.fetchFeed(false);
        } else {
            if (this.props.searchQuery !== prevProps.searchQuery) {
                this.search();
            } else if (JSON.stringify(this.props.selectedActivities) !== JSON.stringify(prevProps.selectedActivities)) {
                //this.fetchFeed(false);
            }
        }

    }


    fetchFeed = async (refresh) => {
        if (refresh) {
            this.setState({refreshing: true, currentPage: 0});
        } else {
            this.setState({
                refreshing: false,
                isLoadingMore: true
            })
        }
        try {
            const data = await this.props.api(refresh ? 0 : this.state.currentPage);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.setState({
                    isLoading: false,
                    isError: true,
                    refreshing: false,
                    hasMore: false,
                    isLoadingMore: false
                });
            } else {
                let refinedData = data;
                if (this.props.dataKey) {
                    refinedData = data[this.props.dataKey];
                }

                this.setState({
                    data: refresh ? refinedData : [...this.state.data,...refinedData],
                    original: refresh ? refinedData : [...this.state.data,...refinedData],
                    currentPage: refresh ? 0 : this.state.currentPage,
                    hasMore: this.props.infinite && this.props.type === 'ACTIVITY'
                        && !(refinedData.length < DEFAULT_PAGE_SIZE) && this.state.currentPage !== data.totalPages,
                    refreshing: false,
                    isLoading: false,
                    isError: false,
                    isLoadingMore: false,
                });
            }
        } catch (e) {
            console.log(e);
            //AlertUtil.showErrorMessage("Unable to retrieve activity feed");
            this.setState({isLoading: false, data: [], refreshing: false});
        }
        setTimeout(() => {
            this.loadDebouncer = false;
        }, 1000);

    };

    emptyState = () => {
        let emptyStateMsg = 'You do not have any record right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
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
                <Text style={styles.emptyTextMain}>You Have No Record</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
                <Text style={styles.emptyTextDesLink} onPress={()=>{
                    this.setState({isLoading: true});
                    this.fetchFeed(true);
                }}>Refresh Feed</Text>
            </View>


        );
    };

    findConnectionAvatar = (connectionId) => {
        let avatar = this._findAvatar(connectionId, this.props.connections.activeConnections);
        if (!avatar) {
            avatar = this._findAvatar(connectionId, this.props.connections.pastConnections);
        }
        return avatar ? getAvatar({profilePicture: avatar}) : null
    };

    _findAvatar(connectionId, connections) {
        const filtered = connections.filter(conn => conn.connectionId === connectionId);
        if (filtered.length > 0) {
            return filtered[0].profilePicture;
        }
    }


    findAvatarColorCode = (connectionId) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }

        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR;

    };

    filterByActivityType = () => {
        const {selectedActivities} = this.props;
        let filters = [];
        filters = selectedActivities.map(type => {
            if (type === ONE_STAR_RATING || type === FIVE_STAR_RATING){
                return 'POSTED_PROVIDER_REVIEW';
            }
            return type;
        });

        const filterData =  this.state.data
            .filter(activity => filters.includes(activity.activityType))
            .filter(activity => {
                if (activity.activityType === 'POSTED_PROVIDER_REVIEW') {
                    return selectedActivities.includes(activity.metaData.rating);

                }
                return true;
            });
        return filterData;
    };


    getSections = (filteredData) => {
        const activityFeedSectionList = [];
        if (this.props.type === 'REPORTS') {
            if (filteredData.length > 0) {
                const dailyActivityFeeds = filteredData.filter(item => item.recapPeriod === 'DAILY').sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);
                const weeklyActivityFeeds = filteredData.filter(item => item.recapPeriod === 'WEEKLY').sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);
                if (dailyActivityFeeds.length > 0) {
                    activityFeedSectionList.push({
                        title: 'DAILY',
                        data: dailyActivityFeeds
                    });
                }
                if (weeklyActivityFeeds.length > 0) {
                    activityFeedSectionList.push({
                        title: 'WEEKLY',
                        data: weeklyActivityFeeds
                    });
                }
            }
        } else {
            if (filteredData.length > 0) {
                activityFeedSectionList.push({
                    title: 'Real Time Activity Feed',
                    data: filteredData.filter(item => item.activityType!=="READ_EDUCATION")
                });
            }
        }

        return activityFeedSectionList;
    };

    render() {
        if (this.state.isLoading || this.props.connections.isLoading) {
            return <Loader/>
        }

        let filteredData = this.state.data

        if (!this.props.selectedActivities.includes("ALL_ACTIVITIES") && this.props.selectedActivities.length > 0) {
                filteredData = this.filterByActivityType();
        }
        let activityFeedSectionList = this.getSections(filteredData);

        return (<>
                {activityFeedSectionList.length < 1 ? this.emptyState() :
                    (<>
                            <SectionList
                                sections={activityFeedSectionList}
                                keyExtractor={(item, index) => item + index}
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.fetchFeed(true)
                                }}
                                renderItem={({item, index}) => {
                                    return (
                                        <FeedItem
                                            item={item}
                                            index={index}
                                            findConnectionAvatar={this.findConnectionAvatar}
                                            loadDetailPage={this.props.loadDetailPage}
                                            navigateToNextScreen={this.props.navigateToNextScreen}
                                            findAvatarColorCode={this.findAvatarColorCode}
                                        />
                                    )
                                }}
                                stickySectionHeadersEnabled={false}
                                renderSectionHeader={({section: {title}}) => (
                                     <View
                                         style={styles.headRow}>
                                         <Text style={styles.ListTitle}>{title}</Text>
                                     </View>
                                 )}
                                ListEmptyComponent={this.emptyState}
                                contentContainerStyle={{ padding: 24}}
                                onScroll={({nativeEvent}) => {
                                     if (
                                         isCloseToBottom(nativeEvent) &&
                                         this.state.hasMore &&
                                         this.state.isLoadingMore !== true
                                         && !this.loadDebouncer
                                     ) {
                                         this.loadDebouncer = true;
                                         this.setState({
                                             currentPage: this.state.currentPage + 1,
                                             isLoadingMore: true
                                         }, () => {
                                             this.fetchFeed(false);
                                         });

                                     }
                               }}
                            />
                            {this.state.isLoadingMore && (
                                <View style={styles.loadMoreView}>
                                    <ActivityIndicator/>
                                </View>

                            )}
                        </>
                    )}
            </>
        );


    }

}

const styles = StyleSheet.create({
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 30,
        paddingLeft: 20
    },
    emptyTextMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 15,
        marginBottom: 20
    },
    emptyTextDes: {
        color: '#969FA8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
    emptyTextDesLink: {
        color: '#4986a8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        marginTop:20,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
    headRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        height: 40,
        paddingRight: 16,
        paddingLeft: 16,
        backgroundColor: '#f7f9ff',
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5
    },
    ListTitle: {
        fontFamily: 'Roboto-Bold',
        color: '#515d7d',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    loadMoreView: {
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
export default connectConnections()(InfiniteFeed);
