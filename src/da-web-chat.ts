import { provide } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { choose } from "lit/directives/choose.js";
import "../src/components/wc-svg";
import "./components/wc-closed";
import "./components/wc-home";
import { getOrg, getPrompt } from "./functions/functions";
import {
  Colors,
  Messages,
  State,
  colorContext,
  messageContext,
  stateContext,
} from "./store/store-context";

@customElement("da-web-chat")
export class DaWebChat extends LitElement {
  @property({ type: String }) primarycolor = "teal";
  @property({ type: String }) textcolor = "#FFFFFF";
  @property() apikey = "";

  @state() greetings = "Hi";
  @state() BASE_URL = "https://chatdesk-prod.dialafrika.com/";
  @state() ID_URL = "https://apiprod.dialafrika.com/organisation/";
  @state() organizationId = "";
  @state() newprimarycolor: string = this.primarycolor;
  @state() orgName: string = "";
  @state() page = "home";
  @state() homePage = "home";

  @provide({ context: colorContext })
  colors: Colors = new Colors().setColors(this.primarycolor, this.textcolor);

  @provide({ context: messageContext })
  messages: Messages = new Messages("", "");

  @provide({ context: stateContext })
  state = new State({
    promptMessage: "",
    hasPrompted: false,
    orgName: "",
    orgId: this.organizationId,
    page: this.page,
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.colors = new Colors().setColors(this.primarycolor, this.textcolor);
    getOrg(this.ID_URL, this.apikey)
      .then((res: any) => {
        this.organizationId = res?.id;
        this.orgName = res?.name;
      })
      .then(() => {
        getPrompt(this.BASE_URL, this.organizationId).then((res) => {
          this.messages = new Messages(
            `${this.greetings} ${
              localStorage.getItem("contactName") ?? "there"
            },`,
            res?.data.data?.message
          );
          this.state = new State({
            promptMessage: res?.data?.message,
            hasPrompted: true,
            orgName: this.orgName,
            orgId: this.organizationId,
          });
        });
      })
      .catch((err) => {
        console.warn(err);
      });

    this.requestUpdate();
  }

  toggleChat() {
    this.page = this.page === "closed" ? "home" : "closed";
    this.homePage = "home";
    this.requestUpdate();
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this.shadowRoot?.addEventListener("start-chat", () => {
      this.homePage = "ticket";
      this.page = "home";
    });
    this.page = "closed";
  }

  protected render(): unknown {
    return html`
      ${choose(
        this.page,
        [
          [
            "closed",
            () => html`
              <wc-closed>
                <div
                  slot="chat-button"
                  class="toggle-button"
                  @click="${this.toggleChat}"
                  style="background-color: ${this.primarycolor}"
                >
                  <wc-svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="#ffffff"
                      class="feather feather-message-square"
                    >
                      <path
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      ></path>
                    </svg>
                  </wc-svg>
                </div>
              </wc-closed>
            `,
          ],
          [
            "home",
            () => html`
                      <wc-home bg="${this.primarycolor}" color="${this.textcolor}" page="${this.homePage}" >
                        <div slot="logo">
                          <slot class="logo" name="logo"></slot>
                        </div>
                        <div slot="close-btn" class="close-button" class="close-button" @click="${this.toggleChat}">
                          <wc-svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#797979" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </wc-svg>
                        </div>
                        </div>
                      </wc-home>
            `,
          ],
        ],
        () => html`
          <wc-closed>
            <div
              slot="chat-button"
              class="toggle-button"
              @click="${this.toggleChat}"
              style="background-color: ${this.primarycolor}"
            >
              <wc-svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  class="feather feather-message-square"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
              </wc-svg>
            </div>
          </wc-closed>
        `
      )}
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: 40px;
      right: 40px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    .toggle-button {
      width: 80px;
      height: 80px;
      background-color: #0b163f;
      color: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .close-button {
      width: 80px;
      height: 80px;
      background-color: #f2f2f2;
      color: #535353;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "da-web-chat": DaWebChat;
  }
}
