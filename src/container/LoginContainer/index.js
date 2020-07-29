import * as React from "react";
import Constants from 'expo-constants';
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react";
// import aesjs from "aes-js";
import axios from "axios";
import { AsyncStorage } from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import { encrypt, decrypt} from "../../utils/crypt";
import Login from "../../stories/screens/Login";

export interface Props {
    navigation: any,
    loginForm: any,
}
export interface State {}

@inject("loginForm", "mainStore")
@observer
export default class LoginContainer extends React.Component<Props, State> {
    userIdInput: any;
    pwdinput: any;

    constructor(props) {
        super(props);

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
        const { version } = Constants.manifest;

        if (!mainStore.isServerSet) {
            Toast.show({
                text: "Please setting your server first",
                duration: 2000,
                position: "top",
                textStyle: { textAlign: "center" },
            });

            return;
        }
        // alert("1-1");

        loginForm.validateForm();

        // alert("1-2 : " + loginForm.isValid);
        if (loginForm.isValid) {

            const formPayload = {
                userid: loginForm.userId,
                userpassword: loginForm.password,
                pushToken: loginForm.userToken.pushToken,
                deviceId: loginForm.userToken.deviceId,
                appVersion: version,
                code: "",
            };

            // alert();

            let encryptedHex = encrypt(JSON.stringify(formPayload), mainStore.serverToken.encKey);

            // console.log(encryptedHex);

            axios.get(mainStore.getServerUrl() + "/otp/register/" + encryptedHex, {
                // timeout: 5000,
                crossdomain: true,
            }).then(res => {
                const result = res.data;

                let jsonText = decrypt(result, mainStore.serverToken.encKey);
                let jsonObj = JSON.parse(jsonText);

                // alert(jsonText);

                if (jsonObj.result === "True") {

                    loginForm.userToken.userId = loginForm.userId;
                    loginForm.userToken.password = loginForm.password;

                    mainStore.serverToken.otpKey = jsonObj.reason;
                    mainStore.serverToken.period = jsonObj.period;
                    mainStore.serverToken.digits = jsonObj.digits;

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


        } else {
            // alert("2");
            Toast.show({
                text: "Username or password invalid!",
                duration: 2000,
                position: "top",
                textStyle: { textAlign: "center" },
            });
        }
    }

    render() {
        const form = this.props.loginForm;
        const Fields = (
            <Form>
                <Item error={!!form.userIdError}>
                    <Icon active name="person" />
                    <Input
                        placeholder="User ID"
                        placeholderTextColor="#c9c9c9"
                        keyboardType="email-address"
                        autoCapitalize = "none"
                        ref={c => (this.userIdInput = c)}
                        value={form.userId}
                        onBlur={() => form.validateUserId()}
                        onChangeText={e => form.userIdOnChange(e)}
                    />
                </Item>
                <Item error={!!form.passwordError}>
                    <Icon active name="unlock" />
                    <Input
                        placeholder="Password"
                        placeholderTextColor="#c9c9c9"
                        autoCapitalize = "none"
                        ref={c => (this.pwdinput = c)}
                        value={form.password}
                        onBlur={() => form.validatePassword()}
                        onChangeText={e => form.passwordOnChange(e)}
                        secureTextEntry={true}
                    />
                </Item>
            </Form>
        );
        return <Login navigation={this.props.navigation} loginForm={Fields} onLogin={() => this.login()} />;
    }
}
