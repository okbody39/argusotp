import * as React from "react";
import { observer, inject } from "mobx-react";
// import Constants from 'expo-constants';
// import axios from 'axios';
import * as Updates from 'expo-updates';
import {Alert, AsyncStorage} from "react-native";
import * as Permissions from "expo-permissions";
import * as Notifications from 'expo-notifications';

import Home from "../../stories/screens/Home";
import {NavigationActions, StackActions} from "react-navigation";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

@inject("mainStore")
@observer
export default class HomeContainer extends React.Component {

  constructor(props) {
    super(props);

    this.responseListener = null;

    this.state = {
      notification: {},
    };

  }

  componentDidMount() {
    // const { mainStore } = this.props;
    //
    // mainStore.loadStore();
    //
    // if (mainStore.isServerSet && mainStore.isLogin) {
    //   //
    // } else {
    //   // navigation.navigate("Home");
    //   // setTimeout(() => {
    //   this.props.navigation.dispatch(
    //       StackActions.reset(
    //           {
    //             index: 0,
    //             key: null,
    //             actions: [NavigationActions.navigate({ routeName: "Login"})],
    //           })
    //   );
    //   // }, 100);
    // }


    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this._handleNotification(response);
    });

    // Updates.checkForUpdateAsync().then((isAvailable, manifest) => {
    //   // alert(isAvailable + JSON.stringify(manifest));
    //   if(isAvailable) {
    //     Updates.fetchUpdateAsync().then((isNew, manifest) => {
    //       if(isNew) {
    //         Alert.alert(
    //             '업데이트',
    //             '새로운 버전(' + manifest.version + ')의 앱이 출시되었습니다. [확인]를 누르시면 업데이트를 위해 앱이 재기동 됩니다.',
    //             [
    //               // {text: '아니오', onPress: () => {}, style: 'cancel'},
    //               {text: '확인', onPress: () => {
    //                   setTimeout( () => Updates.reloadAsync(), 500);
    //                 }},
    //             ]
    //         );
    //       }
    //     });
    //   }
    // });

  }

  componentWillUnmount() {
    Notifications.removeNotificationSubscription(this.responseListener);
  }

  _handleNotification = (res) => {
    let notification = res.notification.request.content.data;

    let data = notification;
    let navi = "Login";

    if(Platform.OS === "ios") {
      data = notification.body;
    }

    if( data ) {
      if(data.ACTIONID === "POLICYCHANGE") {
        AsyncStorage.removeItem("@ArgusOTPStore:userToken");
      } else if(data.ACTIONID === "PINRESET") {
        AsyncStorage.removeItem("@ArgusOTPStore:lockToken");
      } else if(data.ACTIONID === "RESET") {
        AsyncStorage.removeItem("@ArgusOTPStore:userToken");
        AsyncStorage.removeItem("@ArgusOTPStore:serverToken");
        AsyncStorage.removeItem("@ArgusOTPStore:lockToken");
      } else {
        this.props.navigation.navigate(data.navi, data);
        return;
      }

      setTimeout(() => {
        Alert.alert(
            '정보 업데이트',
            '앱 정보가 변경되었습니다. [확인]를 누르시면 앱이 재기동 됩니다.',
            [
              {text: '확인', onPress: () => {
                  setTimeout( () => Updates.reloadAsync(), 500);
                }},
            ]
        );
      }, 500);

    }

  }

  render() {
    const { mainStore, navigation } = this.props;

    return <Home navigation={navigation} mainStore={mainStore} />;

  }
}
