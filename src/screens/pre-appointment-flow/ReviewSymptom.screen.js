import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles } from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { CommonReviewItem } from "../../components/pre-appointment/CommonReviewItem.component";
import Modal from 'react-native-modalbox';
import AntIcons from 'react-native-vector-icons/AntDesign';
import {Screens} from '../../constants/Screens';

const DATA = [
    {
        title: 'Feeling Depressed',
        subText: 'Related to Substance Use',
        type: 'High',
        typeColor: Colors.colors.secondaryText,
        interference: 'yes',
        preReports: '+ 8 previous reports'
    },
    {
        title: 'Trouble Concentrating',
        subText: 'Related to Substance Use',
        type: 'Medium',
        typeColor: Colors.colors.warningText,
        interference: 'no',
        preReports: '+ 8 previous reports'
    },
    {
        title: 'Sleeping Too Much',
        subText: 'Related to Substance Use',
        type: 'Resolved',
        typeColor: Colors.colors.successText,
        interference: 'no'
    }
];

export default class ReviewSymptomScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    detailDrawerClose = () => {
        this.refs.modalDetailView.close();
    };

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.SUBSTANCE_USE_LIST_SCREEN);
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
                    headerText={'Review symptoms'}
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
                                    interference={item.interference}
                                    title={item.title}
                                    subText={item.subText}
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
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '80%' }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDetailView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={{...CommonStyles.styles.commonAptHeader}}>Abstinence Lifestyle</Text>
                            <View style={styles.contentWrapper}>
                                <Image
                                    style={styles.patientImg}
                                    resizeMode={'contain'}
                                    source={require('../../assets/images/p3.png')}  />
                                <View style={styles.patientDetails}>
                                    <Text style={styles.infoTitle}>3 sessions attended</Text>
                                    <Text style={styles.infoContent}>Joined on February 20, 2021</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.aptContent}>
                            <Text style={styles.contentHead}>Report notes</Text>
                            <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                            <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                            <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
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
