import * as React from "react";
import { Updates } from 'expo';
import {
    Container, Header, Title, Content,
    Text, Button, Icon, Left, Body, Right,
    List, ListItem, Row, Col,
    Card, CardItem, Toast,
    H1, H2, H3, View
} from "native-base";

import styles from "./styles";
// import Sparkline from "react-native-sparkline";
import ProgressBar from "react-native-progress-bar";

import OTP from "otp-client";
import md5 from "md5";

import {AsyncStorage, Dimensions, Alert, AppState} from "react-native";

// const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

import { TextLetterSpacing } from "./TextLetterSpacing";
import axios from "axios";
import {decrypt} from "../../../utils/crypt";
import {NavigationActions, StackActions} from "react-navigation";

// var ProgressBar = require("react-native-progress-bar");

export interface Props {
    navigation: any;
    userId: any,
}
export interface State {}

class Home extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        let period = parseInt(this.props.mainStore.serverToken.period) - 1;

        this.rdm = Math.floor(Math.random()*(period-1+1)) + 1;

        this.state = {
            title: "SeedAuth",
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
                if(lockPass) {
                    this.props.navigation.navigate("Lock");
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

            // alert(jsonText+"    ------    "+ JSON.stringify(mainStore.serverToken)+"    ------    "+ JSON.stringify(mainStore.userToken));

            let remotePincode = jsonObj.pincode || "false";
            let myPincode = mainStore.serverToken.pincode || "false";

            if( jsonObj.digits !== mainStore.serverToken.digits ||
                jsonObj.period !== mainStore.serverToken.period ||
                remotePincode !== myPincode
            ) {
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

            let myTime = new Date().valueOf();
            let diff = jsonObj.epoch - myTime;

            this.setState({
                timeDiff: diff,
                title: jsonObj.owner || "SeedAuth",
            });

        }).catch( reason => {
            // Alert.alert('Error', reason.message );
        });

        AppState.addEventListener('change', this._handleAppStateChange);

        AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {
            if(lockPass) {
                this.props.navigation.navigate("Lock");
            } else {
                if(this.props.mainStore.serverToken.pincode === "true") {
                    this.props.navigation.navigate("LockSet");
                }
            }

        });

        let secret = this.props.mainStore.userToken.userId + this.props.mainStore.serverToken.otpKey;
        if(secret.length > 14) {
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
            <Container style={styles.container}>
                <Header>
                    <Left>
                        <Button transparent>
                            <Icon
                                active
                                name="menu"
                                onPress={() => this.props.navigation.toggleDrawer()}
                            />
                        </Button>
                    </Left>
                    <Body>
                        <Title>{ this.state.title }</Title>
                    </Body>
                    <Right />
                </Header>

                <Content padder>
                    <Card style={{ alignItems: "center", paddingTop: 30 }}>
                        <H3 style={{color: "grey"}}>
                            VERIFY YOUR
                        </H3>
                        <H3 style={{color: "grey"}}>
                            PASSWORD
                        </H3>
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
                            style={{marginTop: 10, width: deviceWidth * 0.8 }}
                            progress={this.state.progress}
                        />
                        {/*</Body>*/}
                        {/*</CardItem>*/}
                        <CardItem>
                            <Row>
                                <Left/>
                                <Right style={{flex: 3}}>
                                    <Text note>{this.state.nextTokenSecond} second(s) left</Text>
                                </Right>
                            </Row>
                        </CardItem>
                    </Card>

                    <View padder>
                        <Button iconLeft rounded block onPress={() => this.props.navigation.navigate("ServerInfo")}>
                            <Icon name='information-circle' />
                            <Text>Detail Information</Text>
                        </Button>
                    </View>
                    <View padder style={{marginTop: -10}}>
                        <Button iconLeft rounded block warning onPress={() => this.timeSync()}>
                            <Icon name='time' />
                            {/*<Text>Time Sync (diff: {Math.abs(this.state.timeDiff) > 1000 ? (this.state.timeDiff/1000).toFixed(0) + " sec" : this.state.timeDiff + " ms"})</Text>*/}
                            <Text>Time Sync</Text>
                        </Button>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default Home;
