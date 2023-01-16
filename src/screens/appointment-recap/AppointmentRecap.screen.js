import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text, View,} from 'react-native';
import {Button, CheckBox, Container, Content, Icon, Input, ListItem, Textarea} from "native-base";
import {addTestID, AlfieLoader, AlertUtil, isIphoneX} from "ch-mobile-shared";
import GradientButton from "../../components/GradientButton";
import AntIcon from "react-native-vector-icons/AntDesign";
import {Screens} from "../../constants/Screens";
import ScheduleService from "../../services/ScheduleService";
import LinearGradient from "react-native-linear-gradient";

export default class AppointmentRecapScreen extends Component<Props>{
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            isLoading: true,
            message: '',
            allPointsShown: false,
            searchQuery: '',
            recapPoints: []
        };
    }

    /**
     * @function getServiceRecapPoints
     * @description This method is used to get service recap points by passing service Id.
     */

    getServiceRecapPoints = async () => {
        try {
            const recapPoints = await ScheduleService.getServiceRecapPoints(this.appointment.serviceId);
            if (recapPoints.errors) {
                AlertUtil.showErrorMessage(recapPoints.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                recapPoints.map((recapPoint,index) => {
                    recapPoint.index = index;
                    recapPoint.checked = false;
                    return recapPoint;
                });
                this.setState({recapPoints, isLoading: false});
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    componentDidMount = async () => {
        await this.getServiceRecapPoints();
    };

    navigateToNextScreen = () => {
        let {message, recapPoints} = this.state;
        recapPoints = recapPoints.filter(recapPoint => recapPoint.checked);
        const recapDetail = {
            message, recapPoints
        };

        this.props.navigation.replace(Screens.INTEREST_IN_OTHER, {
            recapDetail,
            ...this.props.navigation.state.params
        });
    };

    /**
     * @function renderRecapPoint
     * @description This method is used to render recap point label.
     * @param recapPoint & index
     */
    renderRecapPoint = (recapPoint, index) => {
        return (
            <ListItem key={index}
                      onPress={() => {
                          this.updateRecapPointList(recapPoint)
                      }}
                      style={styles.multiList}
            >
                <CheckBox
                    {...addTestID('checkbox - connectionIssues')}
                    style={
                        recapPoint.checked ? styles.multiCheckSelected : styles.multiCheck
                    }
                    color="#3fb2fe"
                    selectedColor="#fff"
                    checked={recapPoint.checked}
                    onPress={() => {
                        this.updateRecapPointList(recapPoint)
                    }}
                />
                <View>
                    <Text
                        style={styles.checkBoxHeader}>
                        {recapPoint.label}
                    </Text>
                </View>
            </ListItem>
        )
    };


    /**
     * @function updateRecapPointList
     * @description This method is used to update recap point checkbox value.
     * @param selectedRecapPoint
     */
    updateRecapPointList = (selectedRecapPoint) => {
        let {recapPoints} = this.state;
        recapPoints.map(recapPoint => {
            if (recapPoint.index === selectedRecapPoint.index) {
                recapPoint.checked = !recapPoint.checked;
            }
            return recapPoint;
        });
        this.setState({recapPoints});
    };


    /**
     * @function toggleMore
     * @description Show more items from the list(By default we are showing 4 items).
     */
    toggleMore = () => {
        const {allPointsShown} = this.state;
        this.setState({
            allPointsShown: !allPointsShown
        })
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>
        }
        let {recapPoints, allPointsShown, searchQuery} = this.state;

        const isSearching = searchQuery.length > 0;
        if (isSearching) {
            recapPoints = recapPoints.filter(recapPoint => {
                return recapPoint.label
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase().trim())
            })
        } else if (!allPointsShown) {
            recapPoints = recapPoints.slice(0, 4);
        }
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
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                        </View>
                        <Text style={styles.title}>Appointment Recap</Text>
                        <Text style={styles.subtitle}>Coaching Session with {this.appointment.participantName}</Text>
                        <View style={styles.searchWrapper}>
                            <Icon
                                {...addTestID('search-icon')}
                                type={'AntDesign'}
                                name="search1"
                                style={styles.searchIcon}
                            />
                            <Input
                                {...addTestID('search-field')}
                                autoFocus={false}
                                placeholder={'Search'}
                                placeholderTextColor="#B3BEC9"
                                placeholderStyle={styles.editLabel}
                                value={this.state.searchQuery}
                                onChangeText={searchQuery => {
                                    this.setState({searchQuery});
                                }}
                                style={styles.searchField}
                            />
                        </View>

                        {recapPoints.map((recapPoint, index) => {
                            return this.renderRecapPoint(recapPoint, index);
                        })}

                        {!isSearching && this.state.recapPoints && this.state.recapPoints.length>0 && (
                            <ListItem
                                onPress={this.toggleMore}
                                style={styles.visibilityItem}
                            >
                                <Button transparent onPress={this.toggleMore}>
                                    <AntIcon style={styles.visibilityIcon}
                                             {...addTestID(!allPointsShown ? 'sf-btn-plus' : 'sf-btn-minus')}
                                             name={!allPointsShown ? 'plus' : 'minus'}
                                             size={32}/>
                                    <Text
                                        style={styles.visibilityText}>{!allPointsShown ? "Show More" : "Show Less"}</Text>
                                </Button>
                            </ListItem>
                        )}

                        <View style={styles.textareaWrapper}>
                            <Text style={styles.textareaLabel}>Message for patient</Text>
                            <Textarea
                                {...addTestID('input-qualtiy-feedback')}
                                style={styles.textBox}
                                value={this.state.message}
                                onChangeText={message => {
                                    this.setState({message});
                                }}
                                multiline={true}
                                placeholderTextColor='#b3bec9'
                                rowSpan={3}
                                placeholder="This message will appear when a Member reviews their completed appointment"/>
                        </View>
                    </Content>
                    <View style={styles.btnStyle}>
                        <GradientButton
                            testId="continue"
                            onPress={this.navigateToNextScreen}
                            text="Continue"
                        />
                    </View>
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
    },

    subtitle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        color: '#25345c',
        marginBottom: 30
    },
    searchWrapper: {
        height: 54,
        marginHorizontal: 8,
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(179, 190, 201, 0.3)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2,
        borderRadius: 8,
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40
    },
    searchIcon: {
        width: 22,
        marginRight: 15,
        marginLeft: 20,
        color: '#3fb2fe',
        fontSize: 22,
        transform: [{rotateY: '180deg'}],
    },
    visibilityIcon: {
        width: 28,
        marginRight: 15,
        marginLeft: 20,
        color: '#3fb2fe',
        fontSize: 28,
        // transform: [{rotateZ: '190deg'}],
    },
    visibilityText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#3FB2FE',
        fontSize: 15,
        lineHeight: 22.5
    },
    editLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 16,
        color: '#b3bec9',
        opacity: 0.8,
        letterSpacing: 0.5
    },
    searchField: {
        width: '100%',
        color: '#515D7D',
        fontSize: 15,
        lineHeight: 16,
        fontFamily: 'Roboto-Regular',
        fontWeight: '400'
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
        // justifyContent: 'space-between',
        borderBottomWidth: 0,
        // backgroundColor: 'rgba(63,178,254, 0.08)',
        marginLeft: 0,
        paddingLeft: 10,
        // paddingTop: 22,
        marginBottom: 8,
        paddingRight: 15
    },
    visibilityItem: {
        borderBottomWidth: 0,
        marginLeft: -4,
        marginVertical: 15
    },
    checkBoxHeader: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 13,
        letterSpacing: 0.28,
        lineHeight: 24,
        color: '#515D7D',
        paddingRight: 10,
        paddingLeft: 16,
        flex: 1
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
    },
    checkBoxDesc: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        lineHeight: 23,
        color: '#515d7d',
        paddingRight: 10,
        paddingLeft: 18,
        flex: 1,
        marginTop: 5
    },
    textareaWrapper: {
        marginBottom: 20,
        paddingRight: 12,
        paddingLeft: 12
    },
    textareaLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.88,
        color: '#25345c',
        fontWeight: '700',
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
        marginHorizontal: 6,

        // borderWidth:1,
        // borderColor:'#EBEBEB',
    },
    btnStyle: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
});
