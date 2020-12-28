import * as React from "react";
import { Updates } from 'expo';
import {
    Container, Header, Title, Content,
    Text, Button, Icon, Left, Body, Right,
    List, ListItem, Row, Col, Grid,
    Card, CardItem, Toast,
    H1, H2, H3, View, Form, Item, Input
} from "native-base";

import styles from "./styles";
// import Sparkline from "react-native-sparkline";
import ProgressBar from "react-native-progress-bar";
import CardFlip from 'react-native-card-flip';

import OTP from "otp-client";
import md5 from "md5";

import {AsyncStorage, Dimensions, Alert, AppState, TouchableOpacity} from "react-native";

// const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

import PINSetting from "../../../component/PINSetting";
import { TextLetterSpacing } from "./TextLetterSpacing";
import axios from "axios";
import {decrypt} from "../../../utils/crypt";
import {NavigationActions, StackActions} from "react-navigation";
import Constants from "expo-constants";

// var ProgressBar = require("react-native-progress-bar");

class Home extends React.Component {

    constructor(props) {
        super(props);

        let period = parseInt(this.props.mainStore.serverToken.period) - 1;

        this.rdm = Math.floor(Math.random()*(period-1+1)) + 1;

        this.state = {
            title: "ArgusOTP",
            token: "000000",
            prevToken: "000000",
            nextToken: "000000",
            nextTokenSecond: 0,
            subTitle: this.props.userId,
            intervalId: null,
            textColor: "#3b5998",
            progress: 0,
            timeDiff: 0,
            appState: AppState.currentState,
            isFlipped: false,
            settingMode: false,
        };

    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            // console.log('App has come to the foreground!');
            // Toast.show({
            //     text: "App has come to the foreground!",
            //     // buttonText: "OK",
            //     // type: "success",
            //     duration: 2000,
            // });

            AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {

                if(this.props.mainStore.serverToken.pincodeDigits != lockPass.length) {
                    this.props.navigation.navigate("LockSet");
                    return;
                }

                if(lockPass) {
                    this.props.navigation.navigate("Lock", {
                        mainStore: this.props.mainStore,
                        // serverUrl: this.props.mainStore.getServerUrl(),
                        // userid: this.props.mainStore.userToken.userId,
                    });
                }

                // else {
                //     if(this.props.mainStore.serverToken.pincode === "true") {
                //         this.props.navigation.navigate("LockSet");
                //     }
                // }



            });


        }
        this.setState({
            // token: "000000",
            appState: nextAppState
        });
    };


    componentDidMount() {
        const { mainStore } = this.props;


        axios.get(mainStore.getServerUrl() + "/otp/checkConfig/" + mainStore.userToken.userId, {
            crossdomain: true,
        }).then(res => {
            const result = res.data;
            let jsonText = decrypt(result, mainStore.serverToken.encKey);
            let jsonObj = JSON.parse(jsonText);

            // alert(JSON.stringify(mainStore.serverToken));
            //
            // alert(jsonText+"    ------    "+ JSON.stringify(mainStore.serverToken)+"    ------    "+ JSON.stringify(mainStore.userToken));

            // alert(JSON.stringify(jsonObj.pincode) +" /// "+ JSON.stringify(mainStore.serverToken.pincode));

            // alert(jsonObj.pincode);

            let remotePincode = jsonObj.pincodeUse || "false";
            let myPincode = mainStore.serverToken.pincodeUse || "false";

            let remotePincodeDigits = jsonObj.pincodeDigits || "4";
            let myPincodeDigits = mainStore.serverToken.pincodeDigits || "4";

            if( jsonObj.digits !== mainStore.serverToken.digits ||
                jsonObj.period !== mainStore.serverToken.period ||
                remotePincode !== myPincode ||
                remotePincodeDigits !== myPincodeDigits
            ) {
                Alert.alert(
                  'Policy Update',
                  'Restart app to finish accepting changed policy.',
                  [
                      {
                          text: 'Restart', onPress: () => mainStore.resetUserStore().then(() => {
                              if (remotePincodeDigits !== myPincodeDigits) {
                                  AsyncStorage.removeItem("@SeedAuthStore:lockToken").then(() => {
                                      Updates.reload();
                                  });
                              } else {
                                  Updates.reload();
                              }

                          })
                      },
                  ],
                  { cancelable: false }
                );
                return;
            }

            if (jsonObj.deviceid === "__POLICYCHANGE__") {
                Alert.alert(
                  'Policy Update',
                  'Restart app to finish accepting changed policy.',
                  [
                      {
                          text: 'Restart', onPress: () => mainStore.resetUserStore().then(() => {
                              Updates.reload();
                          })
                      },
                  ],
                  {cancelable: false}
                );
                return;

            } else if (jsonObj.deviceid === "__MISSING__") {
                clearInterval(this.state.intervalId);
                this.setState({
                    token: "000000",
                });

                Alert.alert(
                  'Warning',
                  'Your device is not allowed to access!',
                  [
                      {
                          text: 'Exit', onPress: () => mainStore.resetUserStore().then(() => {
                              Updates.reload();
                          })
                      },
                  ],
                  { cancelable: false }
                );
                return;
            }

            setTimeout(() => {
                let myTime = new Date().valueOf();
                let diff = jsonObj.epoch - myTime;

                this.setState({
                    timeDiff: diff,
                    title: jsonObj.owner || "SeedAuth",
                });
            }, 500);

        // }).catch( reason => {
        //     Alert.alert('Error', reason.message );
        //     console.log(reason.message);
        });

        AppState.addEventListener('change', this._handleAppStateChange);

        AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {
            if(lockPass) {
                this.props.navigation.navigate("Lock", {
                    mainStore: this.props.mainStore,
                    // serverUrl: this.props.mainStore.getServerUrl(),
                    // userid: this.props.mainStore.userToken.userId,
                });
            } else {
                if(this.props.mainStore.serverToken.pincodeUse === "true") {
                    this.props.navigation.navigate("LockSet");
                }
            }

        });

        let secret = this.props.mainStore.userToken.userId + this.props.mainStore.serverToken.otpKey;
        if(secret.length > 14) {
            secret = secret.toLowerCase();
            secret = md5(secret).substr(0, 14);
        }

        let intervalId = setInterval(() => {

            const { mainStore } = this.props;

            if (!mainStore.isServerSet) {
                return;
            }

            let options = {
                algorithm: "sha1",
                digits: parseInt(mainStore.serverToken.digits),
                period: parseInt(mainStore.serverToken.period),
                epoch: ( new Date().valueOf() + this.state.timeDiff ), //null, // new Date() / 1000,
            };

            // alert(this.props.mainStore.userToken.userId +"---"+ this.props.mainStore.serverToken.otpKey + "---" +secret);
            // clearInterval(this.state.intervalId);

            const otp = new OTP(secret, options);
            const token = otp.getToken();
            const prevToken = otp.getToken(-1);
            const nextToken = otp.getToken(1);

            let timeLeft = otp.getTimeUntilNextTick() + 1;
            let progress = (options.period - timeLeft) / options.period;

            this.setState({
                token: token,
                prevToken: prevToken,
                nextToken: nextToken,
                nextTokenSecond: timeLeft,
                textColor: otp.getTimeUntilNextTick() < 10 ? "#de0607" : "#3b5998",
                progress: progress,
            });

        }, 1000);

        this.setState({ intervalId: intervalId });

    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    timeSync() {
        let checkUrl = this.props.mainStore.getServerUrl() + "/otp/epoch";

        // alert(checkUrl);

        axios.get(checkUrl, {
            crossdomain: true,
        }).then(res => {
            const result = res.data;
            let myTime = new Date().valueOf();
            let diff = result.epoch - myTime;

            // alert(result.epoch + " - " + myTime + " = " + diff);

            Toast.show({
                text: "Time sync .. ok (diff: " + diff + " ms)",
                // buttonText: "OK",
                type: "success",
                duration: 2500,
            });

            this.setState({
                timeDiff: diff,
            })

        });
    }

    render() {
        return (
            <Container style={styles.container}  style={{ backgroundColor: "#2D2B2C" }}>

                <Content padder>

                    <Body style={{ marginTop: 20, marginBottom: 25 }}>
                        <Title style={{ color: "#60B0F4", fontWeight: "bold", fontSize: 22 }}>{ this.state.title }</Title>
                    </Body>

                    <View style={{ padding: 4 }}>
                        <CardFlip ref={(card) => this.card = card}  style={{
                            // width: 320,
                            height: 250,
                        }}>
                            <View style={{ backgroundColor: "white", borderRadius: 10, paddingTop: 30, height: 250 }} >
                                <View style={{ alignItems: "center" }} >
                                    <H3 style={{ color: "grey", marginTop: 5, marginBottom: 8 }}>
                                        CHECK YOUR PIN
                                    </H3>
                                    <PINSetting color="#2D2B2C" password="1234" onSuccess={(res) => {
                                        if(res === "OK") {
                                            this.card.flip();
                                            setTimeout(() => this.card.flip(), 30000);
                                        }
                                    }}/>
                                </View>
                            </View>

                            {/*<TouchableOpacity style={{*/}
                            {/*    // width: 320,*/}
                            {/*    height: 200,*/}
                            {/*    // backgroundColor: 'white',*/}
                            {/*    // borderRadius: 5,*/}
                            {/*    // shadowColor: 'rgba(0,0,0,0.5)',*/}
                            {/*    // shadowOffset: {*/}
                            {/*    //     width: 0,*/}
                            {/*    //     height: 1,*/}
                            {/*    // },*/}
                            {/*    // shadowOpacity: 0.5,*/}
                            {/*}} onPress={() => {*/}
                            {/*    this.card.flip();*/}
                            {/*    setTimeout(() => {*/}
                            {/*        this.card.flip();*/}
                            {/*    }, 10000);*/}
                            {/*}} >*/}
                            {/*    <Card style={{ justifyContent: "center", height: 200, borderRadius: 10 }} >*/}
                            {/*        <CardItem>*/}
                            {/*            <Body style={{ alignItems: "center" }} >*/}
                            {/*                <H3 style={{ color: "grey", marginBottom: 8 }}>*/}
                            {/*                    CHECK PASSWORD*/}
                            {/*                </H3>*/}
                            {/*                <H2 style={{ color: "grey", marginBottom: 0, fontWeight: "bold" }}>*/}
                            {/*                    CLICK!*/}
                            {/*                </H2>*/}
                            {/*                <Icon type="FontAwesome5" active name="hand-point-up" style={{ color: "lightgray", fontSize: 60 }} />*/}
                            {/*            </Body>*/}
                            {/*        </CardItem>*/}
                            {/*    </Card>*/}
                            {/*</TouchableOpacity>*/}
                            {/*<TouchableOpacity style={{*/}
                            {/*    height: 200,*/}
                            {/*    // backgroundColor: 'white',*/}
                            {/*    // borderRadius: 5,*/}
                            {/*    // shadowColor: 'rgba(0,0,0,0.5)',*/}
                            {/*    // shadowOffset: {*/}
                            {/*    //     width: 0,*/}
                            {/*    //     height: 1,*/}
                            {/*    // },*/}
                            {/*    // shadowOpacity: 0.5,*/}
                            {/*}} onPress={() => this.card.flip()} >*/}
                                <Card style={{ alignItems: "center", justifyContent: "center", height: 250, borderRadius: 10 }}>
                                    <H3 style={{color: "grey"}}>
                                        VERIFY PASSWORD
                                    </H3>
                                    {/*<H3 style={{color: "grey"}}>*/}
                                    {/*    PASSWORD*/}
                                    {/*</H3>*/}
                                    {/*<CardItem header>*/}
                                    {/*<Text>{this.props.userId}</Text>*/}
                                    {/*</CardItem>*/}
                                    {/*<CardItem>*/}
                                    {/*<Body>*/}
                                    {/*<TextLetterSpacing*/}
                                    {/*spacing={3}*/}
                                    {/*viewStyle={{ marginLeft: 15 }}*/}
                                    {/*textStyle={{*/}
                                    {/*fontSize: 35,*/}
                                    {/*color: "lightgrey"*/}
                                    {/*}}*/}
                                    {/*>*/}
                                    {/*{this.state.prevToken}*/}
                                    {/*</TextLetterSpacing>*/}

                                    <TextLetterSpacing
                                        spacing={2}
                                        // viewStyle={{ paddingTop: 10 }}
                                        textStyle={{
                                            fontSize: 42,
                                            color: this.state.textColor,
                                            marginTop: 15,
                                            marginBottom: 10
                                        }}
                                    >
                                        { this.state.token }
                                    </TextLetterSpacing>

                                    {/*<TextLetterSpacing*/}
                                    {/*spacing={3}*/}
                                    {/*viewStyle={{ marginLeft: 15 }}*/}
                                    {/*textStyle={{*/}
                                    {/*fontSize: 35,*/}
                                    {/*color: "lightgrey"*/}
                                    {/*}}*/}
                                    {/*>*/}
                                    {/*{this.state.nextToken}*/}
                                    {/*</TextLetterSpacing>*/}
                                    <ProgressBar
                                        fillStyle={{backgroundColor: this.state.textColor}}
                                        backgroundStyle={{backgroundColor: "#cccccc", borderRadius: 2}}
                                        style={{marginTop: 10, width: deviceWidth * 0.7 }}
                                        progress={this.state.progress}
                                    />
                                    {/*</Body>*/}
                                    {/*</CardItem>*/}
                                    <CardItem>
                                        <Row>
                                            <Left/>
                                            <Right style={{ marginRight: 13 }}>
                                                <Text note>{this.state.nextTokenSecond} second(s) left</Text>
                                            </Right>
                                        </Row>
                                    </CardItem>
                                </Card>
                            {/*</TouchableOpacity>*/}
                        </CardFlip>
                        <Right style={{ marginTop: 8 }}>
                            <Text style={{color: "gray"}}>v{Constants.manifest.version}</Text>
                        </Right>
                    </View>

                </Content>

                <View padder style={{ backgroundColor: "#2D2B2C" }}>
                    <View padder style={{
                        backgroundColor: "#60B0F4", borderTopLeftRadius: 30, borderTopRightRadius: 30,
                        height: this.state.settingMode ? 300 : 65 }} >
                        {/*<View style={{width: 80, height: 8, borderRadius: 5, backgroundColor: "lightgray"}}></View>*/}
                        <Button transparent block info onPress={() => this.setState({settingMode : !this.state.settingMode})}>
                            <Text style={{ color: "white", fontWeight: "bold" }}>MENU</Text>
                        </Button>
                        {
                            this.state.settingMode ?
                                <View>
                                <View padder>
                                    <Button rounded block
                                            style={{ backgroundColor: "#2D2B2C", marginBottom: 8 }}
                                            onPress={() => this.props.navigation.navigate("LockSet")} >
                                        {/*<Icon name='information-circle' />*/}
                                        <Text>PIN Setting</Text>
                                    </Button>
                                {/*</View>*/}
                                {/*<View padder style={{ marginTop: -10 }}>*/}
                                    <Button rounded block
                                            style={{ backgroundColor: "#2D2B2C", marginBottom: 8 }}
                                            onPress={() => this.timeSync()} >
                                        {/*<Icon name='time' />*/}
                                        {/*<Text>Time Sync (diff: {Math.abs(this.state.timeDiff) > 1000 ? (this.state.timeDiff/1000).toFixed(0) + " sec" : this.state.timeDiff + " ms"})</Text>*/}
                                        <Text>Time Synchronization</Text>
                                    </Button>
                                    <Button rounded block
                                            danger
                                            // style={{ backgroundColor: "#2D2B2C" }}
                                            onPress={() => this.props.navigation.dispatch(
                                                StackActions.reset(
                                                    {
                                                        index: 0,
                                                        key: null,
                                                        actions: [NavigationActions.navigate({ routeName: "Auth", params: { isLogout: true }})],
                                                    }
                                                )
                                                )} >
                                        {/*<Icon name='time' />*/}
                                        {/*<Text>Time Sync (diff: {Math.abs(this.state.timeDiff) > 1000 ? (this.state.timeDiff/1000).toFixed(0) + " sec" : this.state.timeDiff + " ms"})</Text>*/}
                                        <Text>Logout</Text>
                                    </Button>

                                </View>
                                </View>
                                : null
                        }
                    </View>
                </View>
            </Container>
        );
    }
}

export default Home;
