import * as React from "react";
import {Image, Platform, Dimensions, AsyncStorage} from "react-native";
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
  View
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

class Lock extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.pg = null;

    this.state = {
      message: 'Please input your password.',
      status: 'normal'
    };
  }

  onEnd = (password)=> {
    AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {
      if (password == lockPass) {
        this.setState({
          status: 'right',
          message: 'Password is right, success.'
        });

        this.props.navigation.navigate("Home");
        this.pg.resetActive();

        // your codes to close this view
      } else {
        this.setState({
          status: 'wrong',
          message: 'Password is wrong, try again.'
        });
      }
    });

  };

  onStart=()=> {
    this.setState({
      status: 'normal',
      message: 'Please input your password.'
    });
  };

  onReset=()=>{
    this.setState({
      status: 'normal',
      message: 'Please input your password (again).'
    });
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

export default Lock;
