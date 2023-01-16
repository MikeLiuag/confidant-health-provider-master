import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList, TouchableOpacity, Image} from 'react-native';
import {Button, Left, Right, Body, Title, Container, Content, Header, Text} from 'native-base';
import {addTestID, AlertUtil, AlfieLoader, getAvatar, HEADER_NORMAL, HEADER_X, isIphoneX, getHeaderHeight} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityFeedService from "../../services/ActivityFeedService";
import {connectConnections} from "../../redux";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";
import LottieView from "lottie-react-native";
import {DEFAULT_AVATAR_COLOR} from "../../constants/CommonConstants";
import moment from "moment";

const HEADER_SIZE = getHeaderHeight();

class EducationFeedListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.recapPeriod = navigation.getParam('recapPeriod', null);
        this.timestamp = props.navigation.getParam('timestamp', null);
        this.state = {
            educationList: [],
            isLoading: true,
        };
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };

    getEducationActivityDetails = async ()=>{
        try {
            const timestamp = moment.utc(this.timestamp).format('YYYY-MM-DD');
            const recapPeriod = this.recapPeriod;
            const data = await ActivityFeedService.getEducationActivityDetails(timestamp,recapPeriod);
            if (data.errors) {
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.backClicked();
            } else {
                if (data.length > 0) {
                    const profilePicAddedData = data.map(educationData => {
                        const connectionMatchedData = this.findConnection(educationData.memberId);
                        if (connectionMatchedData.length>0) {
                            educationData.profilePic = connectionMatchedData[0].profilePicture?getAvatar(connectionMatchedData[0]):null;
                            if(!educationData.profilePic){
                                educationData.colorCode = connectionMatchedData[0].colorCode?connectionMatchedData[0].colorCode:DEFAULT_AVATAR_COLOR;
                            }
                        }
                        return educationData;
                    });

                    this.setState({educationList: profilePicAddedData, isLoading: false});

                } else {
                    this.setState({isLoading: false});
                }
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }

    }

    async componentDidMount(): void {
        await this.getEducationActivityDetails();
    }

    findConnection = (connectionId)=>{
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId ===connectionId);
        if(connection && connection.length<1){
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId ===connectionId);
        }
        return connection;
    }


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
            return (
                <AlfieLoader/>
            );
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
                        <Body
                            {...addTestID('Education-feed')}
                            style={{ flex: 2}}>
                        <Title style={styles.headerTitle}>Education Feed</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content contentContainerStyle={{paddingBottom: 40}}>
                        {this.state.educationList && this.state.educationList.length > 0 ?
                            <FlatList
                                {...addTestID('Education-list')}
                                data={this.state.educationList}
                                style={styles.feedList}
                                renderItem={({item, index}) =>
                                    <TouchableOpacity
                                        {...addTestID('conversation-details')}
                                        onPress={this.convoDetails}
                                        key={index}
                                        style={styles.singleFeed}>
                                        <View style={styles.imgView}>

                                            {item.profilePic?
                                                <Image
                                                    {...addTestID('profile-pic')}
                                                    source={{uri: item.profilePic}}
                                                       style={styles.feedImg}
                                                       resizeMode={'cover'}/>
                                                :
                                                <View style={{
                                                    ...styles.proBg,
                                                    backgroundColor: item.colorCode
                                                }}><Text
                                                    style={styles.proLetter}>{item.memberName.charAt(0).toUpperCase()}</Text></View>
                                            }

                                        </View>
                                        <View style={styles.textWrapper}>
                                            <Text numberOfLines={2} style={styles.feedTitle}>{item.memberName} read {item.count} education article{item.count>1?'s':''} </Text>
                                        </View>
                                    </TouchableOpacity>}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            this.emptyState()
                        }

                    </Content>
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
    headerTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    feedList: {
    },
    singleFeed: {
        padding: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgView: {},
    feedImg: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    textWrapper: {
        paddingLeft: 16,
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
        fontSize: 14,
        lineHeight: 20,
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
export default connectConnections()(EducationFeedListScreen);
