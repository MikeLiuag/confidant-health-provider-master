import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text, View,} from 'react-native';
import {CheckBox, Container, Content, ListItem, Textarea} from "native-base";
import {addTestID, isIphoneX} from "ch-mobile-shared";
import {AirbnbRating} from "react-native-elements";
import GradientButton from "../../components/GradientButton";
import {Screens} from "../../constants/Screens";
import LinearGradient from "react-native-linear-gradient";
import {SEGMENT_EVENT, SessionQualityIssuesOptions} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";

export default class SessionQualityScreen extends Component<Props>{
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.segmentSessionCompletedPayload = navigation.getParam('segmentSessionCompletedPayload', null);
        this.state = {
            rating: 5,
            qualityFeedback: '',
            connectionIssues: false,
            reminderIssues: false,
            communicationIssues: false,
        };

    }

    componentDidMount = async () =>{
        if(this.segmentSessionCompletedPayload) {
            await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_COMPLETED, this.segmentSessionCompletedPayload);
        }
    }

    ratingDescriptions = {
        5:'Excellent Quality',
        4:'Good Quality',
        3:'Average Quality',
        2:'Bad Quality',
        1:'Poor Quality',
    };

    /**
     * @function ratingCompleted
     * @description This method is used to set rating for the session.
     * @param ratingValue
     */

    ratingCompleted = (rating) => {
        this.setState({rating: rating});
    };

    /**
     * @function renderSessionQualityIssue
     * @description This method is used to render session quality issues list.
     * @param issueType ( connectionIssues,reminderIssues,communicationIssues)
     */

    renderSessionQualityIssue = (issueType) => {
        return (
            <ListItem
                onPress={() => {
                    this.updateIssueCheckbox(issueType)
                }}
                style={styles.multiList}
            >
                <CheckBox
                    {...addTestID('checkbox - connectionIssues')}
                    style={
                        !this.state[issueType] ? styles.multiCheckSelected : styles.multiCheck
                    }
                    color="#3fb2fe"
                    selectedColor="#fff"
                    checked={!this.state[issueType]}
                    onPress={() => {
                        this.updateIssueCheckbox(issueType)
                    }}
                />
                <View>
                    <Text
                        style={styles.checkBoxHeader}>
                        {SessionQualityIssuesOptions[issueType].title}
                    </Text>
                    <Text
                        style={styles.checkBoxDesc}>
                        {SessionQualityIssuesOptions[issueType].description}
                    </Text>
                </View>
            </ListItem>
        )

    };


    /**
     * @function updateIssueCheckbox
     * @description This method is used to update issue (connectionIssues,reminderIssues,communicationIssues) flag.
     * @param issueType ( connectionIssues,reminderIssues,communicationIssues)
     */

    updateIssueCheckbox = (issueType) => {
        const state = this.state;
        state[issueType] = !state[issueType];
        this.setState(state);
    };

    navigateToNextScreen = () => {

        const {rating, qualityFeedback, connectionIssues, reminderIssues, communicationIssues} = this.state;
        const sessionQuality = {
            rating, qualityFeedback, connectionIssues, reminderIssues, communicationIssues,
        };
        this.props.navigation.replace(Screens.APPOINTMENT_RECAP_SCREEN, {
            sessionQuality,
            ...this.props.navigation.state.params
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <Content style={styles.wrapper} contentContainerStyle={{paddingBottom: 40}}>

                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                        </View>
                        <Text style={styles.title}>Rate your call quality</Text>
                        <View style={styles.ratingBox}>
                            <AirbnbRating
                                type='star'
                                showRating={false}
                                ratingCount={5}
                                imageSize={30}
                                size={33}
                                selectedColor='#ffca00'
                                defaultRating={this.state.rating}
                                onFinishRating={this.ratingCompleted}
                            />
                            <Text style={styles.reviewText}>{this.ratingDescriptions[this.state.rating]}</Text>
                        </View>
                        {this.renderSessionQualityIssue('connectionIssues')}
                        {this.renderSessionQualityIssue('reminderIssues')}
                        {this.renderSessionQualityIssue('communicationIssues')}

                        <View style={styles.textareaWrapper}>
                            <Text style={styles.textareaLabel}>Additional feedback and thoughts</Text>
                            <Textarea
                                {...addTestID('input-qualtiy-feedback')}
                                style={styles.textBox}
                                value={this.state.qualityFeedback}
                                onChangeText={qualityFeedback => {
                                    this.setState({qualityFeedback});
                                }}
                                multiline={true}
                                placeholderTextColor='#b3bec9'
                                rowSpan={3}
                                placeholder="Elaborate on any issues related to the technology here"/>
                        </View>
                        <View style={styles.btnStyle}>
                            <GradientButton
                                testId="continue"
                                onPress={() => {
                                    this.navigateToNextScreen();
                                }}
                                text="Continue"
                            />
                        </View>
                    </Content>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingTop: 24,
        paddingHorizontal: 24
    },
    singleSelectedProgress: {
        width: 28,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        marginLeft: 4,
        marginRight: 4
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 40
    },
    singleProgress: {
        width: 28,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4
    },

    title: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        color: '#25345c',
        marginBottom: 30
    },
    ratingBox: {
        marginBottom: 16
    },
    reviewText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.5,
        color: '#25345c',
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 15,
        // marginLeft:14
    },

    multiCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        paddingLeft: 0,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe'
    },
    multiList: {
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingTop: 22,
        paddingBottom: 22,
        paddingRight: 30
    },
    checkBoxHeader: {
        fontFamily: 'Roboto-Bold',
        fontSize: 15,
        letterSpacing: 0.32,
        lineHeight: 16,
        color: '#25345C',
        paddingRight: 10,
        paddingLeft: 16,
        flex: 1,
        fontWeight: '500',
        marginBottom: 8
    },
    additionalTitle: {
        fontFamily: 'Roboto-Bold',
        fontSize: 16,
        letterSpacing: 0.3,
        lineHeight: 23,
        color: '#1e2737',
        paddingRight: 10,
        paddingLeft: 18,
        flex: 1,
        fontWeight: "700"
    },
    checkBoxDesc: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 22,
        color: '#515d7d',
        paddingRight: 10,
        paddingLeft: 16,
        flex: 1
    },
    textareaWrapper: {
        marginBottom: 40,
        paddingLeft: 16,
        paddingRight: 16
    },
    textareaLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.88,
        color: '#25345c',
        fontWeight: '500',
        marginBottom: 5,
        marginHorizontal: 6,
        marginTop: 10
    },
    textBox: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 5,
        paddingBottom: 5,
        height: 'auto',
        paddingLeft: 0,
        maxHeight: 160,
        marginHorizontal: 6
    },
    btnStyle: {
        paddingBottom: isIphoneX() ? 16 : 10
    },
});

