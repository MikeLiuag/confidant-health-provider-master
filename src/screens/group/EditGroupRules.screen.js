import React, {Component} from 'react';
import {StatusBar, StyleSheet, FlatList, TouchableOpacity, Keyboard} from 'react-native';
import {Container, Header, Content, Text, View, Title, Left, Body, Right, Button, Textarea} from 'native-base';
import {AlertUtil, isIphoneX, SearchFloatingButton, uuid4, getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import AwesomeIcons from "react-native-vector-icons/FontAwesome";
import AntIcon from "react-native-vector-icons/AntDesign";
import SwitchToggle from "react-native-switch-toggle";
import Overlay from 'react-native-modal-overlay';
import {addTestID} from "ch-mobile-shared/src/utilities";

const HEADER_SIZE = getHeaderHeight();


export class EditGroupRulesScreen extends Component<props> {
    static navigationOptions = {
        header: null,
    };

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    }

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
    }

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.settings = navigation.getParam('settings', null);
        this.onSuccess = navigation.getParam('onSuccess', null);
        console.log(this.settings);
        this.state = {
            rulesEnabled: this.settings.rulesEnabled,
            editDescription: false,
            RuleEdit: false,
            confirmModal: false,
            desc: this.settings.ruleSettings.description || '',
            rules: this.settings.ruleSettings.rules || [],
            ruleIdToEdit: null
        };

    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    saveGroupRules = () => {
        const {rulesEnabled} = this.state;
        if(rulesEnabled) {
            const hasDescription = this.state.desc.length>0;
            if(!hasDescription) {
                AlertUtil.showErrorMessage("Rule descriptions cannot be empty");
                return;
            }
            const emptyRules = this.state.rules.filter(rule=>rule.description.trim()==='').length;
            if(emptyRules>0) {
                AlertUtil.showErrorMessage("Rule descriptions cannot be empty");
                return;
            }
        }
        const payload = {
            rulesEnabled,
            groupRuleSettings: {
                description: rulesEnabled ? this.state.desc : null,
                rules: rulesEnabled ? this.state.rules : []
            }
        };
        this.onSuccess(payload);
        this.backClicked();
    };

    render() {
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
                    <Body style={{flex: 3}}>
                        <Title style={styles.headTitle}>Group Session Rules</Title>
                    </Body>
                    <Right/>

                </Header>
                <Content>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            rulesEnabled: !this.state.rulesEnabled
                        })
                    }} style={styles.switchBox}>
                        <View style={styles.switchText}>
                            <Text {...addTestID('group-session-rule-enable')} style={styles.darkText}>Group Session Rules Enabled</Text>
                            <Text {...addTestID('group-session-rule-desc')} style={styles.lightText}>Display custom rules before a
                                group video session starts.</Text>
                        </View>
                        <View {...addTestID('group-session-rule-toggle-view')}>
                            <SwitchToggle
                                {...addTestID('group-session-rule-toggle')}
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
                                buttonTextStyle={{fontSize: 10}}
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
                                switchOn={this.state.rulesEnabled}
                                onPress={() => {
                                    this.setState({
                                        rulesEnabled: !this.state.rulesEnabled
                                    })
                                }}
                                circleColorOff="#fff"
                                circleColorOn="#fff"
                                duration={200}
                            />
                        </View>
                    </TouchableOpacity>

                    {
                        this.state.rulesEnabled && (
                            <View style={styles.rulesListView}>
                                <View style={styles.editBox}>
                                    <View style={styles.editRow}>
                                        <Text {...addTestID('session-rule-description')} style={styles.editMainText}>Session Rules Description</Text>
                                        <View style={styles.editBtnBox}>
                                            {
                                                this.state.editDescription ? (
                                                    <Button
                                                        {...addTestID('edit-description-btn')}
                                                        onPress={() => {
                                                            this.setState({editDescription: false})
                                                        }}
                                                        transparent
                                                        style={styles.editBtn}>
                                                        <Text {...addTestID('done')} style={styles.blueTextBtn}>Done</Text>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        style={styles.editBtn}
                                                        transparent onPress={() => {
                                                        this.setState({
                                                            editDescription: true
                                                        })
                                                    }}>
                                                        <AwesomeIcons {...addTestID('edit-icon')} name="pencil" size={22} color="#3fb2fe"/>
                                                    </Button>
                                                )
                                            }

                                        </View>
                                    </View>
                                    <View style={styles.editFieldBox}>
                                        {
                                            !this.state.editDescription ? (
                                                <>
                                                    {
                                                        this.state.desc.length > 0 ? (
                                                            <Text
                                                                style={styles.editSubText}>{this.state.desc}</Text>
                                                        ): (
                                                            <Text
                                                                style={styles.editSubTextPH}>Click edit and write your group rules description here.</Text>
                                                        )
                                                    }
                                                </>
                                            ) : (
                                                <Textarea
                                                    {...addTestID('input-textarea-rule')}
                                                    placeholderTextColor="#B3BEC9"
                                                    // rowSpan={3}
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
                                <FlatList
                                    style={styles.rulesList}
                                    data={this.state.rules}
                                    renderItem={({item, index}) =>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setState({ruleIdToEdit: item.ruleId})
                                            }}
                                        >
                                            {
                                                this.state.ruleIdToEdit === item.ruleId ? (
                                                    <View style={styles.editBox}>
                                                        <View style={styles.editRow}>
                                                            <Text
                                                                {...addTestID('rule-'+index+1)}
                                                                style={styles.editMainText}>{'Rule ' + (index + 1)}
                                                            </Text>
                                                            <View style={styles.editBtnBox}>
                                                                <Button
                                                                    {...addTestID('add-rule')}
                                                                    onPress={() => {
                                                                        if (this.state.ruleIdToEdit === item.ruleId) {
                                                                            this.setState({
                                                                                ruleIdToEdit: null
                                                                            })
                                                                        }
                                                                    }}
                                                                    transparent
                                                                    style={styles.editBtn}>
                                                                    <Text {...addTestID('rule-done')} style={styles.blueTextBtn}>Done</Text>
                                                                </Button>
                                                            </View>
                                                        </View>
                                                        <View style={styles.editFieldBox}>
                                                            <Textarea
                                                                {...addTestID('rule-input-textarea')}
                                                                placeholderTextColor="#B3BEC9"
                                                                placeholderStyle={styles.editLabel}
                                                                style={styles.editSubText}
                                                                value={item.description}
                                                                onChangeText={(text) => {
                                                                    const {rules} = this.state;
                                                                    const newRules = rules.map(rule => {
                                                                        if (rule.ruleId === item.ruleId) {
                                                                            rule.description = text;
                                                                        }
                                                                        return rule;
                                                                    });
                                                                    this.setState({
                                                                        rules: newRules
                                                                    });
                                                                }}
                                                                placeholder={'Add rule description'}
                                                            />
                                                        </View>

                                                    </View>
                                                ) : (
                                                    <View style={styles.singleItem}>
                                                        <View style={styles.textSection}>
                                                            <Text style={styles.darkText}>{'Rule ' + (index + 1)}</Text>
                                                            {
                                                                item.description.length > 0 ? (
                                                                    <Text style={styles.lightText}>
                                                                        {item.description}
                                                                    </Text>
                                                                ) : (
                                                                    <Text style={styles.lightTextPH}>
                                                                        Click to add description
                                                                    </Text>
                                                                )
                                                            }


                                                        </View>
                                                        <View>
                                                            <Button
                                                                onPress={() => {
                                                                    this.setState({
                                                                        ruleToDelete: item.ruleId,
                                                                        confirmModal: true
                                                                    });
                                                                }}
                                                                transparent
                                                                style={styles.editBtn}>

                                                                <AntIcon name="delete" size={26} color="#f78795"/>


                                                            </Button>
                                                        </View>
                                                    </View>
                                                )
                                            }


                                        </TouchableOpacity>
                                    }
                                    keyExtractor={item => item.ruleId}
                                />
                            </View>
                        )
                    }

                </Content>
                {
                    this.state.rulesEnabled && (
                        <View style={{ marginBottom: -30}}>
                            <SearchFloatingButton
                                {...addTestID('icon-plus')}
                                icon="plus"
                                onPress={() => {
                                    const rules = this.state.rules;
                                    rules.push({
                                        ruleId: uuid4(),
                                        description: ''
                                    });
                                    this.setState({
                                        rules: rules
                                    });
                                }}
                            />
                        </View>

                    )
                }

                <View style={styles.greBtn}>
                    <GradientButton
                        testId = "save"
                        onPress={this.saveGroupRules}
                        text="Save"
                    />
                </View>

                <Overlay
                    containerStyle={styles.confirmOverlay}
                    childrenWrapperStyle={styles.confirmWrapper}
                    visible={this.state.confirmModal}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.confirmHeader}>
                            Are you sure you want to remove this rule?
                        </Text>
                        <View style={styles.confirmBtns}>
                            <Button style={{...styles.outlineBtn, flex: 1, marginTop: 10}}
                                    onPress={() => {
                                        let {rules} = this.state;
                                        rules = rules.filter(rule => {
                                            return rule.ruleId !== this.state.ruleToDelete;
                                        });
                                        this.setState({
                                            rules,
                                            confirmModal: false
                                        });
                                    }}
                            >
                                <Text style={styles.outlineText}>Yes, Remove</Text>
                            </Button>
                            <View style={styles.noBtn}>
                                <GradientButton
                                    onPress={() => {
                                        this.setState({confirmModal: false})
                                    }}
                                    text="No"
                                />
                            </View>
                        </View>
                    </View>

                </Overlay>

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
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        padding: 40,
        flex: 1
    },
    switchText: {
        marginRight: 40,
        flex: 1
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
    lightTextPH: {
        fontFamily: 'Roboto-Regular',
        color: '#8799c2',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0.32,
    },
    rulesListView: {
        padding: 24,
        backgroundColor: 'rgba(63,178,254,0.01)'
    },
    rulesList: {
        paddingBottom: 50
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
        marginBottom: 24
    },
    editRow: {
        flexDirection: 'row',
        padding: 24,
        alignItems: 'center',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1
    },
    editMainText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345c',
        fontSize: 14,
        flex: 1,
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
        padding: 24
    },
    editSubText: {
        fontFamily: 'Roboto-Regular',
        color: '#515d7d',
        fontSize: 14,
        lineHeight: 19.5,
        letterSpacing: 0.32,
        paddingTop: 0,
        paddingLeft: 0
    },
    editSubTextPH: {
        fontFamily: 'Roboto-Regular',
        color: '#8799c2',
        fontSize: 14,
        lineHeight: 19.5,
        letterSpacing: 0.32
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
        fontFamily: 'Roboto-Bold',
        color: '#3fb2fe',
        fontSize: 16,
        lineHeight: 18,
        letterSpacing: 0.57,
        marginRight: 16
    },
    editBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 25
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
    descriptionBox: {
        marginTop: 24
    },
    descriptionText: {
        fontFamily: 'Roboto-Regular',
        color: '#515d7d',
        fontSize: 15,
        lineHeight: 22.5,
        letterSpacing: 0.32,
        marginBottom: 15
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
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
    },
    outlineBtn: {
        borderColor: '#f78795',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
    },
    outlineText: {
        color: '#f78795',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    confirmWrapper: {
        height: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 40 : 25,
        paddingTop: 36,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 3,
        shadowOffset: {width: 0, height: 10},
        shadowColor: '#f5f5f5',
        shadowOpacity: 0.5,
    },
    greBtn: {
        padding: 24,
        paddingTop: 10,
        paddingBottom: isIphoneX() ? 36 : 24
    }
});
