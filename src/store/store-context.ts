import { createContext } from "@lit-labs/context";

export class Colors {
  primarycolor: string;
  textcolor: string;

  constructor() {
    this.primarycolor = "darkcyan";
    this.textcolor = "white";
  }

  public setColors(primarycolor: string, textcolor: string) {
    this.primarycolor = primarycolor;
    this.textcolor = textcolor;
    return this;
  }
  public getColors() {
    return this;
  }
}

export const colorContext = createContext<Colors>(Symbol("color-context"));

export class Messages {
  constructor(public greetings: string, public message: string) {
    this.greetings = greetings;
    this.message = message;
  }
}

export const messageContext = createContext<Messages>(
  Symbol("message-context")
);

export interface StateType {
  promptMessage: string;
  hasPrompted: boolean;
  orgName?: string;
  BASE_URL?: string;
  ID_URL?: string;
  orgId: string;
  page?: string;
  route?: string;
}
export class State {
  public promptMessage: string;
  public hasPrompted: boolean = false;
  public orgName?: string;
  public BASE_URL = "https://chatdesk-prod.dialafrika.com/";
  public ID_URL = "https://apiprod.dialafrika.com/organisation/";
  public orgId = "";
  public page?: string;
  public route?: string;
  constructor(state: StateType) {
    this.promptMessage = state.promptMessage;
    this.hasPrompted = state.hasPrompted;
    this.orgName = state.orgName;
    this.orgId = state.orgId;
    this.page = state.page ?? "";
    this.route = state.route ?? "";
  }
}

export const stateContext = createContext<State>(Symbol("state-context"));
