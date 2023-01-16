import React, {Component} from 'react';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title, View,} from 'native-base';
import {Linking, StatusBar, StyleSheet, TouchableOpacity, Platform} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';

const HEADER_SIZE = getHeaderHeight();

export default class PrivacyPolicy extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    goToURL = () => {
        return(
            <Text style={{color: 'blue'}}
                  onPress={() => Linking.openURL('http://google.com')}>
                Google
            </Text>

        );
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container>
                <Header transparent style={styles.chatHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button transparent style={styles.backButton} onPress={() => {
                            this.backClicked();
                        }}>
                            <Icon name='angle-left' size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{ flex: 2}}>
                        <Title
                            style={styles.headerText}>Privacy Policy
                        </Title>
                    </Body>

                    <Right/>
                </Header>
                <Content>

                    <View
                        {...addTestID('list-privacy-policy')}
                        style={styles.mainContent}>

                            <Text style={styles.detailText}>Your privacy is important to us. It is Confidant Health's policy to respect your privacy regarding any information we may collect from you across our website,{' '}
                                <Text style={styles.detailTextLink} onPress={()=>{ Linking.openURL('http://confidanthealth.com')}}>http://confidanthealth.com</Text> pour mobile app, and other sites we own and operate.</Text>
                        <Text style={styles.headingText}>1. Information we collect</Text>
                        <Text style={styles.headingText}>Log data</Text>
                        <Text style={styles.detailText}>When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</Text>
                        <Text style={styles.headingText}>Device data</Text>
                        <Text style={styles.detailText}>We may also collect data about the device you’re using to access our website. This data may include the device type, operating system, unique device identifiers, device settings, and geo-location data. What we collect can depend on the individual settings of your device and software. We recommend checking the policies of your device manufacturer or software provider to learn what information they make available to us.</Text>
                        <Text style={styles.headingText}>Personal information</Text>
                        <Text style={styles.detailText}>We may ask for personal information, such as your:</Text>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Name</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Email</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Date of birth</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Phone/mobile number</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Home/Mailing address</Text></View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Work address</Text></View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>Payment information</Text>
                        </View>
                        <Text style={styles.headingText}>2. Legal bases for processing</Text>
                        <Text style={styles.detailText}>We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.</Text>
                        <Text style={styles.detailText}>These legal bases depend on the services you use and how you use them, meaning we collect and use your information only where:</Text>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>it’s necessary for the performance of a contract to which you are a party or to take steps at your request before entering into such a contract (for example, when we provide a service you request from us);</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>it satisfies a legitimate interest (which is not overridden by your data protection interests), such as for research and development, to market and promote our services, and to protect our legal rights and interests;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>you give us consent to do so for a specific purpose (for example, you might consent to us sending you our newsletter); or</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>we need to process your data to comply with a legal obligation.</Text>
                        </View>
                        <Text style={styles.detailText}>Where you consent to our use of information about you for a specific purpose, you have the right to change your mind at any time (but this will not affect any processing that has already taken place).</Text>
                        <Text style={styles.detailText}>We don’t keep personal information for longer than is necessary. While we retain this information, we will protect it within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification. That said, we advise that no method of electronic transmission or storage is 100% secure and cannot guarantee absolute data security. If necessary, we may retain your personal information for our compliance with a legal obligation or in order to protect your vital interests or the vital interests of another natural person.</Text>
                        <Text style={styles.headingText}>3. Collection and use of information</Text>
                        <Text style={styles.detailText}>We may collect, hold, use and disclose information for the following purposes and personal information will not be further processed in a manner that is incompatible with these purposes:</Text>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>to enable you to customize or personalize your experience of our website;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>to enable you to access and use our website, associated applications and associated social media platforms;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>to contact and communicate with you;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>for internal record keeping and administrative purposes;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>for analytics, market research and business development, including to operate and improve our website, associated applications and associated social media platforms;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>to run competitions and/or offer additional benefits to you;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>for advertising and marketing, including to send you promotional information about our products and services and information about third parties that we consider may be of interest to you; and to comply with our legal obligations and resolve any disputes that we may have.</Text>
                        </View>
                        <Text style={styles.headingText}>4. Disclosure of personal information to third parties</Text>
                        <Text style={styles.detailText}>We may disclose personal information to:</Text>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>third party service providers for the purpose of enabling them to provide their services, including (without limitation) IT service providers, data storage, hosting and server providers, ad networks, analytics, error loggers, debt collectors, maintenance or problem-solving providers, marketing or advertising providers, professional advisors and payment systems operators;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>and our employees, contractors and/or related entities.</Text>
                        </View>
                        <Text style={styles.headingText}>5. International transfers of personal information</Text>
                        <Text style={styles.detailText}>The personal information we collect is stored and processed in United States, or where we or our partners, affiliates and third-party providers maintain facilities. By providing us with your personal information, you consent to the disclosure to these overseas third parties.</Text>
                        <Text style={styles.detailText}>We will ensure that any transfer of personal information from countries in the European Economic Area (EEA) to countries outside the EEA will be protected by appropriate safeguards, for example by using standard data protection clauses approved by the European Commission, or the use of binding corporate rules or other legally accepted means.</Text>
                        <Text style={styles.detailText}>Where we transfer personal information from a non-EEA country to another country, you acknowledge that third parties in other jurisdictions may not be subject to similar data protection laws to the ones in our jurisdiction. There are risks if any such third party engages in any act or practice that would contravene the data privacy laws in our jurisdiction and this might mean that you will not be able to seek redress under our jurisdiction’s privacy laws.</Text>

