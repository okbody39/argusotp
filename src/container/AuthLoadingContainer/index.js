import React from "react";
import {
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import {
  Content, Spinner, Toast
} from "native-base";
import axios from "axios";
import {inject, observer} from "mobx-react";
import {NavigationActions, StackActions} from "react-navigation";
import {decrypt} from "../../utils/crypt";
import Expo, { Constants } from "expo";

export interface Props {
	navigation: any,
}
export interface State {}

@inject("mainStore")
@observer
export default class AuthLoadingContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { mainStore } = this.props;

    // let compatible = await Expo.LocalAuthentication.hasHardwareAsync();
    // let fingerprints = await Expo.LocalAuthentication.isEnrolledAsync();
    //
    // console.log(compatible, fingerprints);
    //
    // if(fingerprints) {
    //   let result = await Expo.LocalAuthentication.authenticateAsync('Scan your finger.');
    // }

    mainStore.loadStore().then(() => {
      var routName = mainStore.isLogin ? "App" : "Auth";

      if (mainStore.isServerSet && mainStore.userToken) {
        axios.get(mainStore.getServerUrl() + "/otp/checkMissingDevice/" + mainStore.userToken.userId, {
          crossdomain: true,
        }).then(res => {
          const result = res.data;



          let jsonText = decrypt(result, mainStore.serverToken.encKey);
          let jsonObj = JSON.parse(jsonText);
          if (jsonObj.isMissingDevice === "True") {

            mainStore.resetStore().then(() => {
              this.props.navigation.dispatch(
                  StackActions.reset(
                      {
                        index: 0,
                        key: null,
                        actions: [NavigationActions.navigate({routeName: "Logout"})],
                      }
                  )
              //     NavigationActions.reset({
              //   index: 0,
              //   key: null,
              //   actions: [NavigationActions.navigate({routeName: "Logout"})],
              // })
              );
            });

          }
        });
      }

      this.props.navigation.dispatch(
          StackActions.reset(
              {
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: routName })],
              }
          )
      //     NavigationActions.reset({
      //   index: 0,
      //   key: null,
      //   actions: [NavigationActions.navigate({ routeName: routName })],
      // })
      );

    });


    // mainStore.loadUserToken().then(() => {
    //   mainStore.loadOtpServerInfo().then(() => {
    //
    //     var routName = mainStore.isLogin ? "App" : "Auth";
    //
    //     // if(mainStore.otpServerIp && settingForm.encKey) {
    //     //
    //     //   axios.get("http://" + mainStore.otpServerIp + ":" + mainStore.otpServerPort + "/otp/checkMissingDevice/" + mainStore.userToken, {
    //     //     crossdomain: true,
    //     //   }).then(res => {
    //     //     const result = res.data;
    //     //
    //     //     let jsonText = decrypt(result, mainStore.encKey);
    //     //     console.log(jsonText);
    //     //     let jsonObj = JSON.parse(jsonText);
    //     //
    //     //     if (jsonObj.isMissingDevice === "True") {
    //     //
    //     //       loginForm.resetUserAuthInfo();
    //     //       settingForm.resetOtpServerInfo();
    //     //       mainStore.saveUserToken({}, false);
    //     //
    //     //       this.props.navigation.dispatch(NavigationActions.reset({
    //     //         index: 0,
    //     //         actions: [NavigationActions.navigate({routeName: "Logout"})],
    //     //       }));
    //     //
    //     //     }
    //     //   });
    //     // }
    //
    //     this.props.navigation.dispatch(NavigationActions.reset({
    //       index: 0,
    //       actions: [NavigationActions.navigate({ routeName: routName })],
    //     }));
    //   });
    // });

    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    return (
      <Content contentContainerStyle={{ justifyContent: "center", flex: 1 }}>
        <Spinner />
      </Content>
    );
  }
}
