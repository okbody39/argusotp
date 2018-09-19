import * as React from "react";
import {
  Container, Header, Title, Content,
  Text, Button, Icon, Left, Body, Right,
  List, ListItem, Row, Col,
  Card, CardItem,
  H1, H2, H3
} from "native-base";

import styles from "./styles";
// import Sparkline from "react-native-sparkline";
import ProgressBar from 'react-native-progress-bar';

import OTP from "otp-client";
import { AsyncStorage } from "react-native";
import { TextLetterSpacing } from "./TextLetterSpacing";

// var ProgressBar = require("react-native-progress-bar");

export interface Props {
  navigation: any;
  userId: any,
}
export interface State {}

class Home extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      token: "000000",
      prevToken: "000000",
      nextToken: "000000",
      nextTokenSecond: 0,
      subTitle: this.props.userId,
      intervalId: null,
      otpKey: null,
      period: 60,
      digits: 6,
      textColor: "#000000",
      progress: 0,
    };

  }
  componentDidMount() {



    AsyncStorage.getItem("@ApiKeysStore:period", (err, result) => {
      if (err) {
        return;
      }
      this.setState({period: parseInt(result)});
    });

    AsyncStorage.getItem("@ApiKeysStore:digits", (err, result) => {
      if (err) {
        return;
      }
      this.setState({digits: parseInt(result)});
    });

    AsyncStorage.getItem("@ApiKeysStore:otpKey", (err, result) => {
      if (err) {
        return;
      }
      this.setState({otpKey: result});
    });

    let intervalId = setInterval(() => {

      if (!this.state.otpKey) {
        return;
      }

      // console.log(this.state);

      var options = {
        algorithm: "sha1",
        digits: this.state.digits,
        period: this.state.period,
        epoch: null
      };

      const otp = new OTP(this.props.userId + this.state.otpKey, options);
      const token = otp.getToken();
      const prevToken = otp.getToken(-1);
      const nextToken = otp.getToken(1);

      let timeLeft = otp.getTimeUntilNextTick() + 1;
      let progress = (this.state.period - timeLeft) / this.state.period;

      this.setState({
        token: token,
        prevToken: prevToken,
        nextToken: nextToken,
        nextTokenSecond: timeLeft,
        textColor: otp.getTimeUntilNextTick() < 10 ? "#ff0000" : "#000000",
        progress: progress,
      });

    }, 1000);

    this.setState({ intervalId: intervalId });

  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
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
                onPress={() => this.props.navigation.navigate("DrawerOpen")}
              />
            </Button>
          </Left>
          <Body>
            <Title>OTP</Title>
          </Body>
          <Right />
        </Header>

        <Content padder>
          <Card style={{ alignItems: 'center', paddingTop: 30 }}>
            <H3 style={{color: 'grey'}}>
              VERIFY YOUR
            </H3>
            <H3 style={{color: 'grey'}}>
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
                  fillStyle={{}}
                  backgroundStyle={{backgroundColor: "#cccccc", borderRadius: 2}}
                  style={{marginTop: 10, width: 300}}
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
        </Content>
      </Container>
    );
  }
}

export default Home;
