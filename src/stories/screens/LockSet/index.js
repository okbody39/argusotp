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
    Toast, H3
} from "native-base";

import PINSetting from "../../../component/PINSetting";

import ReactNativePinView from "react-native-pin-view";

const platform = Platform.OS;
import styles from "./styles";
import CardFlip from "react-native-card-flip";

let Password1 = '';

const LockSet = (props) => {
    const pinView = useRef(null);
    const [showRemoveButton, setShowRemoveButton] = useState(false);
    const [enteredPin, setEnteredPin] = useState("");
    const [showCompletedButton, setShowCompletedButton] = useState(false);
    const [message, setMessage] = useState("현재 사용 중인 PIN을 입력하세요.");
    const [status, setStatus] = useState("normal");
    const [mandatory, setMandatory] = useState(false);
    const [digits, setDigits] = useState(4);
    const [pinCode, setPinCode] = useState(null);
    const [step, setStep] = useState(1);

    useEffect(() => {
        AsyncStorage.getItem("@SeedAuthStore:serverToken").then((tokenStr) => {
            let token = JSON.parse(tokenStr);
            setMandatory(token.pincodeUse === "true");
            setDigits(parseInt(token.pincodeDigits || "4"));

            AsyncStorage.getItem("@SeedAuthStore:lockToken").then((code) => {

                // alert(code);

                if(code) {
                    // 현재 PIN이 있는 경우 - 현재 PIN 입력
                    setStep(1);
                    setPinCode(code);
                } else {
                    // 현재 PIN이 없는 경우 - 현재 PIN입력 SKIP
                    setStep(2);
                    setMessage("사용하실 PIN을 입력하세요.");
                }

            });

        });
    }, []);

    useEffect(() => {

        // STEP
        // 1. 사용중인 PIN입력 - 미사용시 스킵 //
        // 2. PIN 설정
        // 3. 다시 입력 - 틀리면 2로 다시

        if (enteredPin.length === digits) {

            if(step === 1) {
                if(pinCode === enteredPin) {
                    setPinCode("");
                    setStep(2);
                    setMessage("사용하실 PIN을 입력하세요.");
                    pinView.current.clearCode();
                } else {
                    setStep(1);
                    setMessage("현재 사용 중인 PIN을 입력하세요.");
                }

            } else if (step === 2) {
                setStep(3);
                setMessage("한번 더 입력해 주세요.");
                pinView.current.clearCode();
                setPinCode(enteredPin);
                Password1 = enteredPin;

            } else if (step === 3) {
                if ( enteredPin === Password1 ) {

                    AsyncStorage.setItem("@SeedAuthStore:lockToken", enteredPin);

                    Password1 = '';

                    Toast.show({
                        text: 'PIN 설정이 완료되었습니다.',
                        position: "top",
                        // buttonText: "OK",
                        type: "success",
                        duration: 2000,
                    });

                    props.navigation.navigate("Home", { action: "PASSCODE_CHANGE" });

                } else {

                    setStatus( 'error');
                    setMessage( 'PIN이 다릅니다. 다시 입력해 주세요.');

                    pinView.current.clearCode();

                }

            }

        }
    }, [enteredPin]);

    let clearPincode = () => {
        Alert.alert(
            '확인',
            'PIN을 삭제하시겠습니까?',
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
                            text: 'PIN을 삭제하였습니다.',
                            position: "top",
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
        <Container style={{ backgroundColor: "#2D2B2C" }} >
            <Content padder>

                <View  style={{ alignItems: "center", marginVertical: 20,  }}>
                    <Text style={{
                        color: "#60B0F4",
                        fontWeight: "bold",
                        fontSize: 20,
                    }}>
                        PIN 설정
                    </Text>
                </View>

                {
                    digits ?
                        <View style={{ backgroundColor: "white", borderRadius: 10, paddingTop: 30, marginBottom: 30, height: 300 }} >
                            <View style={{ alignItems: "center", paddingTop: 15 }} >
                                <View style={{ marginBottom: 20, height: 30 }}>
                                    <Text style={{
                                        color: status === "normal" ? "black" : "red"
                                    }}>{ message }</Text>
                                </View>
                                <PINSetting ref={ pinView } color="#2D2B2C" password={pinCode} digits={digits}
                                            onValueChange={(value) => {
                                                setEnteredPin(value)
                                            }}
                                            onSuccess={(res) => {
                                                if(res === "OK") {
                                                    //
                                                }
                                            }}/>
                            </View>
                        </View>

                        : null
                }

                {/*<Button rounded light block onPress={() => this.props.navigation.goBack() } style={{ marginBottom: 8, backgroundColor: "#60B0F4" }}>*/}
                {/*  <Text>Save</Text>*/}
                {/*</Button>*/}

                <Button rounded light block onPress={() => props.navigation.goBack() } style={{ marginBottom: 8 }}>
                    <Text>취소</Text>
                </Button>

                {
                    mandatory ? null :

                        <Button rounded danger block onPress={() => clearPincode()}>
                            <Text>PIN 삭제</Text>
                        </Button>

                }
            </Content>
        </Container>
    )
}
export default LockSet
