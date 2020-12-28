import * as React from "react";
import {
    Text, Button, Row, Icon, Left, Body, Right, Grid, View,
} from "native-base";

function shuffle(a) {
    let j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

let initArr = [1,2,3,4,5,6,7,8,9,0];
shuffle(initArr);

export default class PINSetting extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inputCode: "",
        }
    }

    inputCode(code) {
        const { password, onSuccess } = this.props;

        let inputCode = this.state.inputCode;
        let len = inputCode.length;
        let currentCode = inputCode + code;

        if(code === "B") {
            currentCode = inputCode.substr(0, len-1);
        }

        this.setState({
            inputCode: code === "C" ? "" : currentCode,
        });

        if(currentCode.length === password.length) {
            if(currentCode === password) {
                onSuccess("OK");
            } else {
                onSuccess("NOK");
            }

            this.setState({
                inputCode: "",
            });

        } else {

        }


    }

    clearCode() {
        this.setState({
            inputCode: "",
        });
    }


    render() {
        const { color, password } = this.props;
        let line1 = [initArr[0],initArr[1],initArr[2],initArr[3]];
        let line2 = [initArr[4],initArr[5],initArr[6],initArr[7],];
        let line3 = ["C",initArr[8],initArr[9],"B"];
        const fields: JSX.Element[] = [];

        for(let p=0 ; p<password.length ; p++) {
            let name = "radio-button-off";

            if(p < this.state.inputCode.length) {
                name = "radio-button-on";
            }

            fields.push(<Icon style={{ color: color, fontSize: 15, marginHorizontal: 1 }} name={name}/>);
        }

        return (
            <View style={{ height: 45*3+10  }}>
                <Row style={{ justifyContent: "center", height: 20, marginTop: 0}}>
                    {fields}
                    {/*<Text style={{ color: color }}>{this.state.inputCode}</Text>*/}
                    {/*<Icon style={{ color: color, fontSize: 15 }} name="radio-button-on" />*/}

                </Row>
                <Row>
                    {
                        line1.map((n) => {
                            return (
                                <Button rounded bordered style={{ margin: 3, height:35, width: 45, borderColor: color  }}
                                        onPress={this.inputCode.bind(this, n)}>
                                    <Text style={{ color }}>{n}</Text>
                                </Button>
                            )
                        })
                    }

                </Row>
                <Row>
                    {
                        line2.map((n) => {
                            return (
                                <Button rounded bordered style={{ margin: 3, height:35, width: 45, borderColor: color  }}
                                        onPress={this.inputCode.bind(this, n)}>
                                    <Text style={{ color }}>{n}</Text>
                                </Button>
                            )
                        })
                    }

                </Row>
                <Row>
                    {
                        line3.map((n) => {
                            return (
                                <Button rounded bordered style={{ margin: 3, height:35, width: 45, borderColor: color, backgroundColor: n === "C" || n === "B" ? color : "white"  }}
                                        onPress={this.inputCode.bind(this, n)}>
                                    {
                                        n === "B" ?
                                            <Icon type="FontAwesome5" name="arrow-left"  style={{ color: "#60B0F4", fontSize: 15 }} />
                                            :
                                            <Text style={{ color:  n === "C" ? "#60B0F4" : color }}>{n}</Text>
                                    }

                                </Button>
                            )
                        })
                    }

                </Row>
            </View>
        );
    }
}
