import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image } from 'react-native';
import {Container, Header, Content, Text, View, Left, Body, Right, Button} from 'native-base';
import {addTestID, getAvatar, isIphoneX, getHeaderHeight, PrimaryButton} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {DEFAULT_AVATAR_COLOR, HEADER_NORMAL, HEADER_X} from "../../constants/CommonConstants";
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";
import AwesomeIcons from "react-native-vector-icons/FontAwesome";
import AntIcon from "react-native-vector-icons/AntDesign";
const HEADER_SIZE = getHeaderHeight();


class ConnectionRequestScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        const selectedConnectionFirst = navigation.getParam('selectedConnectionFirst', null);
        const selectedConnectionSecond = navigation.getParam('selectedConnectionSecond', null);

        this.state = {
            selectCon: false,
            selectedConnectionFirst : selectedConnectionFirst,
            selectedConnectionSecond : selectedConnectionSecond
        };
    }

    backClicked = () => {
        this.props.navigation.navigate(Screens.CONNECTIONS);
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
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
                        <Left/>
                        <Body/>
                        <Right>
                            <Button
                                transparent
                                style={styles.crossButton}
                                onPress={this.backClicked}
                            >
                                <AntIcon name="close" size={25} color="#3fb2fe"/>
                            </Button>
                        </Right>
                    </Header>
                    <Content contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={styles.textBox}>
                            <Text style={styles.conMainText}>
                                Connected Successfully
                            </Text>
                        </View>
                        <View style={styles.suggestionBox}>
                            <View
                                {...addTestID('selected-connection-first')}
                                style={styles.suggest1}>
                                {this.state.selectedConnectionFirst.profilePicture ?
                                    <Image
                                        {...addTestID('suggest-image')}
                                        style={styles.suggestImg}
                                        resizeMode={'cover'}
                                        source={{uri: getAvatar(this.state.selectedConnectionFirst)}}/>
                                    :
                                    <View style={{
                                        ...styles.proBg,
                                        backgroundColor: this.state.selectedConnectionFirst.colorCode?this.state.selectedConnectionFirst.colorCode:DEFAULT_AVATAR_COLOR
                                    }}><Text
                                        style={styles.proLetter}>{this.state.selectedConnectionFirst.name.charAt(0).toUpperCase()}</Text></View>
                                }

                                <Text style={styles.suggestTitle}>{this.state.selectedConnectionFirst.name}</Text>
                                <Text style={styles.suggestSub}>{this.state.selectedConnectionFirst.type ? this.state.selectedConnectionFirst.type : 'N/A'}</Text>
                            </View>
                            <AwesomeIcons
                                style={styles.arrowIcon}
                                name="arrows-h" size={18} color="#b3bec9"/>
                            <View
                                {...addTestID('selected-connection-second')}
                                style={styles.suggest1}>
                                {this.state.selectedConnectionSecond.profilePicture ?
                                    <Image
                                        style={styles.suggestImg}
                                        resizeMode={'cover'}
                                        source={{uri: getAvatar(this.state.selectedConnectionSecond)}}/>
                                    :
                                    <View style={{
                                        ...styles.proBg,
                                        backgroundColor: this.state.selectedConnectionSecond.colorCode?this.state.selectedConnectionSecond.colorCode:DEFAULT_AVATAR_COLOR
                                    }}><Text
                                        style={styles.proLetter}>{this.state.selectedConnectionSecond.name.charAt(0).toUpperCase()}</Text></View>
                                }
                                <Text style={styles.suggestTitle}>{this.state.selectedConnectionSecond.name}</Text>
                                <Text style={styles.suggestSub}>{this.state.selectedConnectionSecond.type ? this.state.selectedConnectionSecond.type : 'N/A' }</Text>
                            </View>
                        </View>
                    </Content>
                    <View style={styles.greBtn}>
                        <PrimaryButton
                            testId = "thanks"
                            onPress={() => {
                                this.props.navigation.navigate(Screens.CHAT_LIST);

                            }}
                            text="Thanks"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
    },
    crossButton: {
        marginRight: 0,
        paddingRight: 12
    },
    textBox: {
        marginTop: 30,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    conMainText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        maxWidth: 200
    },
    suggestionList: {
        padding: 16
    },
    suggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 350,
        alignSelf: 'center',
        marginTop: 80
    },
    suggest1: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80
    },
    arrowIcon: {
        marginLeft: 33,
        marginRight: 33,
        marginTop: -50,
        width: 20
    },
    suggestImg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 16
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16
    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 30,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    suggestTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 4,
        textAlign: 'center'
    },
    suggestSub: {
        fontFamily: 'Roboto-Regular',
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: 0.28,
        textAlign: 'center'
    },
    checkWrapper: {
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX()? 36 : 24
    }
});

export default connectConnections()(ConnectionRequestScreen);
