import {NavigationActions, StackActions} from "react-navigation";

const __LICENSESERVER__ = "argus.cielcloud.co.kr:9000";
const _DEFAULT_KEY_ = "MyScret-YESJYHAN";

import * as React from "react";
import Constants from 'expo-constants';
import { Item, Input, Icon, Form, Toast, View, Button, Text } from "native-base";
import { observer, inject } from "mobx-react";
import axios from "axios";
import {Alert, AsyncStorage, Platform} from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import SmoothPinCodeInput from "react-native-smooth-pincode-input";

import {
    encrypt, decrypt, // ArgusOTP Server communication
    encryptStr, decryptStr // License Server communication
} from "../../utils/crypt";

import Login from "../../stories/screens/Login";

const platform = Platform.OS;

@inject("loginForm", "mainStore")
@observer
export default class LoginContainer extends React.Component {

    constructor(props) {
        super(props);

        const { loginForm, mainStore, navigation } = this.props;

        // if (mainStore.isLogin) {
        //     navigation.navigate("Home");
        // }

        this.state = {
            userId: loginForm.userId || "",
            password: loginForm.password || "",
            serverIp: loginForm.serverIp || "",
            serverPort: loginForm.serverPort || "",
            settingMode: false,
            // errorCount: 0,
            // errorLastDate: new Date().getTime(),
        }

        this._bootstrapAsync();


    }

