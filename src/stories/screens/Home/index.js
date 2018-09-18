import * as React from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Icon,
  Left,
  Body,
  Right,
  List,
  ListItem,
  Row,
  Col,
  Card,
  CardItem,
  H1
} from "native-base";

import styles from "./styles";
import Sparkline from "react-native-sparkline";
import OTP from 'otp-client'
import {AsyncStorage} from "react-native";

export interface Props {
  navigation: any;
  userId: any,
}
export interface State {}

class Home extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      token: '000000',
      nextTokenSecond: 0,
      subTitle: this.props.userId,
      intervalId: null,
      otpKey: null,
      textColor: '#000000',
    };

  }
  componentDidMount() {

    var options = {
      algorithm: 'sha1',
      digits: 6,
      period: 60,
      epoch: null
    };

    AsyncStorage.getItem('@ApiKeysStore:otpKey', (err, result) => {
      if(err) {
        return;
      }

      this.setState({otpKey: result});

    });

    let intervalId = setInterval(() => {

      if(!this.state.otpKey) {
        return;
      }

      const otp = new OTP(this.props.userId + this.state.otpKey, options);
      const token = otp.getToken();

      this.setState({
        token: token,
        nextTokenSecond: otp.getTimeUntilNextTick(),
        textColor: otp.getTimeUntilNextTick() < 10 ? '#ff0000' : '#000000',
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
            <Title>Home</Title>
          </Body>
          <Right />
        </Header>

        <Content padder>
          <Card>
            <CardItem header>
              <Text>{this.props.userId}</Text>
            </CardItem>
            <CardItem>
              <Body>
                <H1 style={{color: this.state.textColor}}>{this.state.token}</H1>
              </Body>
            </CardItem>
            <CardItem footer>
              <Text>{(this.state.nextTokenSecond + 1)} second(s) left</Text>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}

export default Home;
