import MainStore from "../store/DomainStore/MainStore";
import LoginStore from "../store/ViewStore/LoginViewStore";

export default function() {
  const mainStore = new MainStore();
  const loginForm = new LoginStore();

  return {
    loginForm,
    mainStore,
  };
}