    _bootstrapAsync = async () => {
        const { loginForm, mainStore } = this.props;
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                sound: true,
                // importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#0080FF',
            });
        }

        const token = await Notifications.getExpoPushTokenAsync();
        loginForm.setPushInfo(token);

        const deviceId = Constants.deviceId;
        loginForm.setDeviceId(deviceId);

        await mainStore.loadStore();

        loginForm.compCodeOnChange(mainStore.serverToken.compCode);

        // AsyncStorage.getItem("@ArgusOTPStore:errorCount").then(errText => {
        //     let errJson = JSON.parse(errText);
        //     let errCnt = 0;
        //     let errDate = new Date().getTime();
        //
        //
        //     if(errJson.cnt) {
        //         errCnt = parseInt(errJson.cnt);
        //         errDate = errJson.dt;
        //     }
        //
        //     this.setState({
        //         errorCount: errCnt,
        //         errorLastDate: errDate,
        //     });
        //
        // });


    };

    componentWillMount() {
        const { loginForm, navigation, mainStore } = this.props;
        let isLogout = navigation.state.params ? navigation.state.params.isLogout : false;

        if (isLogout) {
            loginForm.clearStore();
            mainStore.resetUserStore();
            return;
        }

    }

    componentDidMount() {
        const { loginForm, navigation, mainStore } = this.props;

        if (mainStore.isServerSet && mainStore.isLogin) {
            // navigation.navigate("Home");
            setTimeout(() => {
                this.props.navigation.dispatch(
                    StackActions.reset(
                        {
                            index: 0,
                            key: null,
                            actions: [NavigationActions.navigate({ routeName: "Home"})],
                        })
                );
            }, 100);
        }
    }


    login() {
        const { loginForm, navigation, mainStore } = this.props;
        const { userId, password, serverIp, serverPort } = loginForm;
        const { version } = Constants.manifest;

        if (!mainStore.isServerSet) {

            Toast.show({
                text: "먼저 서버 셋팅을 진헹해 주세요.",
                duration: 2000,
                position: "top",
                type: "warning",
                textStyle: { textAlign: "center" },
            });

            return;
        }
        // alert("1-1");

        loginForm.validateLoginForm();

        const formPayload = {
            userid: userId,
            userpassword: password,
            pushToken: loginForm.userToken.pushToken,
            deviceId: loginForm.userToken.deviceId,
            appVersion: version,
            code: "",
        };

        // alert();

        let encryptedHex = encrypt(JSON.stringify(formPayload), mainStore.serverToken.encKey);

        // alert(JSON.stringify(mainStore));

        axios.get(mainStore.getServerUrl() + "/otp/register/" + encryptedHex, {
            // timeout: 5000,
            crossdomain: true,
        }).then(res => {
            const result = res.data;

            let jsonText = decrypt(result, mainStore.serverToken.encKey);
            let jsonObj = JSON.parse(jsonText);

            // alert("OTP-REGISTER >>> "+jsonText);
            // jsonObj.result = "True";

            if (jsonObj.result === "True") {

                loginForm.userToken.userId = userId;
                loginForm.userToken.password = password;

                // mainStore.serverToken.otpServerIp = serverIp;
                // mainStore.serverToken.otpServerPort = serverPort;

                // mainStore.serverToken.encKey = jsonObj.encKey;

                mainStore.serverToken.otpKey = jsonObj.reason;
                mainStore.serverToken.period = jsonObj.period;
                mainStore.serverToken.digits = jsonObj.digits;

                mainStore.serverToken.pincodeUse = jsonObj.pincodeUse || "false";
                mainStore.serverToken.pincodeDigits = jsonObj.pincodeDigits || "4";

                // alert(JSON.stringify(mainStore.serverToken));

                mainStore.saveStore(loginForm.userToken, mainStore.serverToken).then(() => {
                    setTimeout(() => {
                        this.props.navigation.dispatch(
                            StackActions.reset(
                                {
                                    index: 0,
                                    key: null,
                                    actions: [NavigationActions.navigate({ routeName: "Home"})],
                                })
                        );
                    }, 100);
                });

            } else {

                loginForm.clearStore();
                mainStore.resetUserStore();

                Toast.show({
                    text: jsonObj.reason,
                    duration: 2000,
                    position: "top",
                    textStyle: { textAlign: "center" },
                });
            }

        }).catch(err => {
            alert(err);
        });

    }

    onSave() {
        const { loginForm, mainStore } = this.props;
        const { serverIp, serverPort } = loginForm;

        let data = {
            username: "",
            sitecode: loginForm.compCode,
            pushtoken: loginForm.userToken.pushToken,
            deviceid: loginForm.userToken.deviceId,
            app: "ArgusOTP",
            appversion: Constants.manifest.version,
            phone: "",
            email: "",
        };
        let enc = encodeURIComponent(encryptStr(data));

        axios.get("http://" + __LICENSESERVER__+ "/api/register?enc="+enc, {
            // enc : enc,
            timeout: 3000,
            crossdomain: true,
        }).then(rst => {
            let result = {
                sitename: "",
                desc: "{}",
                status: "N",
                contact: ""
            }

            try {
                result = decryptStr(rst.data, result);
                result.desc = JSON.parse(result.desc);
            } catch(e) {
                throw "COMPCODE-ERR";
            }

            if(!result.desc.serverIP) {
                throw "COMPCODE-ERR";
            }

            let serverIP = result.desc.serverIP;
            let serverPort = result.desc.serverPort;

            if(serverIP && serverPort) {
                //
            } else {
                throw "COMPCODE-ERR";
            }

            Alert.alert(
                '확인',
                `당신은 [${result.sitename}]의 사용자가 맞습니까?`,
                [
                    {
                        text: '아니오',
                        onPress: () => {
                            Toast.show({
                                text: '회사코드를 다시 확인해주세요.',
                                position: "top",
                                // buttonText: "OK",
                                type: "warning",
                                duration: 2000,
                                textStyle: { textAlign: "center" },
                            });
                        },
                        style: 'cancel'
                    },
                    { text: '맞습니다',
                        onPress: () => {
                            axios.get("http://" + serverIP + ":" + serverPort + "/otp/encryptKey", {
                                crossdomain: true,
                            }).then(res => {
                                const result = res.data;

                                let jsonText = decrypt(result, _DEFAULT_KEY_);
                                let jsonObj = JSON.parse(jsonText);

                                let saveServerInfo = {
                                    otpServerIp: serverIP,
                                    otpServerPort: serverPort,
                                    encKey: jsonObj.encKey,
                                    compCode: loginForm.compCode,
                                };

                                mainStore.saveServerStore(saveServerInfo).then(() => {
                                    try {

                                        mainStore.resetUserStore();
                                        AsyncStorage.removeItem("@ArgusOTPStore:errorCount");

                                        Toast.show({
                                            text: "정상적으로 설정되었습니다.",
                                            duration: 5000,
                                            position: "top",
                                            type: "success",
                                            textStyle: { textAlign: "center" },
                                        });

                                    } catch(e) {
                                        // alert(JSON.stringify(e));
                                    }
                                });

                            }).catch(err => {
                                // alert(JSON.stringify(err));
                                Toast.show({
                                    text: "OTP 서버 오류",
                                    duration: 5000,
                                    position: "top",
                                    type: "danger",
                                    textStyle: { textAlign: "center" },
                                });
                            });
                        }
                    }
                ],
                { cancelable: false }
            );

        }).catch(err => {
            if(err === "COMPCODE-ERR") {

                AsyncStorage.getItem("@ArgusOTPStore:errorCount").then(errText => {
                    let errJson = JSON.parse(errText);
                    let errCnt = 0;
                    let errDate = new Date().getTime();

                    if(errJson && errJson.cnt) {
                        errCnt = errJson.cnt;
                        errDate = errJson.cnt > 5 ? errDate : errJson.dt;
                    }

                    errCnt ++;

                    Toast.show({
                        text: "회사코드를 다시 확인해 주세요. "  + (errCnt > 1 ? "(" + errCnt + " / 5)" : "" ),
                        duration: 5000,
                        position: "top",
                        type: "danger",
                        textStyle: { textAlign: "center" },
                    });

                    AsyncStorage.setItem("@ArgusOTPStore:errorCount", JSON.stringify({ cnt: errCnt, dt: errDate }));

                });

            } else {
                Toast.show({
                    text: "라이선스 서버 에러",
                    duration: 5000,
                    position: "top",
                    type: "danger",
                    textStyle: { textAlign: "center" },
                });
            }


        });

    }

    render() {
        const { loginForm, mainStore } = this.props;

        const Fields = (
            <Form>
                <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
                    <Item rounded error={!!loginForm.userIdError} style={{ paddingLeft: 8, paddingTop: 0 }}>
                        <Icon active name="person" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5, color: "lightgray" }}
                            placeholder="아이디"
                            placeholderTextColor="#c9c9c9"
                            keyboardType="email-address"
                            autoCapitalize = "none"
                            value={ loginForm.userId }
                            // onBlur={() => form.validateUserId()}
                            // onChangeText={e => this.setState({ userId: e })}
                            onChangeText={e => loginForm.userIdOnChange(e) }
                        />
                    </Item>
                </View>
                <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
                    <Item rounded error={!!loginForm.passwordError} style={{ paddingLeft: 8, paddingTop: 0 }}>
                        <Icon active name="unlock" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5, marginLeft: 3, color: "lightgray" }}
                            placeholder="비밀번호"
                            placeholderTextColor="#c9c9c9"
                            autoCapitalize = "none"
                            value={loginForm.password}
                            // onBlur={() => form.validatePassword()}
                            // onChangeText={e => this.setState({ password: e })}
                            onChangeText={e => loginForm.passwordOnChange(e) }
                            secureTextEntry={true}
                        />
                    </Item>
                </View>
            </Form>
        );

        let settingForm = (
            <View style={{ alignItems: "center",  marginHorizontal: 8, marginTop: 16, marginBottom: 18 }}>
                <Text style={{
                    color: "white",
                    // fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 8,
                }}>회사 코드</Text>
                <SmoothPinCodeInput // password mask="﹡"
                                    cellSize={45}
                                    codeLength={6}
                                    value={loginForm.compCode}
                                    cellStyle={{
                                        borderWidth: 2,
                                        borderRadius: 5,
                                        borderColor: 'grey',
                                        backgroundColor: 'white',
                                    }}
                                    cellStyleFocused={{
                                        borderWidth: 2,
                                        borderColor: 'black',
                                        backgroundColor: 'white',
                                    }}
                                    onTextChange={code => loginForm.compCodeOnChange(code)}/>
            </View>
        );

        return (<Login navigation={this.props.navigation}
                      isServerSet={ mainStore.isServerSet }
                      loginForm={ Fields }
                      settingForm={ settingForm }
                      onLogin={() => this.login() }
                      onSave={() => {
                          AsyncStorage.getItem("@ArgusOTPStore:errorCount").then(errText => {
                              let errJson = JSON.parse(errText);
                              let errCnt = 0;
                              let errDate = new Date().getTime();

                              if(errJson && errJson.cnt) {
                                  errCnt = errJson.cnt;
                                  errDate = errJson.dt;
                              }

                              // alert(errCnt+" ::: " +errDate);

                              // 5회 이상이면 10분 미만
                              if(errCnt >= 5) {
                                  let curTime = new Date().getTime();

                                  if((curTime - errDate) < (10 * 60 * 1000)) {
                                      Toast.show({
                                          text: "최대 시도횟수 초과! ("+Math.round(10-((curTime - errDate)/1000/60), 0)+"분후 가능)",
                                          duration: 10000,
                                          position: "top",
                                          type: "danger",
                                          textStyle: { textAlign: "center" },
                                      });

                                      return;

                                  }
                              }

                              // 5회 이상이고 10분 지났으면
                              // 5회 미만

                              this.onSave();
                          });
                      }} />);
    }
}
