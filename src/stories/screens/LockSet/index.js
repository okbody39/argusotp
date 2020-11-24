import React, { useEffect, useRef, useState, useCallback } from "react";
import { Image, Platform, Dimensions, Alert } from "react-native";
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

import ReactNativePinView from "react-native-pin-view";

const platform = Platform.OS;
import styles from "./styles";

var Password1 = '';

const LockSet = (props) => {
  const pinView = useRef(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [message, setMessage] = useState("Pin code setting");
  const [status, setStatus] = useState("normal");
  const [mandatory, setMandatory] = useState(false);
  const [digits, setDigits] = useState(4);
  const [pinCode, setPinCode] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("@SeedAuthStore:serverToken").then((tokenStr) => {
      let token = JSON.parse(tokenStr);
      setMandatory(token.pincodeUse === "true");
      setDigits(parseInt(token.pincodeDigits || "4"));

      AsyncStorage.getItem("@SeedAuthStore:lockToken").then((code) => {
        setPinCode(code);
        // alert(code);
      });

    });
  }, []);

  useEffect(() => {
    if (enteredPin.length > 0) {
      setShowRemoveButton(true);
    } else {
      setShowRemoveButton(false);
    }
    if (enteredPin.length === digits) {
      if ( Password1 === '' ) {
        Password1 = enteredPin;
        setStatus( 'normal');
        setMessage( 'Please input your password again.');

        pinView.current.clearAll();

      } else {
        // The second password
        if ( enteredPin === Password1 ) {

          AsyncStorage.setItem("@SeedAuthStore:lockToken", enteredPin);

          Password1 = '';

          Toast.show({
            text: 'Your Pin-code set successful.',
            // buttonText: "OK",
            type: "success",
            duration: 2000,
          });

          props.navigation.navigate("Home");


        } else {
          setStatus( 'error');
          setMessage( 'Not the same, try again.');

          Password1 = '';
          pinView.current.clearAll();
        }
      }
    }
  }, [enteredPin]);

  clearPincode = () => {
    Alert.alert(
      'Confirm',
      'Are you sure clear Pin code?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK',
          onPress: () => {
            AsyncStorage.removeItem("@SeedAuthStore:lockToken");

            Toast.show({
              text: 'Your Pin-code is disabled.',
              // buttonText: "OK",
              type: "success",
              duration: 2000,
            });

            props.navigation.navigate("Home");
          }
        }
      ],
      { cancelable: false }
    );

  };

  return (
    <Container style={styles.container}>
      <Content padder>
        <Body style={{ alignItems: "center", paddingTop: 20 }}>
            <Image
              source={require("../../../../assets/logo-seedauth.png")}
              style={{
                width: 600 / 2.5,
                height: 172 / 2.5,
                marginBottom: 20
              }}
            />

          <View padder>
            <Text style={{
              color: status === "normal" ? "#0BA3EE" : "red",
              fontWeight: "bold",
              // fontSize: 15,
            }}>
              { message }
            </Text>
          </View>
        </Body>
      {/*</Header>*/}
      {/*<Content padder>*/}
        {
          digits ?
            <ReactNativePinView
              inputSize={ digits === 4 ? 32 : 20}
              ref={ pinView }
              pinLength={ digits }
              buttonSize={60}
              onValueChange={value => setEnteredPin(value)}
              buttonAreaStyle={{
                marginTop: 10,
              }}
              inputAreaStyle={{
                marginTop: 10,
                marginBottom: 24,
              }}
              inputViewEmptyStyle={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "#0BA3EE",
              }}
              inputViewFilledStyle={{
                backgroundColor: "#0BA3EE",
              }}
              buttonViewStyle={{
                borderWidth: 1,
                borderColor: "#0BA3EE",
              }}
              buttonTextStyle={{
                color: "#0BA3EE",
              }}
              onButtonPress={key => {
                if (key === "custom_left") {
                  pinView.current.clear();
                } else if (key === "custom_right") {
                  props.navigation.navigate("Home");
                }
              }}
              customLeftButton={showRemoveButton ? <Icon name={"ios-backspace"} style={{fontSize: 36, color: '#0BA3EE'}} /> : undefined}
              customRightButton={
                mandatory ?
                  pinCode ?
                    <Text style={{fontSize: 16, color: '#0BA3EE'}}>Cancel</Text>
                    : null
                  : <Text style={{fontSize: 16, color: '#0BA3EE'}}>Cancel</Text>
              }
            />
            : null
        }

        {
          mandatory ? null :

            <Button rounded danger block onPress={() => clearPincode()}>
              <Text>Disable Pin code</Text>
            </Button>

        }
      </Content>
    </Container>
  )
}
export default LockSet
