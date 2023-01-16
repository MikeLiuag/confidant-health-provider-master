import React, {Component} from 'react';
import {Body, Button, Container, Header, Left, Right, Title} from 'native-base';
import {Platform, StatusBar, StyleSheet} from 'react-native';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {addTestID, AlertUtil, HEADER_NORMAL, HEADER_X, isIphoneX, getHeaderHeight} from "ch-mobile-shared";
import Loader from "../../components/Loader";
import BillingService from "../../services/BillingService";
import {WebView} from 'react-native-webview';
const HEADER_SIZE = getHeaderHeight();
export default class StripeConnectFlowScreen extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            url: null
        }
    }

    componentDidMount = async () => {
        const response = await BillingService.connectToStripe();
        if(response.errors) {
            AlertUtil.showErrorMessage("Unable to connect bank account. Retry later");
        } else {
            this.setState({
                url: response.url,
                isLoading: false
            })
        }
    };

    goBack=()=>{
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            {...addTestID('Back')}
                            onPress={this.goBack}
                            transparent
                            style={styles.backButton}>
                            <FAIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body
                        style={Platform.OS === 'ios'? { flex: 4} : {flex: 5, paddingLeft: 25}}>
                        <Title style={styles.headerText}>Connecting Bank Account</Title>
                    </Body>
                    <Right/>
                </Header>
                <WebView
                    source={{ uri: this.state.url }}
                    style={{ marginBottom: 20 }}
                    ref={(webView)=>{
                        this.webView = webView;
                    }}
                    startInLoadingState={true}
                    renderLoading={() => <Loader />}
                />
            </Container>
        )
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

}


const styles = StyleSheet.create({

    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 6
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },

    headerText: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center',
        // width: 150
    },
});

