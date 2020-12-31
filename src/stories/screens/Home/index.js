import * as React from "react";
import { Updates } from 'expo';
import {
    Container, Header, Title, Content,
    Text, Button, Icon, Left, Body, Right,
    List, ListItem, Row, Col, Grid,
    Card, CardItem, Toast,
    H1, H2, H3, View, Form, Item, Input
} from "native-base";
import {NavigationEvents} from 'react-navigation';
import * as LocalAuthentication from 'expo-local-authentication';


import styles from "./styles";
// import Sparkline from "react-native-sparkline";
import ProgressBar from "react-native-progress-bar";
import CardFlip from 'react-native-card-flip';

import OTP from "otp-client";
import md5 from "md5";

import {AsyncStorage, Dimensions, Alert, AppState, TouchableOpacity, Image} from "react-native";

// const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

import PINSetting from "../../../component/PINSetting";
import { TextLetterSpacing } from "./TextLetterSpacing";
import axios from "axios";
import {decrypt} from "../../../utils/crypt";
import {NavigationActions, StackActions} from "react-navigation";
import Constants from "expo-constants";
import platform from "../../../theme/variables/platform";

// var ProgressBar = require("react-native-progress-bar");

class Home extends React.Component {

    constructor(props) {
        super(props);

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
            pinMode: false,
            pinCode: "",
            pinDigits: 4,

            compatible: false,
            fingerprints: false,
            result: '',
        };

    }

    checkDeviceForHardware = async () => {
        let compatible = await LocalAuthentication.hasHardwareAsync();
        this.setState({ compatible });
    };

    checkForFingerprints = async () => {
        let fingerprints = await LocalAuthentication.isEnrolledAsync();
        this.setState({ fingerprints });
    };

    scanFingerprint = async () => {
        let result = await LocalAuthentication.authenticateAsync(
            Platform.OS === "ios" ? "지문을 입력해주세요" : "ArgusOTP 인증"
        );

        if(result.success) {
            if(this.card) this.card.flip();
            this.setState({
                settingMode: false,
            });
            setTimeout(() => {
                if(this.card) this.card.flip();
            }, 30000);

        } else {
            // alert(JSON.stringify(result));

            if(result.error === "user_cancel") {
                //
            } else {
                Alert.alert(
                    "생체 인증",
                    "생체 인증에 실패하였습니다. - " + result.error,
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ],
                    { cancelable: false }
                );
            }

        }

    };

    // showAndroidAlert = () => {
    //     Alert.alert(
    //         'Fingerprint Scan',
    //         'Place your finger over the touch sensor and press scan.',
    //         [
    //             {
    //                 text: 'Scan',
    //                 onPress: () => {
    //                     this.scanFingerprint();
    //                 },
    //             },
    //             {
    //                 text: 'Cancel',
    //                 onPress: () => console.log('Cancel'),
    //                 style: 'cancel',
    //             },
    //         ]
    //     );
    // };

    componentWillUnmount() {
    }

    componentDidMount() {
        const { mainStore } = this.props;

        this.checkDeviceForHardware();
        this.checkForFingerprints();

        // alert(mainStore.getServerUrl() + "/otp/checkConfig/" + mainStore.userToken.userId);

        axios.get(mainStore.getServerUrl() + "/otp/checkConfig/" + mainStore.userToken.userId, {
            crossdomain: true,
        }).then(res => {
            const result = res.data;
            let jsonText = decrypt(result, mainStore.serverToken.encKey);
            let jsonObj = JSON.parse(jsonText);

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
                  '정책 업데이트',
                  '정책이 변동되어 적용을 위해 앱을 재기동합니다.',
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
                  '정책 업데이트',
                  '변경된 정책을 적용하기 위해 앱을 재기동합니다.',
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

            } else if (jsonObj.deviceid === "__PINRESET__") {
                Alert.alert(
                    'PIN 삭제',
                    'PIN 정보를 삭제하기위해 앱을 재기동합니다.',
                    [
                        {
                            text: 'Restart', onPress: () => {
                                AsyncStorage.removeItem("@SeedAuthStore:lockToken").then(() => {
                                    Updates.reload();
                                });
                            }
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
                  '경고',
                  '본 기기는 분실 신고된 단말기입니다! 불법적으로 사용시 형사처벌 대상이 됩니다.',
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

        }).catch( reason => {
            Alert.alert('Error', reason.message );
            console.log(reason.message);
        });

        // AppState.addEventListener('change', this._handleAppStateChange);

        AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {

            if(lockPass) {
                this.setState({
                    pinMode: true,
                    pinCode: lockPass,
                    pinDigits: mainStore.serverToken.pincodeDigits,
                });
                // this.props.navigation.navigate("Lock", {
                //     mainStore: this.props.mainStore,
                //     // serverUrl: this.props.mainStore.getServerUrl(),
                //     // userid: this.props.mainStore.userToken.userId,
                // });
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

            const { mainStore, navigation } = this.props;

            if (!mainStore.isServerSet) {
                navigation.navigate("Login");
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
        const { mainStore } = this.props;

        let checkUrl = mainStore.getServerUrl() + "/otp/epoch";

        axios.get(checkUrl, {
            crossdomain: true,
        }).then(res => {
            const result = res.data;
            let myTime = new Date().valueOf();
            let diff = result.epoch - myTime;

            // alert(result.epoch + " - " + myTime + " = " + diff);

            Toast.show({
                text: "시간 동기화 성공 ... " + (diff > 1000 ? "(" + diff + " ms)" : ""),
                // buttonText: "OK",
                position: "top",
                type: "success",
                duration: 2500,
                textStyle: { textAlign: "center" },
            });

            this.setState({
                timeDiff: diff,
            })

        });
    }

    render() {
        const { mainStore } = this.props;

        return (

            <Container style={styles.container}  style={{ backgroundColor: "#2D2B2C" }}>
                <NavigationEvents onDidFocus={() => {
                    AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {
                        if(lockPass) {
                            // alert(lockPass);
                            this.setState({
                                pinMode: true,
                                pinCode: lockPass,
                            });
                        } else {
                            this.setState({
                                pinMode: false,
                                pinCode: lockPass,
                            });
                        }
                    });
                }} />
                <Content padder>

                    {/*<Body>*/}
                    <Row style={{ marginTop: 20, marginBottom: 25, marginHorizontal: 10 }}>
                        <Title style={{ color: "#60B0F4", fontWeight: "bold", fontSize: 22 }}>{ this.state.title }</Title>
                        <Right style={{ marginTop: 8 }}>
                            <Text style={{color: "gray"}}>v{Constants.manifest.version}</Text>
                        </Right>
                    </Row>
                    {/*</Body>*/}

                    <View style={{ padding: 4 }}>
                        <CardFlip ref={(card) => this.card = card}  style={{
                            // width: 320,
                            height: 250,
                        }}>
                            {
                                this.state. pinMode ?
                                this.state. pinCode === "__BIOAUTH__" ?

                                    <TouchableOpacity style={{
                                        height: 250,
                                    }} onPress={() => {
                                        this.scanFingerprint();

                                    }} >
                                        <Card style={{ justifyContent: "center", height: 200, borderRadius: 10 }} >
                                            <CardItem>
                                                <Body style={{ alignItems: "center" }} >
                                                    <Text style={{ fontSize: 20, color: "grey", marginBottom: 8 }} >생체 인증이 필요합니다.</Text>
                                                    <Text style={{ fontSize: 20, color: "grey", marginBottom: 28 }} >아래를 클릭 해주세요.</Text>
                                                    <Icon type="FontAwesome5" name="fingerprint" style={{ fontSize: 70, color: "lightgrey" }} />
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </TouchableOpacity>

                                    :
                                    <View style={{ backgroundColor: "white", borderRadius: 10, paddingTop: 30, height: 250 }} >
                                        <View style={{ alignItems: "center" }} >
                                            <H3 style={{ color: "grey", marginTop: 5, marginBottom: 8 }}>
                                                ENTER YOUR PIN
                                            </H3>
                                            <PINSetting color="#2D2B2C" password={ this.state.pinCode } digits={ this.state.pinDigits } onSuccess={(res) => {
                                                if(res === "OK") {
                                                    this.card.flip();
                                                    setTimeout(() => this.card.flip(), 30000);
                                                }
                                            }}/>
                                        </View>
                                    </View>
                                :

                                    <TouchableOpacity style={{
                                        height: 250,
                                    }} onPress={() => {
                                        if(this.card) this.card.flip();
                                        this.setState({
                                           settingMode: false,
                                        });
                                        setTimeout(() => {
                                            if(this.card) this.card.flip();
                                        }, 30000);
                                    }} >
                                        <Card style={{ justifyContent: "center", height: 200, borderRadius: 10 }} >
                                            <CardItem>
                                                <Body style={{ alignItems: "center" }} >
                                                    <H3 style={{ color: "grey", marginBottom: 8 }}>
                                                        CHECK PASSWORD
                                                    </H3>
                                                    <H2 style={{ color: "grey", marginBottom: 0, fontWeight: "bold" }}>
                                                        CLICK!
                                                    </H2>
                                                    <Icon type="FontAwesome5" active name="hand-point-up" style={{ color: "lightgray", fontSize: 60 }} />
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </TouchableOpacity>
                                }

                                <Card style={{ alignItems: "center", justifyContent: "center", height: 250, borderRadius: 10 }}>
                                    {/*<Text style={{ color: "grey", fontSize: 17 }}>*/}
                                    {/*    {this.props.mainStore.userToken.userId}'s*/}
                                    {/*</Text>*/}
                                    <H3 style={{color: "grey"}}>
                                        ONE-TIME PASSWORD
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
                                            <Left>

                                            </Left>
                                            <Right style={{ marginRight: 13 }}>
                                                <Text note>{this.state.nextTokenSecond} 초 남음</Text>
                                            </Right>
                                        </Row>
                                    </CardItem>
                                </Card>
                            {/*</TouchableOpacity>*/}
                        </CardFlip>

                    </View>

                    <Body style={{ alignItems: "center", paddingTop: 40 }}>
                        <Image
                        source={require("../../../../assets/argusotp-logo-allwhite.png")}
                        style={{ height: 50,  resizeMode: 'contain', opacity: 0.1 }}
                    />
                    </Body>

                </Content>

                <View style={{ backgroundColor: "#2D2B2C" }}>
                    <View padder style={{
                        backgroundColor: "#60B0F4", borderTopLeftRadius: 30, borderTopRightRadius: 30,
                        height: this.state.settingMode ? 400 : 65 }} >
                        {/*<View style={{width: 80, height: 8, borderRadius: 5, backgroundColor: "lightgray"}}></View>*/}
                        <Button transparent block info onPress={() => this.setState({settingMode : !this.state.settingMode})}>
                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                { this.state.settingMode ? "닫기" : "메뉴" }
                            </Text>
                        </Button>
                        {
                            this.state.settingMode ?
                                <View padder>
                                    <Button rounded block
                                            style={{ backgroundColor: "#2D2B2C", marginBottom: 8 }}
                                            onPress={() => {
                                                this.setState({
                                                    settingMode: false,
                                                });
                                                this.props.navigation.navigate("LockSet");
                                            }} >
                                        {/*<Icon name='information-circle' />*/}
                                        <Text>인증 설정</Text>
                                    </Button>
                                {/*</View>*/}
                                {/*<View padder style={{ marginTop: -10 }}>*/}
                                    <Button rounded block
                                            style={{ backgroundColor: "#2D2B2C", marginBottom: 8 }}
                                            onPress={() => {
                                                this.setState({
                                                    settingMode: false,
                                                });
                                                this.timeSync();
                                            }} >
                                        {/*<Icon name='time' />*/}
                                        {/*<Text>Time Sync (diff: {Math.abs(this.state.timeDiff) > 1000 ? (this.state.timeDiff/1000).toFixed(0) + " sec" : this.state.timeDiff + " ms"})</Text>*/}
                                        <Text>시간 동기화</Text>
                                    </Button>
                                    <Button rounded block
                                            danger
                                            // style={{ backgroundColor: "#2D2B2C" }}
                                            onPress={() => {

                                                this.props.mainStore.resetUserStore();

                                                setTimeout(() => {
                                                    this.props.navigation.dispatch(
                                                        StackActions.reset(
                                                            {
                                                                index: 0,
                                                                key: null,
                                                                actions: [NavigationActions.navigate({ routeName: "Logout", params: { isLogout: true }})],
                                                            })
                                                    );
                                                }, 100);

                                            }} >
                                        {/*<Icon name='time' />*/}
                                        {/*<Text>Time Sync (diff: {Math.abs(this.state.timeDiff) > 1000 ? (this.state.timeDiff/1000).toFixed(0) + " sec" : this.state.timeDiff + " ms"})</Text>*/}
                                        <Text>로그아웃</Text>
                                    </Button>

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
