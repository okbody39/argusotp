import * as React from "react";
import Constants from 'expo-constants';
import { Item, Input, Icon, Form, Toast, View } from "native-base";
import { observer, inject } from "mobx-react";
import axios from "axios";
import { AsyncStorage } from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import { encrypt, decrypt} from "../../utils/crypt";
import Login from "../../stories/screens/Login";

@inject("loginForm", "mainStore")
@observer
export default class LoginContainer extends React.Component {

    constructor(props) {
        super(props);

        const { loginForm } = this.props;

        this.state = {
            userId: loginForm.userId || "",
            password: loginForm.password || "",
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

        let token = await Notifications.getExpoPushTokenAsync();


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

        if (!mainStore.isServerSet) {
            Toast.show({
                text: "Please setting your server first",
                duration: 2000,
                position: "top",
                type: "danger",
                textStyle: { textAlign: "center" },
            });

            return;
        }

        if (mainStore.isLogin) {
            navigation.navigate("Drawer");
        }
    }

    login() {
        const { loginForm, navigation, mainStore } = this.props;
        const { userId, password } = this.state;
        const { version } = Constants.manifest;

        if (!mainStore.isServerSet) {
            Toast.show({
                text: "Please setting your server first",
                duration: 2000,
                position: "top",
                type: "warning",
                textStyle: { textAlign: "center" },
            });

            return;
        }
        // alert("1-1");

        loginForm.validateForm();

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

                mainStore.serverToken.otpKey = jsonObj.reason;
                mainStore.serverToken.period = jsonObj.period;
                mainStore.serverToken.digits = jsonObj.digits;
                mainStore.serverToken.pincodeUse = jsonObj.pincodeUse || "false";
                mainStore.serverToken.pincodeDigits = jsonObj.pincodeDigits || "4";

                mainStore.saveStore(loginForm.userToken, mainStore.serverToken).then(() => {
                    // setTimeout(() => {
                    navigation.navigate("AuthLoading");
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

    render() {
        const form = this.props.loginForm;
        const Fields = (
            <Form>
                <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
                    <Item rounded error={!!form.userIdError} style={{ paddingLeft: 8, paddingTop: 0 }}>
                        <Icon active name="person" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5, color: "lightgray" }}
                            placeholder="Username"
                            placeholderTextColor="#c9c9c9"
                            keyboardType="email-address"
                            autoCapitalize = "none"
                            value={this.state.userId}
                            // onBlur={() => form.validateUserId()}
                            onChangeText={e => this.setState({ userId: e })}
                        />
                    </Item>
                </View>
                <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
                    <Item rounded error={!!form.passwordError} style={{ paddingLeft: 8, paddingTop: 0 }}>
                        <Icon active name="unlock" style={{ color: "lightgray" }} />
                        <Input
                            style={{ marginTop: -5, marginLeft: 3, color: "lightgray" }}
                            placeholder="Password"
                            placeholderTextColor="#c9c9c9"
                            autoCapitalize = "none"
                            value={this.state.password}
                            // onBlur={() => form.validatePassword()}
                            onChangeText={e => this.setState({ password: e })}
                            secureTextEntry={true}
                        />
                    </Item>
                </View>
            </Form>
        );
        return <Login navigation={this.props.navigation} loginForm={Fields} onLogin={() => this.login()} />;
    }
}
