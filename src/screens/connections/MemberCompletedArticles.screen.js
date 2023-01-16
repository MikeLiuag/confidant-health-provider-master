import React, {Component} from 'react';
import {connectProfile} from '../../redux';
import {FlatList, StatusBar, StyleSheet} from 'react-native';
import {Body, Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {addTestID, AlertUtil, BackButton, Colors, CommonStyles, getHeaderHeight, TextStyles} from 'ch-mobile-shared';
import {LiveEducationCard} from '../../components/LiveEducationCard';
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/Dog_with_Can.json';
import {PrimaryButton} from 'ch-mobile-shared/src/components/PrimaryButton';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import Loader from "../../components/Loader";
import {PreApptHeader} from "../../components/pre-appointment/PreApptHeader.component";

const HEADER_SIZE = getHeaderHeight();
export class MemberCompletedArticles extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const connection = this.props.navigation.getParam('connection', null);
        this.state = {
            isLoading : true,
            selectedCareTeamDetails : null,
            modalOpen: false,
            connection,
            articles: []
        };
    }

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        this.fetchCompletedArticles();
    }


    fetchCompletedArticles = async () => {
        const response = await ProfileService.getCompletedArticlesByMember(this.state.connection.connectionId);
        if (response.errors) {
            AlertUtil.showErrorMessage(groupsData.errors[0].endUserMessage);
            this.setState({
                isLoading: false,
            })
        } else {
            this.setState({
                isLoading: false,
                articles: response
            })
        }
    }

    getEmptyMessages = () => {
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
                <Text style={styles.emptyTextMain}>No read articles</Text>
                <Text style={styles.emptyTextDes}>They haven't read any articles.</Text>

            </View>
        );
    };

    openArticle = (contentSlug)=>{
        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            category: {
                categoryName: 'No Category'
            },
            topic: {
                name: 'No Topic'
            }
        })
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading) {
            return <Loader/>
        }
        const {articles} = this.state;
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <PreApptHeader
                    onPress={this.navigateBack}
                    headerText={'Review education'}
                />
                <Content contentContainerStyle={{ padding: 24 }}>
                    {articles && articles.length > 0 ?
                    <View style={styles.teamWrapper}>
                        <FlatList
                            data={articles}
                            renderItem={({item, index}) =>
                                <LiveEducationCard
                                    entryId={item}
                                    openArticle={this.openArticle}
                                    isCompleted/>
                            }
                            keyExtractor={item => item.id}
                        />
                    </View> : this.getEmptyMessages()
                    }
                </Content>
            </Container>
        );
    }

}
const styles = StyleSheet.create({
    header: {
        paddingTop: 30,
        paddingLeft: 18,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    titleWrap: {
        marginBottom: 16
    },
    memberCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        marginTop: -20
    },
    teamWrapper: {
        marginBottom: 40
    },
    singleTeamItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        marginBottom: 8
    },
    teamUpperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    domainIcon: {

    },
    nextApptWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor:  Colors.colors.mediumContrastBG
    },
    nextApptTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    nextApptDate: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    modalStatus: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    teamImgWrap: {
        width: 48,
        height: 48
    },
    teamImgWrapModal: {
        width: 68,
        height: 68
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    statusDotModal: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 3,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    teamImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    teamImgModal: {
        width: 68,
        height: 68,
        borderRadius: 34
    },
    teamDetails: {
        paddingLeft: 12,
        flex: 1
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoTitleModal: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingLeft: 4
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    infoContentModal: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        paddingLeft: 4
    },
    actionList: {
        marginTop: 24
    },
    singleActionItem: {
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 12,
        marginBottom: 16
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
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    bookBtn: {
        maxWidth: 240,
        alignSelf: 'center'
    },
});
