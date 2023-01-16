import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text, View,} from 'react-native';
import {CheckBox, Container, Content, ListItem} from "native-base";
import {addTestID, isIphoneX} from "ch-mobile-shared";
import GradientButton from "../../components/GradientButton";
import {Screens} from "../../constants/Screens";
import {connectAppointments} from "../../redux/modules/appointments/connectAppointments";
import LinearGradient from "react-native-linear-gradient";
import {NavigationActions, StackActions} from "react-navigation";

class ScheduleNextAppointment extends Component<Props>{
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            nextAppointmentOptions: [
                {title: 'Schedule Now', checked: false},
            ],

        };
    }

    navigateToNextScreen = () => {
        const selectedOption = this.state.nextAppointmentOptions.filter(nextAppointmentOption => nextAppointmentOption.checked);
        if (selectedOption.length > 0) {
            if (selectedOption[0].title === 'Schedule Now') {
                let selectedMember = this.props.connections.activeConnections.filter(connection => connection.type === 'PATIENT' && connection.connectionId === this.appointment.participantId);
                if (selectedMember && selectedMember.length > 0) {
                    selectedMember = selectedMember[0];
                    this.props.navigation.replace(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                        selectedMember
                    });
                }
            } else {
                // TODO Navigate to schedule for late screen .
            }
        } else {
            if(this.referrerScreen) {
                this.props.navigation.replace(this.referrerScreen);
            }else {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: Screens.TAB_VIEW})],
                });
                this.props.navigation.dispatch(resetAction);
           }
        }
    };

    /**
     * @function renderNextAppointmentOption
     * @description This method is used to render next appointment option title.
     * @param option , index
     */
    renderNextAppointmentOption = (nextAppointmentOption, index) => {
        return (
            <ListItem key={index}
                      onPress={() => {
                          this.updateNextAppointmentOptionsList(nextAppointmentOption)
                      }}
                      style={
                          nextAppointmentOption.checked ? styles.multiListSelected : styles.multiList
                      }
            >
                <CheckBox
                    {...addTestID('checkbox - connectionIssues')}
                    style={
                        nextAppointmentOption.checked ? styles.multiCheckSelected : styles.multiCheck
                    }
                    color="#3fb2fe"
                    selectedColor="#fff"
                    checked={nextAppointmentOption.checked}

                    onPress={() => {
                        this.updateNextAppointmentOptionsList(nextAppointmentOption)
                    }}
                />
                <View>
                    <Text
                        style={styles.checkBoxHeader}>
                        {nextAppointmentOption.title}
                    </Text>
                </View>
            </ListItem>
        )
    };

    /**
     * @function updateNextAppointmentOptionsList
     * @description This method is used to update next appointment option checkbox value.
     * @param selectedOption
     */


    updateNextAppointmentOptionsList = (selectedOption) => {
        let {nextAppointmentOptions} = this.state;
        nextAppointmentOptions.map(nextAppointmentOption => {
            if (nextAppointmentOption.title === selectedOption.title) {
                nextAppointmentOption.checked = !nextAppointmentOption.checked;
            } else {
                nextAppointmentOption.checked = false;
            }
            return nextAppointmentOption;
        });
        this.setState({nextAppointmentOptions});
    };

    render() {
        let {nextAppointmentOptions} = this.state;
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <Content style={styles.wrapper}>

                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                        </View>
                        <Text style={styles.title}>Schedule Next Appointment</Text>
                        {
                            nextAppointmentOptions.map((nextAppointmentOption, index) => {
                                return this.renderNextAppointmentOption(nextAppointmentOption, index);
                            })
                        }
                        <View style={styles.btnStyle}>
                            <GradientButton
                                testId="continue"
                                onPress={this.navigateToNextScreen}
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
    title: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        color: '#25345c',
        paddingRight: 20,
        paddingLeft: 20,
        marginBottom: 40
    },
    multiCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ebebeb',
        // borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        width: 24,
        height: 24,
        borderWidth: 1,
        // borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        paddingLeft: 0,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    multiList: {
        marginLeft: 0,
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 24,
        paddingBottom: 24,
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(0, 0, 0, 0.07)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2
    },
    multiListSelected: {
        marginLeft: 0,
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 24,
        paddingBottom: 24,
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 0
    },
    visibilityItem: {
        borderBottomWidth: 0,
        marginLeft: -4,
        marginVertical: 15
    },
    checkBoxHeader: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.32,
        lineHeight: 22,
        color: '#25345C',
        paddingRight: 10,
        paddingLeft: 16,
        flex: 1
    },
    btnStyle: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24
    },
});

export default connectAppointments()(ScheduleNextAppointment);

