
const __LICENSESERVER__ = "192.168.1.2:9000";


import * as React from "react";
import Constants from 'expo-constants';
import { Item, Input, Icon, Form, Toast, View, Button, Text } from "native-base";
import { observer, inject } from "mobx-react";
import axios from "axios";
import { AsyncStorage, Platform } from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import SmoothPinCodeInput from "react-native-smooth-pincode-input";

import { encrypt, decrypt, encryptStr, decryptStr} from "../../utils/crypt";
import Login from "../../stories/screens/Login";

const platform = Platform.OS;
const _DEFAULT_KEY_ = "MyScret-YESJYHAN";

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

        const token = await Notifications.getExpoPushTokenAsync();
        loginForm.setPushInfo(token);

        const deviceId = Constants.deviceId;
        loginForm.setDeviceId(deviceId);

        mainStore.loadStore();

        loginForm.compCodeOnChange(mainStore.serverToken.compCode);

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
            navigation.navigate("Home");
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
                    // setTimeout(() => {

                    // alert(">>> 1 <<<" + JSON.stringify(mainStore));

                    navigation.navigate("Home");
                    // }, 500);
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

        // alert(JSON.stringify(mainStore));

        let data = {
            username: "",
            sitecode: loginForm.compCode,
            pushtoken: loginForm.userToken.pushToken,
            deviceid: loginForm.userToken.deviceid,
            app: "ArgusOTP",
            appversion: Constants.manifest.version,
            phone: "",
            email: "",
        };
        let enc = encodeURIComponent(encryptStr(data));

        axios.get("http://" + __LICENSESERVER__+ "/api/register?enc="+enc, {
            // enc : enc,
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
            } catch(e) {
                throw "COMPCODE-ERR";
            }

            result.desc = JSON.parse(result.desc);

            // alert(result.desc.serverIP + ":" + result.desc.serverPort);

            let serverIP = result.desc.serverIP;
            let serverPort = result.desc.serverPort;



            if(serverIP && serverPort) {
                //
            } else {
                throw "COMPCODE-ERR";
            }

            axios.get("http://" + serverIP + ":" + serverPort + "/otp/encryptKey", {
                crossdomain: true,
            }).then(res => {
                const result = res.data;

                let jsonText = decrypt(result, _DEFAULT_KEY_);
                let jsonObj = JSON.parse(jsonText);

                // mainStore.serverToken.otpServerIp = serverIP;
                // mainStore.serverToken.otpServerPort = serverPort;
                // mainStore.serverToken.encKey = jsonObj.encKey;


                let saveServerInfo = {
                    otpServerIp: serverIP,
                    otpServerPort: serverPort,
                    encKey: jsonObj.encKey,
                    compCode: loginForm.compCode,
                };

                mainStore.saveServerStore(saveServerInfo).then(() => {
                    try {

                        // alert(JSON.stringify(saveServerInfo));
                        mainStore.resetUserStore();
                        // navigation.dispatch(resetAction);
                        // alert(JSON.stringify(settingForm.serverToken));

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
                // }).catch(err => {
                //     alert(JSON.stringify(err));
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

        }).catch(err => {
            let errorMsg = "라이선스 서버 에러";
            if(err === "COMPCODE-ERR") {
                errorMsg = "회사코드를 다시 확인해 주세요.";
            }

            Toast.show({
                text: errorMsg,
                duration: 5000,
                position: "top",
                type: "danger",
                textStyle: { textAlign: "center" },
            });
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
            // <Form>
            //     <View style={{ marginHorizontal: 8, marginTop: 16, marginBottom: 8 }}>
            //         <Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
            //             <Icon type={"FontAwesome"} active name="server" style={{ color: "lightgray" }} />
            //             <Input
            //                 style={{ marginTop: -5}}
            //                 placeholder="Server IP"
            //                 placeholderTextColor="#c9c9c9"
            //                 // keyboardType="numeric"
            //                 value={ loginForm.serverIp }
            //                 // onChangeText={ e => this.setState({serverIp: e}) }
            //                 onChangeText={e => loginForm.serverIpOnChange(e) }
            //             />
            //         </Item>
            //     </View>
            //     <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
            //         <Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
            //             <Icon type={"FontAwesome"} active name="th-large" style={{ color: "lightgray" }} />
            //             <Input
            //                 style={{ marginTop: -5}}
            //                 placeholder="Server Port"
            //                 placeholderTextColor="#c9c9c9"
            //                 keyboardType="numeric"
            //                 value={ loginForm.serverPort }
            //                 // onChangeText={ e => this.setState({serverPort: e}) }
            //                 onChangeText={e => loginForm.serverPortOnChange(e) }
            //             />
            //         </Item>
            //     </View>
            // </Form>
        );
        return <Login navigation={this.props.navigation}
                      isServerSet={ mainStore.isServerSet }
                      loginForm={ Fields }
                      settingForm={ settingForm }
                      onLogin={() => this.login() }
                      onSave={() => this.onSave() } />;
    }
}
