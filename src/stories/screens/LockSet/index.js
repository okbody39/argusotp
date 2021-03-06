import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Image, Platform, Dimensions, Alert,
    TouchableOpacity,
    AsyncStorage,
} from "react-native";
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
    Toast, H3,
    Segment,
} from "native-base";
import * as LocalAuthentication from 'expo-local-authentication';

import PINSetting from "../../../component/PINSetting";

// import ReactNativePinView from "react-native-pin-view";

const platform = Platform.OS;
import styles from "./styles";
import CardFlip from "react-native-card-flip";
import NativeWebSocketModule from "react-native/Libraries/WebSocket/NativeWebSocketModule";
import {NavigationActions, StackActions} from "react-navigation";

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

    const [type, setType] = useState(0);

    const [compatible, setCompatible] = useState(false);
    const [fingerprints, setFingerprints] = useState(false);
    const [result, setResult] = useState("");

    const [isSet, setIsSet] = useState(false);


    let checkDeviceForHardware = async () => {
        let compatible = await LocalAuthentication.hasHardwareAsync();
        setCompatible(compatible);
    };

    let checkForFingerprints = async () => {
        let fingerprints = await LocalAuthentication.isEnrolledAsync();
        setFingerprints(fingerprints);
    };

    let scanFingerprint = async () => {

        // if(!compatible){
        //     Alert.alert(
        //         "생체 인증",
        //         "이 단말기는 생체인증을 사용하실 수 없습니다.",
        //         [
        //             {text: "OK", onPress: () => setType(1)}
        //         ],
        //         {cancelable: false}
        //     );
        //     return;
        //
        //
        // }

        if(!fingerprints){
            Alert.alert(
                "생체 인증",
                "생체인증 정보를 찾을 수 없습니다. 휴대폰의 생체인증을 등록 후 사용해 주세요.",
                [
                    {text: "OK", onPress: () => setType(1)}
                ],
                { cancelable: false }
            );
            return;
        }

        let result = await LocalAuthentication.authenticateAsync(
            platform === "ios" ? "지문을 입력해주세요" : "ArgusOTP 인증"
        );

        if(result.success) {

            AsyncStorage.setItem("@ArgusOTPStore:lockToken", "__BIOAUTH__");

            // props.navigation.goBack();
            goHome();

            Toast.show({
                text: "생체인증으로 설정하였습니다.",
                duration: 3000,
                position: "top",
                type: "success",
                textStyle: { textAlign: "center" },
            });

        } else {
            if(result.error === "user_cancel") {
                //
            } else {
                Alert.alert(
                    "생체 인증",
                    "생체 인증을 사용하실수 없습니다. - " + result.error,
                    [
                        {text: "OK", onPress: () => console.log("OK Pressed")}
                    ],
                    {cancelable: false}
                );
            }
        }

    };

    useEffect(() => {
        checkDeviceForHardware();
        checkForFingerprints();

        AsyncStorage.getItem("@ArgusOTPStore:serverToken").then((tokenStr) => {
            let token = JSON.parse(tokenStr);
            setMandatory(token.pincodeUse === "true");
            setDigits(parseInt(token.pincodeDigits || "4"));

            AsyncStorage.getItem("@ArgusOTPStore:lockToken").then((code) => {

                // alert(code);
                if(code === "__BIOAUTH__") {
                    setIsSet(true);
                    setStep(2);
                    setMessage("사용하실 PIN을 입력하세요.");
                } else if(code) {
                    // 현재 PIN이 있는 경우 - 현재 PIN 입력
                    setIsSet(true);
                    setStep(1);
                    setPinCode(code);
                } else {
                    // 현재 PIN이 없는 경우 - 현재 PIN입력 SKIP
                    setIsSet(false);
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

                    AsyncStorage.setItem("@ArgusOTPStore:lockToken", enteredPin);

                    Password1 = '';

                    Toast.show({
                        text: 'PIN 설정이 완료되었습니다.',
                        position: "top",
                        // buttonText: "OK",
                        type: "success",
                        duration: 2000,
                        textStyle: { textAlign: "center" },
                    });

                    props.navigation.navigate("Home", { action: "PASSCODE_CHANGE" });
                    // setTimeout(() => {
                    //     this.props.navigation.dispatch(
                    //         StackActions.reset(
                    //             {
                    //                 index: 0,
                    //                 key: null,
                    //                 actions: [NavigationActions.navigate({ routeName: "Home"})],
                    //             })
                    //     );
                    // }, 100);

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
                        AsyncStorage.removeItem("@ArgusOTPStore:lockToken");

                        Toast.show({
                            text: 'PIN을 삭제하였습니다.',
                            position: "top",
                            // buttonText: "OK",
                            type: "success",
                            duration: 2000,
                            textStyle: { textAlign: "center" },
                        });

                        // props.navigation.navigate("Home");
                        setTimeout(() => {
                            this.props.navigation.dispatch(
                                StackActions.reset(
                                    {
                                        index: 0,
                                        key: null,
                                        actions: [NavigationActions.navigate({ routeName: "Home"})],
                                    })
                            );
                        }, 100);

                    }
                }
            ],
            { cancelable: false }
        );

    };

    let clearLocalAuth = () => {
        Alert.alert(
            '확인',
            '생체 인증을 삭제하시겠습니까?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                { text: 'OK',
                    onPress: () => {
                        AsyncStorage.removeItem("@ArgusOTPStore:lockToken");

                        Toast.show({
                            text: '생체 인증을 삭제하였습니다.',
                            position: "top",
                            // buttonText: "OK",
                            type: "success",
                            duration: 2000,
                            textStyle: { textAlign: "center" },
                        });

                        // props.navigation.navigate("Home");
                        setTimeout(() => {
                            props.navigation.dispatch(
                                StackActions.reset(
                                    {
                                        index: 0,
                                        key: null,
                                        actions: [NavigationActions.navigate({ routeName: "Home"})],
                                    })
                            );
                        }, 100);
                    }
                }
            ],
            { cancelable: false }
        );

    };

    let goHome = () => {
        // props.navigation.navigate("Home");

        // 최초 설정이고 설정이 완료되지 않았으면 홈으로 이동하지 않습니다.

        setTimeout(() => {
            props.navigation.dispatch(
                StackActions.reset(
                    {
                        index: 0,
                        key: null,
                        actions: [NavigationActions.navigate({ routeName: "Home"})],
                    })
            );
        }, 100);
    };

    let primaryColor = platform === "ios" ? "#007aff" : "#3F51B5";

    return (
        <Container style={{ backgroundColor: "#2D2B2C" }} >
            <Content padder>

                <View  style={{ alignItems: "center", marginVertical: 20,  }}>
                    <Text style={{
                        color: "#60B0F4",
                        fontWeight: "bold",
                        fontSize: 20,
                    }}>
                        인증 설정
                    </Text>
                </View>
                <Segment style={{ height: 50, marginBottom: 10 }}>
                    <Button first active={type === 0}
                            style={{ height: 35, backgroundColor: type === 0 ? primaryColor : "white", borderColor: primaryColor }}
                            onPress={()=>setType(0)}>
                        <Text style={{ color: type === 0 ? "white" : primaryColor }}>생체인증</Text>
                    </Button>
                    <Button last active={type === 1}
                            style={{ height: 35, backgroundColor: type === 1 ? primaryColor : "white", borderColor: primaryColor }}
                            onPress={()=>setType(1)}>
                        <Text style={{ color: type === 1 ? "white" : primaryColor }}>PIN코드</Text>
                    </Button>
                </Segment>
                <View style={{ backgroundColor: "white", borderRadius: 10, paddingTop: 30, marginBottom: 30, height: 300 }} >

                {
                    type === 0 ?
                        <View style={{ alignItems: "center", paddingTop: 15 }} >
                            <Text style={{ fontSize: 20, color: "grey", marginBottom: 8 }} >생체 인증을 사용하시려면</Text>
                            <Text style={{ fontSize: 20, color: "grey", marginBottom: 28 }} >아래를 클릭 하세요!</Text>

                            <TouchableOpacity onPress={() => scanFingerprint()}>
                                <Icon type="FontAwesome5" name="fingerprint" style={{ fontSize: 70, color: "lightgrey" }} />
                            </TouchableOpacity>

                            {/*<Text>*/}
                            {/*    Compatible Device? {compatible === true ? 'True' : 'False'}*/}
                            {/*</Text>*/}
                            {/*<Text>*/}
                            {/*    Fingerprings Saved?{' '}*/}
                            {/*    {fingerprints === true ? 'True' : 'False'}*/}
                            {/*</Text>*/}
                        </View>
                        :
                        null
                    // compatible && fingerprints ?

                }

                {
                    type === 1 && digits ?
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



                    : null
                }
                </View>

                {/*<Button rounded light block onPress={() => this.props.navigation.goBack() } style={{ marginBottom: 8, backgroundColor: "#60B0F4" }}>*/}
                {/*  <Text>Save</Text>*/}
                {/*</Button>*/}

                {
                    mandatory && !isSet? // 강제이고 현재 인증설정이 안된 경우
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ color: "white" }}>인증 설정이 필요합니다! (필수) {pinCode}</Text>
                        </View>
                        :
                        type === 0 ?
                            <>
                                <Button rounded light block onPress={() => goHome() } style={{ marginBottom: 8 }}>
                                    <Text>취소</Text>
                                </Button>
                                { mandatory ? null :
                                    <Button rounded danger block onPress={() => clearLocalAuth()}>
                                        <Text>PIN 삭제</Text>
                                    </Button>
                                }
                            </>
                            :
                            <>
                                <Button rounded light block onPress={() => goHome() } style={{ marginBottom: 8 }}>
                                    <Text>취소</Text>
                                </Button>
                                { mandatory ? null :
                                    <Button rounded danger block onPress={() => clearPincode()}>
                                        <Text>PIN 삭제</Text>
                                    </Button>
                                }
                            </>
                }


            </Content>
        </Container>
    )
}
export default LockSet