                        <Text style={styles.headingText}>6. Your rights and controlling your personal information</Text>
                        <Text style={styles.detailText}>Choice and consent : By providing personal information to us, you consent to us collecting, holding, using and disclosing your personal information in accordance with this privacy policy. If you are under 16 years of age, you must have, and warrant to the extent permitted by law to us, that you have your parent or legal guardian’s permission to access and use the website and they (your parents or guardian) have consented to you providing us with your personal information. You do not have to provide personal information to us, however, if you do not, it may affect your use of this website or the products and/or services offered on or through it.</Text>
                        <Text style={styles.detailText}>Information from third parties : If we receive personal information about you from a third party, we will protect it as set out in this privacy policy. If you are a third party providing personal information about somebody else, you represent and warrant that you have such person’s consent to provide the personal information to us.</Text>
                        <Text style={styles.detailText}>Restrict : You may choose to restrict the collection or use of your personal information. If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by contacting us using the details below. If you ask us to restrict or limit how we process your personal information, we will let you know how the restriction affects your use of our website or products and services.</Text>
                        <Text style={styles.detailText}>Access and data portability : You may request details of the personal information that we hold about you. You may request a copy of the personal information we hold about you. Where possible, we will provide this information in CSV format or other easily readable machine format. You may request that we erase the personal information we hold about you at any time. You may also request that we transfer this personal information to another third party.</Text>
                        <Text style={styles.detailText}>Correction : If you believe that any information we hold about you is inaccurate, out of date, incomplete, irrelevant or misleading, please contact us using the details below. We will take reasonable steps to correct any information found to be inaccurate, incomplete, misleading or out of date.</Text>
                        <Text style={styles.detailText}>Notification of data breaches : We will comply laws applicable to us in respect of any data breach.</Text>
                        <Text style={styles.detailText}>Complaints : If you believe that we have breached a relevant data protection law and wish to make a complaint, please contact us using the details below and provide us with full details of the alleged breach. We will promptly investigate your complaint and respond to you, in writing, setting out the outcome of our investigation and the steps we will take to deal with your complaint. You also have the right to contact a regulatory body or data protection authority in relation to your complaint.</Text>
                        <Text style={styles.detailText}>Unsubscribe : To unsubscribe from our e-mail database or opt-out of communications (including marketing communications), please contact us using the details below or opt-out using the opt-out facilities provided in the communication.</Text>
                        <Text style={styles.headingText}>7. Cookies</Text>
                        <Text style={styles.detailText}>We use “cookies” to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. This helps us serve you content based on preferences you have specified. Please refer to our Cookie Policy for more information.</Text>
                        <Text style={styles.headingText}>8. Business transfers</Text>
                        <Text style={styles.detailText}>If we or our assets are acquired, or in the unlikely event that we go out of business or enter bankruptcy, we would include data among the assets transferred to any parties who acquire us. You acknowledge that such transfers may occur, and that any parties who acquire us may continue to use your personal information according to this policy.</Text>
                        <Text style={styles.headingText}>9. Limits of our policy</Text>
                        <Text style={styles.detailText}>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and policies of those sites, and cannot accept responsibility or liability for their respective privacy practices.</Text>
                        <Text style={styles.headingText}>10. Changes to this policy</Text>
                        <Text style={styles.detailText}>At our discretion, we may change our privacy policy to reflect current acceptable practices. We will take reasonable steps to let users know about changes via our website. Your continued use of this site after any changes to this policy will be regarded as acceptance of our practices around privacy and personal information.</Text>
                        <Text style={styles.detailText}>If we make a significant change to this privacy policy, for example changing a lawful basis on which we process your personal information, we will ask you to re-consent to the amended privacy policy.</Text>
                        <Text style={styles.headingText}>Confidant Health Data Controller</Text>
                        <Text style={styles.detailText}>Jon Read</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:jon@confidanthealth.com')}>
                        <Text style={styles.detailTextLink}>jon@confidanthealth.com</Text>
                        </TouchableOpacity>
                        <Text style={styles.headingText}>Confidant Health Data Protection Officer</Text>
                        <Text style={styles.detailText}>Jon Read</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:jon@confidanthealth.com')}>
                        <Text style={styles.detailTextLink}>jon@confidanthealth.com</Text>
                        </TouchableOpacity>
                        <Text style={styles.detailText}>This policy is effective as of 7 August 2019.</Text>
                    </View>
                </Content>
                {/*{*/}
                {/*this.state.isLoading ?*/}
                {/*<View style={styles.loadersty}>*/}
                {/*<Image source={require("./../../assets/images/loader1.gif")} />*/}
                {/*</View> : null*/}
                {/*}*/}
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    chatHeader: {
        backgroundColor: 'white',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        elevation: 0,
        height: HEADER_SIZE,
    },
    headerText: {
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        fontSize: 20
    },
    backButton: {
        width: 30,
        marginLeft: 16,
        paddingLeft: 0
    },
    mainContent:{
        padding:25,
    },
    headingText:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "800",
        fontSize: 18,
        marginTop:10,
        marginBottom:10,
    },
    detailTextDash:{
        display:'flex',
        flexDirection:'row',
        marginLeft:20,
    },
    detailText:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "300",
        fontSize: 14,
        textAlign:'justify',
        // letterSpacing:0.3,
        marginBottom:5,
        lineHeight: 20,
    },

    detailTextLink:{
        color: '#00C8FE',
        fontFamily: "Roboto-Regular",
        fontWeight: "300",
        fontSize: 14,
        textAlign:'justify',
        // letterSpacing:0.5,
        marginBottom:5,
        lineHeight: 20,
    },
    detailTextList:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "200",
        fontSize: 14,
        textAlign:'justify',
        marginBottom:5,
        // letterSpacing:0.5,
        marginLeft:20,
        lineHeight: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    loadersty: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
});
