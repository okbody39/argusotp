import MainStore from "../store/DomainStore/MainStore";
import LoginStore from "../store/ViewStore/LoginViewStore";
import SettingStore from "../store/ViewStore/SettingViewStore";

export default function() {
  const mainStore = new MainStore();
  const loginForm = new LoginStore();
  const settingForm = new SettingStore();

  return {
    loginForm,
    settingForm,
    mainStore,
  };
}
