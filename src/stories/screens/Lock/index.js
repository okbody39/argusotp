// import * as React from "react";
import React, { useEffect, useRef, useState } from "react"
import {Image, Platform, Dimensions, AsyncStorage, Alert} from "react-native";
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

import ReactNativePinView from "react-native-pin-view";

const platform = Platform.OS;
import styles from "./styles";
import {Updates} from "expo";
import axios from "axios";
// import {Image} from "../Login";
// import pkg from "package";

const Lock = (props) => {
  const pinView = useRef(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [message, setMessage] = useState(" ");
  const [status, setStatus] = useState("normal");
  const [mandatory, setMandatory] = useState(false);
  const [digits, setDigits] = useState(4);


  useEffect(() => {

    // Alert.alert(JSON.stringify(props.navigation.state.params.userid));

    AsyncStorage.getItem("@SeedAuthStore:serverToken").then((tokenStr) => {
      let token = JSON.parse(tokenStr);

      setMandatory(token.pincodeUse === "true");
      setDigits(parseInt(token.pincodeDigits || "4"));

    });
  }, []);

  useEffect(() => {
    if (enteredPin.length > 0) {
      setShowRemoveButton(true);
    } else {
      setShowRemoveButton(false);
    }
    if (enteredPin.length === digits) {
      AsyncStorage.getItem("@SeedAuthStore:lockToken").then((lockPass) => {
        if(lockPass.length === digits) {
          if (enteredPin == lockPass) {
            setStatus( 'normal');
            setMessage("");
            pinView.current.clearAll();

            props.navigation.navigate("Home");

          } else {
            AsyncStorage.getItem("@SeedAuthStore:lockErrorCount").then((errCount) => {
              let cnt = parseInt(errCount || "0") + 1;
              if(cnt >= 5) { // 5회 오류시
                Alert.alert("Error count exceeded", "Initialize the app due to the exceeded error count...");

                let mainStore = props.navigation.state.params.mainStore;

                let serverUrl = mainStore.getServerUrl() || "";
                let userid = mainStore.userToken.userId || "";
                let checkUrl = serverUrl + "/lockuser/" + userid;

                axios.get(checkUrl, {
                  crossdomain: true,
                }).then(res => {
                  mainStore.resetUserStore().then(() => {
                    Updates.reload();
                  });
                });


              } else {
                AsyncStorage.setItem("@SeedAuthStore:lockErrorCount",  "" + cnt);
              }
            });

            setStatus( 'error');
            setMessage("Password is wrong, try again.");
            pinView.current.clearAll();
          }
        } else {
          AsyncStorage.removeItem("@SeedAuthStore:lockToken");
          Alert.alert("Policy change", "PIN code policy is changed! please set again...");
          props.navigation.navigate("LockSet");
        }

      });
    }
  }, [enteredPin]);

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
              color: status === "normal" ? "#0BA3EE" : "red"
            }}>
              { message }
            </Text>
          </View>
          <View padder>
            {
              digits ?
                <ReactNativePinView
                  inputSize={ digits === 4 ? 32 : 20}
                  ref={pinView}
                  pinLength={ digits }
                  buttonSize={60}
                  onValueChange={value => setEnteredPin(value)}
                  buttonAreaStyle={{
                    marginTop: 24,
                  }}
                  inputAreaStyle={{
                    marginTop: 24,
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
                      //

                    }
                    // if (key === "three") {
                    //   alert("You can't use 3")
                    // }
                  }}
                  customLeftButton={showRemoveButton ? <Icon name={"ios-backspace"} style={{fontSize: 36, color: '#0BA3EE'}} /> : undefined}
                  customRightButton={showCompletedButton ? <Icon name={"ios-unlock"} style={{fontSize: 36, color: '#0BA3EE'}} /> : undefined}
                /> : null
            }

          </View>
        </Body>

      {/*</Header>*/}
      {/*<Content padder>*/}

      </Content>
    </Container>
  )
}
export default Lock

// class Lock extends React.Component<Props, State> {
//   constructor(props) {
//     super(props);
//
//     this.pinView = null;
//
//     this.state = {
//       message: 'Please input your password.',
//       status: 'normal',
//       enteredPin: "",
//     };
//   }
//
//   setEnteredPin = (value) => {
//     this.setState({
//       enteredPin: value
//     });
//   }
//
// 	render() {
// 		const {ver} = this.props;
// 		return (
//
// 			<Container style={styles.container}>
//         <Header style={{ height: 150 }}>
//           <Body style={{ alignItems: "center" }}>
//             {/*<Icon name="cloud" style={{ fontSize: 100 }} />*/}
//             {platform === "ios" ?
//               <Image
//                 source={require("../../../../assets/logo-seedauth.png")}
//                 style={{width: 600 / 2.5, height: 172 / 2.5}}
//               />
//               :
//               <Image
//                 source={require("../../../../assets/logo-seedauth-white.png")}
//                 style={{width: 600 / 2.5, height: 172 / 2.5}}
//               />
//             }
//             {/*<Title>SeedAuth Mobile</Title>*/}
//             <View padder>
//               <Text style={{ color: Platform.OS === "ios" ? "#000" : "#FFF" }}>
//                 { this.state.message }
//               </Text>
//             </View>
//           </Body>
//         </Header>
//         <Content padder>
//         <ReactNativePinView
//           ref={ref => {
//             this.pinView = ref;
//           }}
//           inputSize={32}
//           pinLength={4}
//           buttonSize={60}
//           onValueChange={this.setEnteredPin}
//           buttonAreaStyle={{
//             marginTop: 24,
//           }}
//           inputAreaStyle={{
//             marginBottom: 24,
//           }}
//           inputViewEmptyStyle={{
//             backgroundColor: "transparent",
//             borderWidth: 1,
//             borderColor: "#FFF",
//           }}
//           inputViewFilledStyle={{
//             backgroundColor: "#FFF",
//           }}
//           buttonViewStyle={{
//             borderWidth: 1,
//             borderColor: "#FFF",
//           }}
//           buttonTextStyle={{
//             color: "#FFF",
//           }}
//           onButtonPress={key => {
//             if (key === "custom_left") {
//               console.log("pinView: ", this.pinView);
//               this.pinView.current.clear();
//
//             } else if (key === "custom_right") {
//               alert("Entered Pin: " + this.state.enteredPin)
//             }
//
//             // if (key === "three") {
//             //   alert("You can't use 3")
//             // }
//           }}
//           customLeftButton={<Icon name={"ios-backspace"} style={{fontSize: 36, color: 'white'}} />}
//           customRightButton={<Icon name={"ios-unlock"} style={{fontSize: 36, color: 'white'}} />}
//         />
//
//         </Content>
// 			</Container>
// 		);
// 	}
// }
//
// export default Lock;
