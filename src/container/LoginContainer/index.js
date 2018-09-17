// @flow
import * as React from "react";
import {
  AsyncStorage
} from "react-native";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react/native";

import Login from "../../stories/screens/Login";

export interface Props {
	navigation: any,
	loginForm: any,
}
export interface State {}

@inject("loginForm")
@observer
export default class LoginContainer extends React.Component<Props, State> {
	emailInput: any;
	pwdinput: any;

  login = async () => {
    await AsyncStorage.setItem("userToken", "111111");

    this.props.loginForm.clearStore();
    this.props.navigation.navigate("Drawer");

    return;
  }

	_login() {

    this.props.loginForm.clearStore();
    this.props.navigation.navigate("Drawer");

    return;

		this.props.loginForm.validateForm();
		if (this.props.loginForm.isValid) {
			this.props.loginForm.clearStore();
			this.props.navigation.navigate("Drawer");
		} else {
			Toast.show({
				text: "아이디 또는 비밀번호를 다시 확인해 주세요!",
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
				<Item error={form.emailError ? true : false}>
					<Icon active name="person" />
					<Input
						placeholder="아이디"
						keyboardType="email-address"
						ref={c => (this.emailInput = c)}
						value={form.email}
						onBlur={() => form.validateEmail()}
						onChangeText={e => form.emailOnChange(e)}
					/>
				</Item>
				<Item error={form.passwordError ? true : false}>
					<Icon active name="unlock" />
					<Input
						placeholder="비밀번호"
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
