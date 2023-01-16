import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList, TouchableOpacity, Image} from 'react-native';
import {Button, Left, Right, Body, Container, Content, Header, Text} from 'native-base';
import {DEFAULT_IMAGE, HEADER_NORMAL, HEADER_X, isIphoneX, AlertUtil, addTestID, getHeaderHeight} from "ch-mobile-shared";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from "react-native-linear-gradient";
import {Screens} from '../../constants/Screens';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityFeedService from "../../services/ActivityFeedService";
import Loader from "../../components/Loader";
import moment from "moment";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {connectConnections} from "../../redux";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";

const HEADER_SIZE = getHeaderHeight();

class ConvoFeedListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.memberDetail = navigation.getParam('memberDetail', null);
        this.state = {
            isLoading: true,
            conversationFeedDetail: []
        };
    }


    getMemberConversationFeed = async () => {

        try {
            const recapPeriod = this.memberDetail.period;
            const timestamp = moment.utc(this.memberDetail.timestamp).format('YYYY-MM-DD');
            const userId = this.memberDetail.memberId;

            const data = await ActivityFeedService.getMemberConversationFeed(userId, timestamp, recapPeriod);

            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            } else {
                this.setState({conversationFeedDetail: data, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }

    }

    async componentDidMount(): void {
        await this.getMemberConversationFeed();
    }

    backClicked = () => {
        this.props.navigation.goBack();
    }

    navigateToConvoDetailScreen = (contextId) => {
        this.props.navigation.navigate(Screens.CONVO_DETAILS_SCREEN, {
            contextId
        });
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
            </View>
        );
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#F7F9FF', '#F7F9FF']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <Left>
                            <Button
                                {...addTestID('back')}
                                onPress={this.backClicked}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body/>
                        <Right/>
                    </Header>
                    {this.state.conversationFeedDetail && this.state.conversationFeedDetail.length > 0 ?
                        <Content
                            {...addTestID('conversation-feed-detail-content')}
                        >
                            <View
                                {...addTestID('member-detail')}
                                style={styles.userInfoBox}>
                                {this.memberDetail.profilePic ?
                                    <Image
                                        {...addTestID('member-profile-pic')}
                                        source={{uri: this.memberDetail.profilePic ? this.memberDetail.profilePic : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                        style={styles.userImg}
                                        resizeMode={'cover'}/>
                                    :
                                    <View style={{
                                        ...styles.proBgMain,
                                        backgroundColor: this.memberDetail.colorCode
                                    }}><Text
                                        style={styles.proLetterMain}>{this.memberDetail.name.charAt(0).toUpperCase()}</Text></View>
                                }

                                <Text
                                    {...addTestID('member-name')}
                                    style={styles.userName}>{this.memberDetail.name}</Text>
                                <Text
                                    {...addTestID('completed-conversation')}
                                    style={styles.convoCount}>{this.memberDetail.count} Completed
                                    Conversation{this.memberDetail.count > 1 ? 's' : ''}</Text>
                            </View>

                            <FlatList
                                data={this.state.conversationFeedDetail}
                                style={styles.feedList}
                                renderItem={({item, index}) =>
                                    <TouchableOpacity
                                        {...addTestID('Conversation-detail - ' + (index + 1))}
                                        onPress={() => this.navigateToConvoDetailScreen(item.contextId)}
                                        style={styles.singleFeed}>
                                        <View style={styles.feedIcoWrap}>
                                            <MaterialIcon name="chat-processing" size={20} color="#4FACFE"/>
                                        </View>
                                        <View style={styles.textWrapper}>
                                            <Text
                                                {...addTestID('conversation-name - ' + (index + 1))}
                                                numberOfLines={2}
                                                style={styles.feedTitle}>{item.conversationName}</Text>
                                            <Text
                                                {...addTestID('completed-at - ' + (index + 1))}
                                                style={styles.feedDes}>{moment.utc(item.completedAt).format('MMMM D YYYY, h:mm a')}</Text>
                                        </View>
                                        <View>
                                            <Button
                                                {...addTestID('navigate-convo-detail-screen')}
                                                transparent
                                                onPress={() => this.navigateToConvoDetailScreen(item.contextId)}
                                                style={styles.nextButton}>
                                                <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                            </Button>
                                        </View>
                                    </TouchableOpacity>}
                                keyExtractor={(item, index) => index.toString()}
                            />

                        </Content>
                        :
                        this.emptyState()
                    }
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        backgroundColor: '#fff',
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },
    userInfoBox: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1
    },
    userImg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 24
    },

    proBgMain: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    proLetterMain: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    userName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 1,
        color: '#25345c',
        textAlign: 'center',
        marginBottom: 8
    },
    convoCount: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.5,
        color: '#515d7d',
        textAlign: 'center',
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
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden'
    },
    feedIcoWrap: {
        backgroundColor: 'rgba(63,178,254,0.1)',
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
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
        justifyContent: 'space-between'
    },
    feedTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        color: '#25345C',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.5,
        marginBottom: 8,
        paddingRight: 8
    },
    feedDes: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.5
    },
    nextButton: {
        // width: 13,
        // height: 20,
        padding: 0
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
});


export default connectConnections()(ConvoFeedListScreen);

