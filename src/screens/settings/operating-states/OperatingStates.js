import React, {Component} from 'react';
import {FlatList, Image, Platform, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Item, Label, Left, Right, Text, Title, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles,
    BackButton, getHeaderHeight,DEFAULT_STATES_OPTIONS
} from 'ch-mobile-shared';
import {Screens} from '../../../constants/Screens';
import Loader from '../../../components/Loader';
import {connectProfile} from "../../../redux";
import ProfileService from "../../../services/ProfileService";
import {SliderSearch} from "ch-mobile-shared/src/components/slider-search";
import SwitchToggle from "react-native-switch-toggle";
const HEADER_SIZE = getHeaderHeight();

class OperatingStates extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            operatingStates: [],
            filteredList:[],
            showBack: true,
            isStatelimited:false
        };
    }

    async componentDidMount(): void {
        this.getOperatingStates()
    }


    getOperatingStates = () =>{
        const previousSelectedStates= this.props.profile.profile.operatingStates;

        const isStatelimited=this.props.profile.profile.stateLimited
        const operatingStates= DEFAULT_STATES_OPTIONS.map(state => {
            return {
                title: state,
                selected: previousSelectedStates?.includes(state),
            };
        })
        this.setState({operatingStates,filteredList:[],isLoading: false,isStatelimited:isStatelimited});
        return operatingStates;
    };

    updateList = (selectedItem) => {
        let operatingStates = this.state.operatingStates.map(item => {
            if (item.title === selectedItem.title) {
                item.selected = !item.selected;
            }
            return item;
        });
        this.setState({operatingStates});
    };

    propagate = (data) => {
        this.setState({filteredList:data.operatingStates});
    };

    updateOperatingStates = async () =>{
        this.setState({isLoading: true});
        let {operatingStates,isStatelimited} = this.state;
        operatingStates = operatingStates.filter(state => state.selected === true )
        operatingStates = operatingStates.map(state=>state.title)
        const providerOperatingStates = {
            operatingStates: operatingStates,
            stateLimited:isStatelimited
        };
        const response = await ProfileService.updateProviderOperatingStates(providerOperatingStates);
        this.setState({isLoading: false});
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            AlertUtil.showSuccessMessage(response.successMessage);
            this.props.getProfile()
            this.navigateToNextScreen();
        }

    }




    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.SETTINGS_SCREEN)
    }

    setDefaultStatus = (operatingStates)=>{
        return operatingStates?.map(item => {
            return {
                ...item,
                selected : false
            };
        });

    }


    toggleStateLimitProvider = () =>{
        const {isStatelimited,filteredList,operatingStates} = this.state;
        this.setState({
            operatingStates : !isStatelimited ? operatingStates : this.setDefaultStatus(operatingStates),
            filteredList : !isStatelimited ? filteredList : this.setDefaultStatus(filteredList),
            isStatelimited: !isStatelimited
        });

    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.profile.isLoading) {
            return <Loader/>
        }
        const {operatingStates,isStatelimited,filteredList} = this.state;
        const isDisabled = isStatelimited && operatingStates && operatingStates.filter(item => item.selected)?.length < 1;
        return (
            <Container >
                <Header noShadow={false} transparent style={styles.header}>


                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />

                    <SliderSearch
                        {...addTestID('OperatingStates-Header')}
                        propagate={this.propagate}
                        hideSearchIcon={this.props.error}
                        options={{
                            screenTitle: 'Operating States',
                            searchFieldPlaceholder: 'Search State',
                            listItems: {
                                operatingStates: operatingStates,
                            },

                            filter: (listItems, query) => {
                                return {
                                    operatingStates: listItems.operatingStates
                                        .filter(state =>
                                            state.title.toLowerCase()
                                                .includes(query.toLowerCase().trim())
                                        )
                                };
                            },
                            showBack: this.state.showBack,
                            backClicked: this.backClicked,
                        }}
                    />
                </Header>
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
              {/*          <Image
                            {...addTestID('Zip-code-png')}
                            style={styles.signInIcon}
                            source={require('../../../assets/images/new-Location-icon2.png')} />*/}
                        <Text
                            {...addTestID('Heading-1')}
                            style={styles.magicMainText}>
                            Select States in which you are providing services?
                        </Text>
                    </View>


                    <View style={styles.optionList}>
                        <Item fixedLabel
                              style={styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>State Limited </Label>
                            <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between',padding: 10}}>
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
                                    switchOn={isStatelimited}
                                    onPress={() => {
                                        this.toggleStateLimitProvider()
                                    }}
                                    circleColorOff="#fff"
                                    circleColorOn="#fff"
                                    duration={200}
                                />
                            </View>
                        </Item>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={filteredList?.length>1? filteredList : operatingStates}
                                renderItem={({item,index}) =>
                                        <SingleCheckListItem
                                            listTestId={'list - ' + index+1}
                                            checkTestId={'checkbox - ' + index+1}
                                            keyId={index}
                                            listPress={() => {
                                                this.updateList(item)
                                            }}
                                            itemSelected={item.selected}
                                            itemTitle={item.title}
                                            checkID={'checkbox - ' + index+1}
                                        />
                                }
                                keyExtractor={item => item}
                            />
                    </View>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>

                        <PrimaryButton
                            arrowIcon={false}
                            testId = "save"
                            disabled={isDisabled}
                            onPress={() => {
                                this.updateOperatingStates();
                            }}
                            text="Save"
                        />
                    </View>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        // paddingTop: isIphoneX()? 124 : 100,
        paddingLeft: 40,
        paddingRight: 40
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 3
    },
    backBtn: {
        marginLeft: 15,
        marginRight:15,
        width: 35
    },
    backIcon: {
        color: '#3fb2fe',
        fontSize: 30,
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
    statesTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center',
        marginLeft:10
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 16,
        textAlign: 'center'
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    optionList: {
        padding: 24
    },
});

export default connectProfile()(OperatingStates);
