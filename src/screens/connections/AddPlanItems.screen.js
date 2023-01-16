import React, {Component} from "react";
import {FlatList, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity} from "react-native";
import {CheckBox, Container, Content, Header, Icon, View} from "native-base";
import {
    addTestID,
    AlertUtil,
    Colors,
    getAvatar,
    PrimaryButton,
    SingleCheckListItem,
    SliderSearch,
    TextStyles
} from "ch-mobile-shared";
import {Screens} from "../../constants/Screens";
import {getHeaderHeight, isIphoneX} from "ch-mobile-shared/src/utilities";
import ConversationService from "../../services/ConversationService";
import Loader from "../../components/Loader";
import {AVATAR_COLOR_ARRAY} from "../../constants/CommonConstants";
import {GreenCheckListItem} from "../../components/GreenCheckListItem";
import {CommonStyles} from "ch-mobile-shared/src/styles";

const HEADER_SIZE = getHeaderHeight();

export class AddPlanItemsScreen extends Component {

    constructor(props) {
        super(props);
        this.connection = this.props.navigation.getParam('connection', null);
        this.assignedPlanItems = this.props.navigation.getParam('assignedPlanItems', null);
        this.state = {
            isLoading: true,
            allPlanItems: [],
            visibleItems: [],
            selectedItems: [],
            assignedItems: (this.assignedPlanItems && this.assignedPlanItems.map(item => item.planItem.id)) || []
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    }

    assignPlanItems = async ()=>{
        this.setState({
            isLoading: true
        });
        const request = {
            userId: this.connection.connectionId,
            planItemIds: this.state.selectedItems
        }
        const response = await ConversationService.addItemsToPlan(request);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({
                isLoading: false
            })
        } else {
            AlertUtil.showSuccessMessage(response.message);
            this.goBack();
        }
    };

    componentDidMount() {
        this.fetchAllPlanItems();
    }

    fetchAllPlanItems = async () => {
        const response = await ConversationService.getPlanItemsList();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({
                isLoading: false
            })
        } else {
            this.setState({
                allPlanItems: response.records,
                visibleItems: response.records,
                isLoading: false
            });
        }
    };

    propagate = result => {
        this.setState({
            visibleItems: result,
        });
    };

    selectPlanItem = (item) => {
        let {selectedItems} = this.state;
        if (selectedItems.includes(item.id)) {
            selectedItems = selectedItems.filter(id => id !== item.id);
        } else {
            selectedItems.push(item.id);
        }
        this.setState({
            selectedItems
        })

    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container style={styles.container}>
                <Header
                    {...addTestID("Header")}
                    noShadow transparent style={styles.chatHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <SliderSearch
                        options={{
                            screenTitle: '',
                            searchFieldPlaceholder: 'Search Plan items',
                            listItems: this.state.allPlanItems,
                            filter: (listItems, query) => {
                                return listItems.filter(plan =>
                                    plan.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );
                            },
                            backClicked: this.goBack,
                            // isDrawer: true,
                            showBack: true
                        }}

                        propagate={this.propagate}
                    />
                </Header>

                <Text style={styles.headerText}>
                    Add to Plan
                </Text>

                <ScrollView style={styles.planList}>
                    {
                        this.state.visibleItems.map((item, index) => {
                            return this.state.assignedItems.includes(item.id) ?
                                (<GreenCheckListItem listTestId={'list - ' + 1}
                                                     checkTestId={'checkbox - ' + index + 1}
                                                     keyId={item.id}
                                                     listPress={() => {

                                                     }}
                                                     itemSelected={true}
                                                     itemTitle={item.name}
                                />)

                                : (

                                    <SingleCheckListItem
                                        listTestId={'list - ' + 1}
                                        checkTestId={'checkbox - ' + index + 1}
                                        keyId={item.id}
                                        listPress={() => this.selectPlanItem(item)}
                                        itemSelected={this.state.selectedItems.includes(item.id)}
                                        itemTitle={item.name}
                                    />
                                )
                        })
                    }
                </ScrollView>

                {
                    this.state.selectedItems.length > 0 && (
                        <View
                            {...addTestID('view')}
                            style={styles.greBtn}>
                            <PrimaryButton
                                testId="schedule"
                                iconName='plus'
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={this.assignPlanItems}
                                text={`Add ${this.state.selectedItems.length} Item${this.state.selectedItems.length > 1 ? 's' : ''}`}
                                size={24}
                            />

                        </View>
                    )
                }

            </Container>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: Colors.colors.screenBG,
    },
    chatHeader: {
        // backgroundColor: "#fff",
        paddingLeft: 3,
        paddingRight: 18,
        elevation: 0,
        height: HEADER_SIZE,
    },
    searchBox: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    headerText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    planList: {
        marginTop: 24
    },
    addMemberSingle: {
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    checkWrap: {
        width: 34
    },
    multiCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.mainBlue
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
});
