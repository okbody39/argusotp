import * as React from "react";
import { Image, Platform, Dimensions } from "react-native";
import { AsyncStorage } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Icon,
  Left,
  Right,
  Body,
  Card,
  CardItem,
  Row,
  View,
  Toast
} from "native-base";
import PasswordGesture from 'react-native-gesture-password';

const platform = Platform.OS;
import styles from "./styles";
// import {Image} from "../Login";
// import pkg from "package";

export interface Props {
	navigation: any;
}
export interface State {}

var Password1 = '';

class LockSet extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.pg = null;

    this.state = {
      message: 'Please input your password.',
      status: 'normal'
    };
  }

  componentDidMount() {
    Password1 = '';
  }

  onEnd = (password)=> {
    if ( Password1 === '' ) {
      // The first password
      Password1 = password;
      this.setState({
        status: 'normal',
        message: 'Please input your password secondly.'
      });

      this.pg.resetActive();
    } else {
      // The second password
      if ( password === Password1 ) {
        this.setState({
          status: 'right',
        //   message: 'Your password is set to ' + password
        });

        let userToken = AsyncStorage.setItem("@SeedAuthStore:lockToken", password);

        Password1 = '';

        Toast.show({
          text: 'Your password is set successful.',
          // buttonText: "OK",
          type: "success",
          duration: 2000,
        });

        this.props.navigation.navigate("Home");


      } else {
        this.setState({
          status: 'wrong',
          message:  'Not the same, try again.'
        });
        Password1 = '';
        this.pg.resetActive();
      }
    }
  };

  onStart=()=> {
    if ( Password1 === '') {
      this.setState({
        message: 'Please input your password.'
      });
    } else {
      this.setState({
        message: 'Please input your password secondly.'
      });
    }
  };

	render() {
		const {ver} = this.props;
		return (

			<Container style={styles.container}>
        {/*<Header style={{ height: 150 }}>*/}
        {/*  <Body style={{ alignItems: "center" }}>*/}
        {/*    /!*<Icon name="cloud" style={{ fontSize: 100 }} />*!/*/}
        {/*    {platform === "ios" ?*/}
        {/*      <Image*/}
        {/*        source={require("../../../../assets/logo-seedauth.png")}*/}
        {/*        style={{width: 600 / 2.5, height: 172 / 2.5}}*/}
        {/*      />*/}
        {/*      :*/}
        {/*      <Image*/}
        {/*        source={require("../../../../assets/logo-seedauth-white.png")}*/}
        {/*        style={{width: 600 / 2.5, height: 172 / 2.5}}*/}
        {/*      />*/}
        {/*    }*/}
        {/*    /!*<Title>SeedAuth Mobile</Title>*!/*/}
        {/*    <View padder>*/}
        {/*      <Text style={{ color: Platform.OS === "ios" ? "#000" : "#FFF" }}>*/}
        {/*        { this.state.message }*/}
        {/*      </Text>*/}
        {/*    </View>*/}
        {/*  </Body>*/}
        {/*</Header>*/}
          <PasswordGesture
            ref={ref => {
              this.pg = ref;
            }}
            status={this.state.status}
            message={this.state.message}
            onStart={() => this.onStart()}
            onEnd={(password) => this.onEnd(password)}
            children={
              <View style={{
                position: "absolute",
                bottom: 20,
                width: Dimensions.get("window").width,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Image
                  source={require("../../../../assets/logo-seedauth-white.png")}
                  style={{width: 600 / 2.5, height: 172 / 2.5}}
                />
              </View>
            }
          />


			</Container>
		);
	}
}

export default LockSet;
