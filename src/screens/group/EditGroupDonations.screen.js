import React, {Component} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import {Container, Header, Content, Text, View, Title, Left, Body, Right, Button, Input,
    Item, Label, Textarea} from 'native-base';
import {addTestID, AlertUtil, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import AwesomeIcons from "react-native-vector-icons/FontAwesome";
import SwitchToggle from "react-native-switch-toggle";
const HEADER_SIZE = getHeaderHeight();



export class EditGroupDonationsScreen extends Component<props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.settings = navigation.getParam('settings', null);
        this.onSuccess = navigation.getParam('onSuccess', null);
        this.state = {
            donationsEnabled: this.settings.donationsEnabled,
            editDescription: false,
            desc: this.settings.donationSettings.description || '',
            suggestedAmount: this.settings.donationSettings.suggestedAmount?'$'+this.settings.donationSettings.suggestedAmount: '$0',
            ruleIdToEdit: null
        };

    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    saveDonationSettings = () => {
        const {donationsEnabled} = this.state;
        if(donationsEnabled) {
            const suggestedAmount = Number(this.state.suggestedAmount.replace('$',''));
            if(!suggestedAmount || suggestedAmount<=10) {
                AlertUtil.showErrorMessage("Suggested donation amount should be greater than $10");
                return;
            }
        }

        const payload = {
            donationsEnabled,
            groupDonationSettings: {
                description: donationsEnabled ? this.state.desc : null,
                suggestedAmount: donationsEnabled ? Number(this.state.suggestedAmount.replace('$','')) : 0
            }
        };
        this.onSuccess(payload);
        this.backClicked();
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <Button
                            onPress={this.backClicked}
                            transparent
                            style={styles.backButton}>
                            <AwesomeIcons name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{ flex: 2 }}>
                        <Title style={styles.headTitle}>Donations</Title>
                    </Body>
                    <Right/>

                </Header>
                <Content>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({
                                donationsEnabled: !this.state.donationsEnabled
                            })
                        }}
                        style={styles.switchBox}>
                        <View style={styles.switchText}>
                            <Text {...addTestID('donation-enable')} style={styles.darkText}>Donations Enabled</Text>
                            <Text {...addTestID('donation-desc')} style={styles.lightText}>Show a custom message and
                                collect donations after a group
                                video session ends.</Text>
                        </View>
                        <View {...addTestID('donation-toggle')}>
                            <SwitchToggle
                                type={1}
                                buttonStyle={styles.switchBtn}
                                rightContainerStyle={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                leftContainerStyle={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'flex-start'
                                }}
                                buttonTextStyle={{ fontSize: 10 }}
                                textRightStyle={{
                                    fontSize: 10,
                                    color: 'black',
                                    fontWeight: '500',
                                    paddingLeft: 2
                                }}
                                textLeftStyle={{
                                    fontSize: 10,
                                    color: 'white',
                                    paddingRight: 0
                                }}
                                containerStyle={styles.switchContainer}
                                backgroundColorOn="#3fb2fe"
                                backgroundColorOff="#D1D1D1"
                                circleStyle={styles.switchCircle}
                                switchOn={this.state.donationsEnabled}
                                onPress={() => {
                                    this.setState({
                                        donationsEnabled: !this.state.donationsEnabled
                                    })
                                }}
                                circleColorOff="#fff"
                                circleColorOn="#fff"
                                duration={200}

                            />
                        </View>
                    </TouchableOpacity>

                    {
                        this.state.donationsEnabled && (
                            <View style={styles.rulesListView}>
                                <View style={styles.editBox}>
                                    <View style={styles.editRow}>
                                        <Text {...addTestID('donation-description')} style={styles.editMainText}>Donations Description</Text>
                                        <View style={styles.editBtnBox}>
                                            {
                                                this.state.editDescription ? (
                                                    <Button
                                                        onPress={() => {
                                                            this.setState({editDescription: false})
                                                        }}
                                                        transparent
                                                        style={styles.editBtn}>
                                                        <Text {...addTestID('done')} style={styles.blueTextBtn}>Done</Text>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        transparent onPress={() => {
                                                        this.setState({
                                                            editDescription: true
                                                        })
                                                    }}>
                                                        <AwesomeIcons {...addTestID('donation-edit-icon')} name="pencil" size={22} color="#3fb2fe"/>
                                                    </Button>
                                                )
                                            }
                                        </View>
                                    </View>
                                    <View style={styles.editFieldBox}>
                                        {
                                            !this.state.editDescription ? (
                                                <Text
                                                    style={styles.editSubText}>{this.state.desc.length > 0 ? this.state.desc : 'Click edit and write your donations description description here.'}</Text>
                                            ) : (
                                                <Textarea
                                                    {...addTestID('input-textarea-donation')}
                                                    placeholderTextColor="#B3BEC9"
                                                    placeholderStyle={styles.editLabel}
                                                    style={styles.editSubText}
                                                    onChangeText={(text) => {
                                                        this.setState({
                                                            desc: text
                                                        })
                                                    }}
                                                    value={this.state.desc}
                                                    placeholder={'Add group description here'}
                                                />
                                            )
                                        }


                                    </View>
                                </View>
                                <View>
                                    <Item floatingLabel>
                                        <Label style={styles.blueText}>Suggested donation amount</Label>
                                        <Input
                                            {...addTestID('Enter-amount-input')}
                                            placeholderTextColor="#B3BEC9"
                                            placeholderStyle={styles.editLabel}
                                            placeholder={'$20'}
                                            style={styles.editMainText}
                                            value={this.state.suggestedAmount}
                                            onChangeText={textInput => {
                                                textInput = textInput.replace('$', '');
                                                const numericAmount = Number(textInput);
                                                if(!isNaN(numericAmount)) {
                                                    this.setState({
                                                        suggestedAmount: '$'+textInput
                                                    });
                                                } else {

                                                    this.setState({
                                                        suggestedAmount: this.state.suggestedAmount.length===0?'':''+this.state.suggestedAmount
                                                    });
                                                }
                                            }}
                                        />

                                    </Item>
                                </View>
                            </View>
                        )
                    }

                </Content>
                <View style={styles.greBtn}>
                    <GradientButton
                        testId = "save"
                        onPress={this.saveDonationSettings}
                        text="Save"
                    />
                </View>
            </Container>

        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        paddingLeft: 6
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },
    headTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    switchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        padding: 40
    },
    switchText: {
        marginRight: 40
    },
    darkText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345c',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8
    },
    lightText: {
        fontFamily: 'Roboto-Regular',
        color: '#515d7d',
        fontSize: 14,
        lineHeight: 19.5,
        letterSpacing: 0.32,
    },
    rulesListView: {
        padding: 24,
        backgroundColor: 'rgba(63,178,254,0.01)'
    },
    editBox: {
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        marginBottom: 50
    },
    editRow: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1
    },
    editMainText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345c',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.5
    },
    editLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 16,
        color: '#b3bec9',
        opacity: 0.8,
        letterSpacing: 0.5
    },
    editBtnBox: {
        // marginLeft: 10
    },
    editFieldBox: {
        padding: 24,
        paddingBottom: 0
    },
    editSubText: {
        fontFamily: 'Roboto-Regular',
        color: '#515d7d',
        fontSize: 14,
        lineHeight: 19.5,
        letterSpacing: 0.32,
        marginBottom: 24
    },

    serviceMainText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 24
    },
    singleItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden'
    },
    textSection: {
        paddingRight: 10,
        flex: 2
    },
    itemText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: 0.5
    },
    blueText: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 14,
        lineHeight: 16
    },
    switchBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    switchContainer: {
        marginTop: 0,
        width: 50,
        height: 30,
        borderRadius: 30,
        padding: 1
    },
    switchCircle: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: '#fff',
        position: 'absolute'
    },
    greBtn: {
        padding: 24,
        paddingTop: 10,
        paddingBottom: isIphoneX()? 36 : 24
    },
    blueTextBtn: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 13,
        lineHeight: 14,
        letterSpacing: 0.57,
        marginRight: 0,
        paddingRight: 0
    },
});
