import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    AlertUtil,
    CustomModal,
    AlfieLoader
} from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import {Screens} from '../../constants/Screens';
import AntIcons from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modalbox';
import ProfileService from "../../services/ProfileService";
import moment from "moment";

const width = Dimensions.get("window").width;

export default class ReviewChatbotListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.manualView = navigation.getParam('manualView', false);
        this.state = {
            isLoading:true,
            selectedBot : null,
            chatbotData: [],
            modalHeightProps: {
                height: 0
            }
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    detailDrawerClose = () => {
        this.refs.modalDetailView.close();
        this.setState({
            modalHeightProps: {
                height: 0,

            }
        });
    };


    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.REVIEW_HISTORY_SCREEN,{
            connection : this.connection
        });
    };


    /**
     * @function getBotDetails
     * @description This method is used to get Bot Details for given Conversation.
     */

    getBotDetails = async (item) => {
        try {
            await this.setState({selectedBot : item});
            this.refs.modalDetailView.open();
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };




    /**
     * @function getChatBotListing
     * @description This method is used to get Chatbots List for given user.
     */

    getChatBotListing = async (userId) => {
        try {
            const chatbotData = await ProfileService.getUserChatbotDetails(userId);
            if (chatbotData.errors) {
                AlertUtil.showErrorMessage(chatbotData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({chatbotData, isLoading: false});

            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    componentDidMount = async ()=> {
        await this.getChatBotListing(this.connection.connectionId);
    }


    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(()=>{
            this.setState({ modalHeightProps: newLayout });
        }, 10)

    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }


        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review chatbots'}
                />
                <Content>
                    {this.state.chatbotData &&
                    <View style={styles.botList}>
                        <FlatList
                            data={this.state.chatbotData}
                            renderItem={({item, index}) =>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.getBotDetails(item)
                                        //this.refs.modalDetailView.open()
                                    }}
                                    key={index}
                                    style={styles.singleBotEntry}>
                                    <Text style={styles.botMainTitle}>{item.chatbotName}</Text>
                                    <View style={styles.itemList}>
                                        {item.dcts && item.dcts.length > 0 &&
                                        item.dcts.map(dctData =>
                                            <View style={styles.singleItem}>
                                                <Text style={styles.itemTitle}>{dctData.dctName}</Text>
                                                {
                                                    dctData.completed ? (
                                                        <>
                                                            {!dctData.scorable ?
                                                                <View style={styles.itemIcon}>
                                                                    <AntIcons size={24} color={Colors.colors.successIcon}
                                                                              name="check"/>
                                                                </View>
                                                                :
                                                                <Text style={styles.itemStatus}>{dctData.finalScore}</Text>
                                                            }
                                                        </>
                                                    ) : <View style={styles.itemIcon}>
                                                        <AntIcons size={24} color={Colors.colors.errorIcon}
                                                                  name="closecircleo"/>
                                                    </View>
                                                }


                                            </View>
                                        )
                                        }

                                    </View>

                                    <View>

                                        <ProgressBarAnimated
                                            width={width - 96}
                                            value={item.percentage}
                                            height={8}
                                            borderWidth={1}
                                            borderColor={Colors.colors.highContrastBG}
                                            backgroundColor={item.progressColor}
                                            borderRadius={4}
                                        />

                                        <View style={styles.barText}>
                                            <Text style={styles.completedText}>{item.completed ? (item.completedAt ? 'Completed on '+ moment.utc(item.completedAt).format('MMMM D, YYYY') : 'Completed'): 'Not completed' }</Text>
                                            <Text style={styles.progressValue}>{item.percentage ? item.percentage +'%': null }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.id}
                        />

                    </View>
                    }
                </Content>
                {
                    !this.manualView && (
                        <View
                            {...addTestID('view')}
                            style={styles.greBtn}>
                            <PrimaryButton
                                testId = "continue"
                                onPress={() => {this.navigateToNextScreen();}}
                                text="Continue"
                            />
                        </View>
                    )
                }



                {this.state.selectedBot &&

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: this.state.selectedBot.dcts && this.state.selectedBot.dcts.length > 0 ? '80%' : '40%',
                        // bottom: this.state.modalHeightProps.height,
                        // maxHeight: 720
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDetailView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        // style={{ maxHeight: 600}}
                        showsVerticalScrollIndicator={false}>

                        <Text style={styles.botModalTitle}>{this.state.selectedBot.chatbotName}</Text>
                        <View style={{marginBottom: 20}}>
                            <ProgressBarAnimated
                                width={width - 48}
                                value={this.state.selectedBot.percentage}
                                height={8}
                                borderWidth={1}
                                borderColor={Colors.colors.highContrastBG}
                                backgroundColor={Colors.colors.primaryText}
                                borderRadius={4}
                            />
                            <View style={styles.barText}>
                                <Text style={styles.progressValue}>{this.state.selectedBot.percentage ? this.state.selectedBot.percentage +'%': null}</Text>
                            </View>
                        </View>

                        {this.state.selectedBot.dcts && this.state.selectedBot.dcts.length > 0 &&
                        this.state.selectedBot.dcts.map(dctDetatil =>

                            <View style={styles.botModalSection}>

                                <View style={styles.caretTitleWrap}>
                                    <View style={styles.caretTitle}>
                                        <AntIcons size={16} color={Colors.colors.highContrast} name="caretup"/>
                                        <Text style={styles.modalSectionTitle}>{dctDetatil.dctName}</Text>
                                    </View>
                                    {/*<Text style={styles.modalSectionScore}>{dctDetatil.scorable ? 'Score: '+ dctDetatil.finalScore : null}</Text>*/}
                                </View>
                                <Text style={styles.modalSectionScore}>{dctDetatil.scorable ? 'Score: '+ dctDetatil.finalScore : null}</Text>
                                {dctDetatil.responses && dctDetatil.responses.length > 0 &&
                                dctDetatil.responses.map(response =>

                                    <View>
                                        <Text style={styles.modalQuestion}>{response.question}</Text>
                                        <Text style={styles.modalAnswer}>{response.answer}</Text>
                                    </View>
                                )}

                            </View>

                        )}
                    </Content>
                </Modal>

                }


            </Container>
        );
    }
}

const styles = StyleSheet.create({
    botList: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    singleBotEntry: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 16,
        borderRadius: 12
    },
    botMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 12
    },
    itemList: {

    },
    singleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        marginBottom: 8
    },
    itemTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        flex: 1
    },
    itemStatus: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM
    },
    itemIcon: {
        paddingLeft: 20,
        marginTop: -5
    },
    barText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8
    },
    completedText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    progressValue: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    botModalTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH1,
        marginBottom: 24
    },
    botModalSection: {
        marginTop: 12
    },
    caretTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    caretTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalSectionTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        paddingLeft: 16
    },
    modalSectionScore: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        paddingLeft: 34
    },
    modalQuestion: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 8
    },
    modalAnswer: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        marginBottom: 24
    },
});
