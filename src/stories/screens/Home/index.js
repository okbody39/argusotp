import * as React from "react";
import { Updates } from 'expo';
import {
    Container, Header, Title, Content,
    Text, Button, Icon, Left, Body, Right,
    List, ListItem, Row, Col,
    Card, CardItem,
    H1, H2, H3, View
} from "native-base";

import styles from "./styles";
// import Sparkline from "react-native-sparkline";
import ProgressBar from "react-native-progress-bar";

import OTP from "otp-client";
import md5 from "md5";

import { AsyncStorage } from "react-native";

import { Dimensions, Alert } from "react-native";

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
            token: "000000",
            prevToken: "000000",
            nextToken: "000000",
            nextTokenSecond: 0,
            subTitle: this.props.userId,
            intervalId: null,
            textColor: "#3b5998",
            progress: 0,
            timeDiff: 0,
        };

    }


    componentDidMount() {

        // AsyncStorage.getItem("@ApiKeysStore:period", (err, result) => {
        //   if (err) {
        //     return;
        //   }
        //   this.setState({period: parseInt(result)});
        // });
        //
        // AsyncStorage.getItem("@ApiKeysStore:digits", (err, result) => {
        //   if (err) {
        //     return;
        //   }
        //   this.setState({digits: parseInt(result)});
        // });
        //
        // AsyncStorage.getItem("@ApiKeysStore:otpKey", (err, result) => {
        //   if (err) {
        //     return;
        //   }
        //   this.setState({otpKey: result});
        // });

        setTimeout(() => {
            let checkUrl = this.props.mainStore.getServerUrl() + "/otp/epoch";

            // alert(checkUrl);

            axios.get(checkUrl, {
                crossdomain: true,
            }).then(res => {
                const result = res.data;
                let myTime = new Date().valueOf();
                let diff = result.epoch - myTime;

                // alert(result.epoch + " - " + myTime + " = " + diff);

                this.setState({
                    timeDiff: diff,
                })

            });
        }, 500);

        let secret = this.props.mainStore.userToken.userId + this.props.mainStore.serverToken.otpKey;
        if(secret.length > 14) {
            secret = md5(secret).substr(0, 14);
        }

        // alert(secret);

        let intervalId = setInterval(() => {

            const { mainStore } = this.props;

            // console.log(settingForm);

            if (!mainStore.isServerSet) {
                return;
            }

            let options = {
                algorithm: "sha1",
                digits: parseInt(mainStore.serverToken.digits),
                period: parseInt(mainStore.serverToken.period),
                epoch: ( new Date().valueOf() + this.state.timeDiff ), //null, // new Date() / 1000,
            };

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

            if(timeLeft === this.rdm) {
                // this.prop.mainStore.loadStore().then(() => {
                //    alert(mainStore.userToken.userId + "/" + mainStore.userToken.deviceId);
                // });

                // alert(this.rdm);

                let checkUrl = mainStore.getServerUrl() + "/otp/checkMissingDevice/" + mainStore.userToken.userId + "/" + mainStore.userToken.deviceId;
                let startTime = new Date().valueOf();

                axios.get(checkUrl, {
                    crossdomain: true,
                }).then(res => {
                    const result = res.data;

                    let jsonText = decrypt(result, mainStore.serverToken.encKey);
                    let jsonObj = JSON.parse(jsonText);

                    // alert(jsonText);

                    if (jsonObj.isMissingDevice === "True") {

                        mainStore.resetStore().then(() => {

                            Alert.alert(
                                'Warning',
                                //body
                                ' Your device is not allowed to access...',
                                [
                                    {text: 'Exit', onPress: () => mainStore.resetUserStore().then(() => {
                                            Updates.reload();
                                        })},
                                ],
                                { cancelable: false }
                            );

                            // this.props.navigation.dispatch(
                            //     StackActions.reset(
                            //         {
                            //             index: 0,
                            //             key: null,
                            //             actions: [NavigationActions.navigate({routeName: "Logout"})],
                            //         }
                            //     )
                            // );
                        });
                    } else if (jsonObj.isMissingDevice === "PolicyChanged") {
                        // let _serverToken = {
                        //     period: jsonObj.period,
                        //     digits: jsonObj.digits,
                        // };
                        //
                        // mainStore.saveServerStore(_serverToken);

                        Alert.alert(
                            'Policy Update',
                            //body
                            'Restart app to finish accepting changed policy.',
                            [
                                {text: 'Restart', onPress: () => mainStore.resetUserStore().then(() => {
                                        Updates.reload();
                                    })},
                            ],
                            { cancelable: false }
                        );


                            // setTimeout(() => {
                            //     mainStore.resetUserStore().then(() => {
                            //         Updates.reload();
                            //     });
                            // }, 500);


                        // loginForm.userToken.userId = loginForm.userId;
                        // loginForm.userToken.password = loginForm.password;
                        //
                        // mainStore.serverToken.otpKey = jsonObj.reason;
                        // mainStore.serverToken.period = jsonObj.period;
                        // mainStore.serverToken.digits = jsonObj.digits;
                        //
                        // mainStore.saveStore(loginForm.userToken, mainStore.serverToken).then(() => {
                        //     // setTimeout(() => {
                        //     navigation.navigate("AuthLoading");
                        //     // }, 500);
                        // });


                    } else {
                        let myTime = new Date().valueOf();
                        let responseTime = myTime - startTime;
                        let diff = parseInt( jsonObj.time - ( myTime - ( responseTime * 3 / 4 ) ) );

                        this.setState({
                            timeDiff: diff,
                        });
                    }
                });
            }

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
                        <Title>OTP</Title>
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
                        <Button block onPress={() => this.props.navigation.navigate("ServerInfo")}>
                            <Text>Detail Information</Text>
                        </Button>
                    </View>
                    <View padder style={{marginTop: -10}}>
                        <Button block warning onPress={() => this.timeSync()}>
                            <Text>Time Sync (diff: {this.state.timeDiff > 1000 ? this.state.timeDiff/1000 + "s" : this.state.timeDiff + "ms"})</Text>
                        </Button>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default Home;
