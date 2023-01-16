import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles, CustomModal } from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { CommonReviewItem } from "../../components/pre-appointment/CommonReviewItem.component";
import Modal from 'react-native-modalbox';
import {Screens} from '../../constants/Screens';
import {CommonSegmentHeader} from "../../components/pre-appointment/CommonSegmentHeader.component";

const DATA = [
    {
        title: 'Conflict with school officials',
        type: 'Negative',
        date: 'April 20, 2021',
        typeColor: Colors.colors.errorText,
        preReports: '+ 8 previous reports'
    },
    {
        title: 'Vacation',
        type: 'Positive',
        date: 'March 12, 2021',
        typeColor: Colors.colors.successText
    },
    {
        title: 'Change in child care',
        type: 'Neutral',
        date: 'March 12, 2021',
        typeColor: Colors.colors.primaryText,
        preReports: '+ 8 previous reports'
    }
];

export default class ReviewLifeEventScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
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

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(()=>{
            this.setState({ modalHeightProps: newLayout });
        }, 10)

    }

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.REVIEW_SYMPTOMS_SCREEN);
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review life events'}
                />
                <Content>
                    <View style={styles.eventList}>
                        <FlatList
                            data={DATA}
                            renderItem={({item, index}) =>
                                <CommonReviewItem
                                    key={index}
                                    onPress={() => {
                                        this.refs.modalDetailView.open()
                                    }}
                                    dateText={item.date}
                                    title={item.title}
                                    typeColor={item.typeColor}
                                    typeText={item.type}
                                    previousReports={item.preReports}
                                />
                            }
                            keyExtractor={item => item.id}
                        />


                    </View>
                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId = "continue"
                        onPress={() => {this.navigateToNextScreen();}}
                        text="Continue"
                    />
                </View>


                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
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
                        <View style={styles.topInfo}>
                            <Text style={styles.typeText}>Misreported</Text>
                            <Text style={styles.dateText}>+ 8 previous reports</Text>
                        </View>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>Conflict with school officials</Text>
                        <CommonSegmentHeader
                            firstTabText={'Information'}
                            secondTabText={'History'}
                        />
                        <View>
                            <View style={styles.contentWrapper}>
                                <Image
                                    style={styles.patientImg}
                                    resizeMode={'contain'}
                                    source={require('../../assets/images/p3.png')}  />
                                <View style={styles.patientDetails}>
                                    <Text style={styles.infoTitle}>Patient, self-report</Text>
                                    <Text style={styles.infoContent}>Reported on March 12, 2021</Text>
                                </View>
                            </View>
                            <View style={styles.aptContent}>
                                <Text style={styles.contentHead}>Report notes</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                            </View>
                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    eventList: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    aptContent: {
        paddingTop: 30
    },
    topInfo: {
        flexDirection: 'row',
        marginBottom: 8
    },
    typeText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText
    },
    dateText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        marginLeft: 8
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
    contentHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        marginBottom: 8
    },
    contentPara: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 16
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    }
});
