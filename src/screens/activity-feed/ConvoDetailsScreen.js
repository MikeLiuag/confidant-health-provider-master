import React, {Component} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {Button, Left, Right, Body, Container, Content, Header, Text} from 'native-base';
import {AlertUtil, addTestID, getHeaderHeight} from "ch-mobile-shared";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityFeedService from "../../services/ActivityFeedService";
import moment from "moment";
import Loader from "../../components/Loader";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";

const HEADER_SIZE = getHeaderHeight();

export default class ConvoDetailsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.contextId = navigation.getParam('contextId', null);
        this.state = {
            isLoading: true,
            conversationDetail:[]
        };
    }

    getConversationFeedResponses = async ()=>{
        try {
            const data = await ActivityFeedService.getConversationFeedResponses(this.contextId);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            }
            else {
                this.setState({conversationDetail : data, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    }

    async componentDidMount(): void {
        await this.getConversationFeedResponses();
    }

    backClicked = ()=>{
        this.props.navigation.goBack();
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

                <Text
                    {...addTestID('no-record')}
                    style={styles.emptyTextMain}>You Have No Record</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading){
            return <Loader/>
        }

        return(
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', 'rgba(247,249,255,0.5)', 'rgba(247,249,255,0.5)']}
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
                    {this.state.conversationDetail && this.state.conversationDetail.responses && this.state.conversationDetail.responses.length > 0 ?
                    <Content
                        {...addTestID('conversation-detail-screen')}
                    >
                        <View style={styles.userInfoBox}>
                            <View style={styles.largeIcoWrap}>
                                <MaterialIcon name="chat-processing" size={40} color="#4FACFE"/>
                            </View>
                            <Text style={styles.userName}>{this.state.conversationDetail.conversationName}</Text>
                            <Text style={styles.convoCount}>Completed on {moment.utc(this.state.conversationDetail.completedAt).format('MMMM D YYYY, h:mm a')}</Text>
                        </View>
                        <View style={styles.questionList}>
                            {this.state.conversationDetail && this.state.conversationDetail.responses.length > 0 && this.state.conversationDetail.responses.map((response,i) =>
                            <View key={i} style={styles.singleQuestion}>
                                <View style={styles.questionRow}>
                                    <View style={styles.QAIcon}>
                                        <Text style={styles.QALetter}>Q</Text>
                                    </View>
                                    <Text style={styles.questionText}>{response.question}</Text>
                                </View>
                                <View style={styles.questionRow}>
                                    <View style={styles.QAIcon}>
                                        <Text style={styles.QALetter}>A</Text>
                                    </View>
                                    <Text style={styles.answerText}>{response.answer}</Text>
                                </View>
                            </View>
                            )}
                        </View>

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
        height: HEADER_SIZE
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },
    userInfoBox: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1
    },
    largeIcoWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 24,
        backgroundColor: 'rgba(63,178,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    userName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 1,
        color: '#25345c',
        textAlign: 'center',
        marginBottom: 8,
        paddingLeft: 15,
        paddingRight: 15
    },
    convoCount: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.5,
        color: '#515d7d',
        textAlign: 'center',
    },
    questionList: {
        // padding: 24,
        backgroundColor: '#fff',
        flex: 1
    },
    singleQuestion: {
        padding: 24,
        paddingBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.07)'
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18
    },
    QAIcon: {
        width: 40,
        height: 40,
        borderColor: '#ebebeb',
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    QALetter: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 20,
        textAlign: 'center'
    },
    questionText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345c',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.47,
        paddingLeft: 16,
        flex: 1
    },
    answerText: {
        fontFamily: 'Roboto-Regular',
        color: '#646c73',
        fontSize: 14,
        lineHeight: 22,
        paddingLeft: 16,
        flex: 1
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
        marginBottom: 8
    },
    feedDes: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.5
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
