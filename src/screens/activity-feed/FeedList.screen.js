import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {Container, Header} from 'native-base';
import {HEADER_NORMAL, HEADER_X, isIphoneX, SliderSearch, getHeaderHeight} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import {Screens} from '../../constants/Screens';
import ActivityFeedService from "../../services/ActivityFeedService";
import {connectConnections} from "../../redux";
import {SectionFilters} from "../../components/SectionFilters";
import InfiniteFeed from "../../components/activity-feed/InfiniteFeed.component";
import {ActivityFilter} from "../../components/activity-feed/ActivityFilter.component";
const HEADER_SIZE = getHeaderHeight();
const FILTERS = {
    ACTIVITY: 'ACTIVITY',
    REPORTS: 'REPORTS'
};

class ActivityListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            filterType: FILTERS.ACTIVITY,
            searchQuery: '',
            selectedActivities: [],
            navigateToNext:false,
        };
        this.filterRef = null;
    }


    async componentDidMount(): void {

        this.activityFeedMainRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                if(!this.state.navigateToNext) {
                    this.hideFilter();
                    this.setState({selectedActivities: ['ALL_ACTIVITIES'], navigateToNext: false});
                }
            }
        );
    }

    componentWillUnmount(): void {
        if (this.activityFeedMainRefresher) {
            this.activityFeedMainRefresher.remove();
        }
    }


    hideFilter = () => {

        if(this.filterRef){
            this.filterRef.modalRef.close();
        }
    };

    navigateToNextScreen = (detailPageToLoad, contextId, appointmentData) => {
        this.setState({navigateToNext: true});
        if (detailPageToLoad === 'CONVERSATION_DETAIL') {
            this.props.navigation.navigate(Screens.CONVO_DETAILS_SCREEN, {
                contextId: contextId
            });
        } else if (detailPageToLoad === 'COMPLETED_APPOINTMENT_DETAIL') {

            this.props.navigation.navigate(Screens.SESSION_NOTES_SCREEN, {
                appointmentId: appointmentData.metaData.appointmentId,
                sessionCost: appointmentData.metaData.cost,
            });
        }

    }

    loadDetailPage = (detailPageToLoad, appointmentId, recapPeriod,timestamp,sessionCost) => {
        this.setState({navigateToNext: true});
        if (detailPageToLoad === 'EDUCATION_DETAIL') {
            this.props.navigation.navigate(Screens.EDUCATION_FEED_LIST_SCREEN,
                {
                    recapPeriod: recapPeriod,
                    timestamp:timestamp
                });
        } else if (detailPageToLoad === 'CONVERSATION_DETAIL') {
            this.props.navigation.navigate(Screens.CONVO_FEED_SCREEN,
                {
                    recapPeriod: recapPeriod,
                    timestamp:timestamp,
                });
        } else if (detailPageToLoad === 'COMPLETED_APPOINTMENT_DETAIL') {
            this.props.navigation.navigate(Screens.APPOINTMENT_FEED_LIST_SCREEN, {
                appointmentType: 'completed',
                recapPeriod: recapPeriod,
                timestamp:timestamp,
            });
        } else if (detailPageToLoad === 'SCHEDULED_APPOINTMENT_DETAIL') {
            this.props.navigation.navigate(Screens.APPOINTMENT_FEED_LIST_SCREEN, {
                appointmentType: 'scheduled',
                recapPeriod: recapPeriod,
                timestamp:timestamp,
            });
        } else if (detailPageToLoad === 'SESSION_NOTES_DETAIL' || detailPageToLoad === 'ASKED_QUESTION_DETAIL' || detailPageToLoad === 'REVIEW_DETAIL') {
            this.props.navigation.navigate(Screens.SESSION_NOTES_SCREEN, {
                appointmentId: appointmentId,
                sessionCost: sessionCost,
            });
        }
    };

    showFilter = () => {
        this.filterRef.modalRef.open();
    };


    applyCategoryFilter = (filterType) => {
        this.setState({filterType,selectedActivities:["ALL_ACTIVITIES"],searchQuery:''});

    };

    updateActivityFilter = (filters) => {
        this.setState({selectedActivities: filters});
    };


    render() {
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#F7F9FF', '#F7F9FF']}
                    style={{flex: 1}}
                >
                    <Header noShadow transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <SliderSearch
                            options={{
                                screenTitle: 'Activity Feed',
                                searchFieldPlaceholder: 'Search Feed',
                                listItems: {
                                    activityFeedList: [],
                                },
                                filter: (listItems, query) => {
                                    this.setState({searchQuery: query})
                                    return {searchActivityFeedList: []};
                                },
                                showBack: true,
                                showFilter: true,
                                backClicked: this.showFilter,
                            }}
                            propagate={()=>{}}
                            hideSearchIcon={true}
                        />

                    </Header>
                    <SectionFilters
                        showAll={false}
                        initialFilterType={this.state.filterType}
                        applyFilter={this.applyCategoryFilter}
                        filters={[FILTERS.ACTIVITY, FILTERS.REPORTS]}
                    />


                    <InfiniteFeed
                        infinite={this.state.filterType === FILTERS.ACTIVITY}
                                  type={this.state.filterType}
                                  api={this.state.filterType === FILTERS.ACTIVITY ?
                                      ActivityFeedService.getUserActivityFeed
                                      : ActivityFeedService.getUserActivityFeedRecaps}
                                  dataKey={this.state.filterType === FILTERS.ACTIVITY ? 'realtimeActivityFeedList' : null}
                                  searchQuery={this.state.searchQuery}
                                  loadDetailPage={this.loadDetailPage}
                                  navigateToNextScreen={this.navigateToNextScreen}
                                  selectedActivities={this.state.selectedActivities}
                                  navigation ={this.props.navigation}
                                  navigateToNext={this.state.navigateToNext}
                                  updateActivityFilter={this.updateActivityFilter}

                    />

                    <ActivityFilter
                        ref={ref => {
                            this.filterRef = ref;
                        }}
                        updateActivityFilter={this.updateActivityFilter}
                        filterType = {this.state.filterType}
                        navigation={this.props.navigation}
                        navigateToNext={this.state.navigateToNext}
                        selectedActivities={this.state.selectedActivities}
                    />


                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({

    touchableOpacityStyle: {
        position: "absolute",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        right: 20,
        bottom: isIphoneX() ? 40 : 20
    },
    searchBG: {
        width: 55,
        height: 55,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    filerIcon: {
        // display: 'none',
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: '#CBCCDC'
    },
    header: {
        height: HEADER_SIZE,
        backgroundColor: '#fff',
        paddingLeft: 22,
        elevation: 0
    },
    feedList: {
        padding: 24
    },
    singleFeed: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden'
    },
    innerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imgView: {},
    feedImg: {
        width: 48
    },
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 30,
        overflow: 'hidden'
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 206, 198, 0.1)'
    },
    textWrapper: {
        paddingLeft: 24,
        flex: 2
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    feedTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 4,
        flex: 1,
        paddingRight: 10
    },
    feedDate: {
        fontFamily: 'Roboto-Regular',
        color: '#969FA8',
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 0.2,
        textAlign: 'right'
    },
    feedDes: {
        fontFamily: 'Roboto-Regular',
        color: '#646C73',
        fontSize: 13,
        lineHeight: 20,
        flex: 1,
        paddingRight: 10
    },
    countBold: {
        fontWeight: 'bold',
        fontSize: 11
    },
    modal: {
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: 450
    },
    filterHead: {
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24
    },
    filterText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: 'center'
    },
    filterBody: {
        height: 330
    },
    filterScroll: {
        maxHeight: 300
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    swipeBar: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -35
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 20,
        marginBottom: 24,
        justifyContent: 'center',
        width: 80
    },
    multiList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 24
    },
    multiListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d',
        paddingRight: 10,
        flex: 1
    },
    multiTextSelected: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#3fb2fe'
    },
    multiRadio: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4
    },
    multiRadioSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe'
    },
    noResult: {
        flex: 1,
        justifyContent: 'center'
    },
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
    nextWrapper: {
        justifyContent: "center",
        width: 60,
    },
    nextButton: {
        //width: 13,
        //height: 20,
        padding: 0
    },

    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: 30,
        overflow: 'hidden',

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },

});


export default connectConnections()(ActivityListScreen);
