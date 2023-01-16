import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, ScrollView } from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    CustomModal,
    AlertUtil, getAvatar, AlfieLoader, valueExists
} from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { ApptListItem } from "../../components/pre-appointment/ApptListItem.component";
import Modal from 'react-native-modalbox';
import {Screens} from '../../constants/Screens';
import {ReadMoreBtn} from "../../components/post-appointment/ReadMoreBtn.component";
import ScheduleService from "../../services/ScheduleService";
import moment from "moment";

export default class PastApptListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.manualView = navigation.getParam('manualView', false);
        this.state = {
            modalVisible: false,
            pastAppointments: [],
            selectedAppointment : null,
            isLoading: true,
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
        this.props.navigation.navigate(Screens.REVIEW_GROUP_LIST_SCREEN, {
            connection : this.connection
        });
    };

    /**
     * @function getPastAppointments
     * @description This method is used to get past appointments for given user.
     */

    getPastAppointments = async () => {
        try {
            const pastAppointments = await ScheduleService.getPastAppointments(this.connection.connectionId);
            if (pastAppointments.errors) {
                AlertUtil.showErrorMessage(pastAppointments.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                if(pastAppointments.length>0) {
                    this.setState({pastAppointments,isLoading: false});
                } else {
                    if(this.manualView) {
                        this.setState({
                            isLoading: false
                        });
                    } else {
                        this.props.navigation.replace(Screens.REVIEW_GROUP_LIST_SCREEN, {
                            connection : this.connection
                        });
                    }

                }


            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    componentDidMount = async ()=> {
        await this.getPastAppointments();
    }

    openDetailView = (data) => {
        this.setState({selectedAppointment: data}, ()=>[ this.refs.modalDetailView.open()]);
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
                    headerText={'Review past appointments'}
                />
                <Content>
                    <View style={styles.apptList}>
                        <FlatList
                            data={this.state.pastAppointments}
                            renderItem={({item, index}) =>
                                <ApptListItem
                                    key={index}
                                    title={item.serviceName}
                                    onPress={() => {
                                        this.openDetailView(item)
                                    }}
                                    providerName={item.providerName}
                                    date={item.completedAt}
                                    providerImage={item.providerImage}
                                    showPastAppointments={true}
                                />
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
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


                {this.state.selectedAppointment &&
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '80%',
                        // bottom: this.state.modalHeightProps.height,
                        // maxHeight: 720
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDetailView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View>
                            <Text
                                style={{...CommonStyles.styles.commonAptHeader}}>{this.state.selectedAppointment.serviceName}</Text>
                            <View style={styles.contentWrapper}>
                                <Image
                                    style={styles.patientImg}
                                    resizeMode={'cover'}
                                    source={{uri: getAvatar({profilePicture: this.state.selectedAppointment.providerImage})}}/>
                                <View style={styles.patientDetails}>
                                    <Text style={styles.infoTitle}>{this.state.selectedAppointment.providerName}</Text>
                                    <Text style={styles.infoContent}>{this.state.selectedAppointment.completedAt ? 'Completed on '+moment.utc(this.state.selectedAppointment.completedAt ).format('MMMM D, YYYY - h:mm a') : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.aptContent}>

                                <Text style={styles.contentHead}>Subjective</Text>
                                <Text style={styles.contentPara}>{this.state.selectedAppointment.subjective || 'No subjective notes provided' }</Text>
                                {/*{valueExists(this.state.selectedAppointment.subjective) } && <ReadMoreBtn/>}*/}

                                <Text style={styles.contentHead}>Objective</Text>
                                <Text style={styles.contentPara}>{this.state.selectedAppointment.objective || 'No objective notes provided'}</Text>
                                {/*{valueExists(this.state.selectedAppointment.objective)} && <ReadMoreBtn/>*}*/}

                                <Text style={styles.contentHead}>Assessment</Text>
                                <Text style={styles.contentPara}>{this.state.selectedAppointment.assessment || 'No assessment notes provided'}</Text>
                               {/* {valueExists(this.state.selectedAppointment.assessment) } && <ReadMoreBtn/>}*/}

                                <Text style={styles.contentHead}>Plan</Text>
                                <Text style={styles.contentPara}>{this.state.selectedAppointment.plan  || 'No plan notes provided'}</Text>
                                {/*{valueExists(this.state.selectedAppointment.plan) } && <ReadMoreBtn/>}*/}
                            </View>

                    </Content>
                </Modal>
                }
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    apptList: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    singleApptEntry: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 8,
        borderRadius: 12
    },
    apptMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 12
    },
    contentWrapper: {
        flexDirection: 'row'
    },
    patientImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    patientDetails: {
        paddingLeft: 12
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    aptContent: {
        paddingTop: 10
    },
    contentHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        marginBottom: 8,
        marginTop: 16
    },
    contentPara: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 8
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    }
});
