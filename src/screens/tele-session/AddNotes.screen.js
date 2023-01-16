import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text, View,} from 'react-native';
import {Button, Container, Content, Form, Textarea} from 'native-base';
import GradientButton from '../../components/GradientButton';
import {connectChat} from '../../redux';
import {addTestID, AlertUtil, isIphoneX} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import AppointmentService from "../../services/AppointmentService";
import Loader from "../../components/Loader";

class AddNotesScreen extends Component {
    static navigationOptions = {
        header: null,
    };


    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.state = {
            isLoading:false,
            privateFocus:false,
            publicFocus:false,
            privateFeedback: null,
            publicFeedback: null,
            episode: navigation.getParam('episode', null),
            memberProgress: navigation.getParam('memberProgress', null),
            appointmentId : navigation.getParam('appointmentId', null),
        };

        this.form = {
            privateField: '',
            publicField: '',
            submitBtn: ''
        };

    }

    skipReview = () => {
        if (this.referrerScreen) {
            this.props.navigation.navigate(this.referrerScreen);
        } else {
            this.props.navigation.navigate(Screens.APPOINTMENTS_SCREEN);
        }
    };


    shareProviderFeedback = async () => {
        this.setState({isLoading: true});
        const payload = {
            episode: this.state.episode,
            memberProgress: this.state.memberProgress,
            appointmentId: this.state.appointmentId,
            sessionNotes: this.state.privateFeedback,
            question: this.state.publicFeedback,
        };
        const response = await AppointmentService.saveProviderFeedback(payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            this.skipReview();
            AlertUtil.showSuccessMessage('Your feedback has been saved');
        }
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if(this.state.isLoading){
            return <Loader/>
        }

        return (
            <Container>
                <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                <Content style={styles.wrapper}>
                    <Button
                        {...addTestID('skip-review')}
                        onPress={() => {
                            this.skipReview();
                        }}
                        transparent style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </Button>

                    <Text style={styles.title}>Add Session Notes & Questions</Text>
                    <Form>
                        <View style={styles.textareaWrapper}>
                            <Text style={styles.textareaLabel}>Session Notes:</Text>
                            <Textarea
                                {...addTestID('input-private-feedback')}
                                style={styles.textBox}
                                value={this.state.privateFeedback}
                                onChangeText={privateFeedback => {
                                    this.setState({privateFeedback});
                                }}
                                getRef={field => {
                                    this.state.privateField = field;
                                }}
                                multiline={true}
                                autoFocus={true}
                                onFocus={() => {
                                    this.setState({privateFocus: true});
                                }}
                                placeholderTextColor='#b3bec9'
                                rowSpan={3}
                                placeholder="Session notes for documentor"/>
                        </View>
                        <View style={styles.textareaWrapper}>
                            <Text style={styles.textareaLabel}>Questions:</Text>
                            <Textarea
                                {...addTestID('input-public-feedback')}
                                style={styles.textBox}
                                placeholderTextColor='#b3bec9'
                                onChangeText={publicFeedback => {
                                    this.setState({publicFeedback});
                                }}
                                getRef={field => {
                                    this.state.publicField = field;
                                }}
                                multiline={true}
                                onFocus={() => {
                                    this.setState({publicFocus: true});
                                }}
                                rowSpan={3}
                                placeholder="Questions to managing provider"/>
                        </View>
                    </Form>
                </Content>
                <View style={styles.btnStyle}>
                    <GradientButton
                        testId = "save"
                        onPress={() => {
                            this.shareProviderFeedback()
                        }}
                        ref={btn => {
                            this.form.submitBtn = btn;
                        }}

                        text="Save"
                    />
                </View>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingLeft: 40,
        paddingRight: 24,
        paddingTop: isIphoneX()? 0 : 24,
    },
    skipBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    skipText: {
        color: '#3FB2FE',
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 22.5,
    },
    title: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        color: '#25345c',
        marginTop: 30,
        marginBottom: 40,
    },
    textareaWrapper: {
        marginBottom: 20,
    },
    textareaLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.47,
        color: '#25345c',
        fontWeight: '500',
        marginBottom: 5,
    },
    textBox: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 5,
        paddingBottom:5,
        height: 'auto',
        paddingLeft: 0,
        maxHeight: 160,
        // borderWidth:1,
        // borderColor:'#EBEBEB',
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        marginBottom: 30,
    },
});

export default connectChat()(AddNotesScreen);
