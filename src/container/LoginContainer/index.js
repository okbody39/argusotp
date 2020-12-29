import * as React from "react";
import Constants from 'expo-constants';
import {Item, Input, Icon, Form, Toast, View, Button, Text} from "native-base";
import { observer, inject } from "mobx-react";
import axios from "axios";
import {AsyncStorage, Platform} from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import { encrypt, decrypt} from "../../utils/crypt";
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

    };

    componentWillMount() {
        const { loginForm, navigation, mainStore } = this.props;
        let isLogout = navigation.state.params ? navigation.state.params.isLogout : false;

        loginForm.clearStore();

        if (isLogout) {
            mainStore.resetUserStore();
            return;
        }


    }

    componentDidMount() {
        // const { loginForm, navigation, mainStore } = this.props;
        //
        // if (!mainStore.isServerSet) {
        //
        //
        //
        // }
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

            // alert(jsonText);
            jsonObj.result = "True";

            if (jsonObj.result === "True") {

                loginForm.userToken.userId = userId;
                loginForm.userToken.password = password;

                mainStore.serverToken.otpServerIp = serverIp;
                mainStore.serverToken.otpServerPort = serverPort;
                mainStore.serverToken.encKey = jsonObj.encKey;

                mainStore.serverToken.otpKey = jsonObj.reason;
                mainStore.serverToken.period = jsonObj.period;
                mainStore.serverToken.digits = jsonObj.digits;

                mainStore.serverToken.pincodeUse = jsonObj.pincodeUse || "false";
                mainStore.serverToken.pincodeDigits = jsonObj.pincodeDigits || "4";

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

        if (serverIp && serverPort) {
            axios.get("http://" + serverIp + ":" + serverPort + "/otp/encryptKey", {
                crossdomain: true,
            }).then(res => {
                const result = res.data;
                let jsonText = decrypt(result, _DEFAULT_KEY_);

                let jsonObj = JSON.parse(jsonText);

                mainStore.serverToken.otpServerIp = serverIp;
                mainStore.serverToken.otpServerPort = serverPort;
                mainStore.serverToken.encKey = jsonObj.encKey;

                let saveServerInfo = {
                    otpServerIp: serverIp,
                    otpServerPort: serverPort,
                    encKey: jsonObj.encKey,
                };

                mainStore.saveServerStore(saveServerInfo).then(() => {
                    try {
                        mainStore.resetUserStore();
                        // navigation.dispatch(resetAction);
                        // alert(JSON.stringify(settingForm.serverToken));
                    } catch(e) {
                        // alert(JSON.stringify(e));
                    }
                });

            }).catch(err => {
                Toast.show({
                    text: "OTP Server error!",
                    duration: 2000,
                    position: "top",
                    type: "danger",
                    textStyle: { textAlign: "center" },
                });
            });
        } else {
            Toast.show({
                text: "Server IP or Port invalid!",
                duration: 2000,
                position: "top",
                type: "danger",
                textStyle: { textAlign: "center" },
            });
        }
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
                            placeholder="Username"
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
                            placeholder="Password"
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
            <Form>
                <View style={{ marginHorizontal: 8, marginTop: 16, marginBottom: 8 }}>
                    <Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
                        <Icon type={"FontAwesome"} active name="server" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5}}
                            placeholder="Server IP"
                            placeholderTextColor="#c9c9c9"
                            // keyboardType="numeric"
                            value={ loginForm.serverIp }
                            // onChangeText={ e => this.setState({serverIp: e}) }
                            onChangeText={e => loginForm.serverIpOnChange(e) }
                        />
                    </Item>
                </View>
                <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
                    <Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
                        <Icon type={"FontAwesome"} active name="th-large" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5}}
                            placeholder="Server Port"
                            placeholderTextColor="#c9c9c9"
                            keyboardType="numeric"
                            value={ loginForm.serverPort }
                            // onChangeText={ e => this.setState({serverPort: e}) }
                            onChangeText={e => loginForm.serverPortOnChange(e) }
                        />
                    </Item>
                </View>
            </Form>
        );
        return <Login navigation={this.props.navigation}
                      isServerSet={ mainStore.isServerSet }
                      loginForm={ Fields }
                      settingForm={ settingForm }
                      onLogin={() => this.login() }
                      onSave={() => this.onSave() } />;
    }
}
