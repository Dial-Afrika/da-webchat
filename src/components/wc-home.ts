import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import logoicon from "../assets/logoicon.svg";
import messages from "../assets/messages.svg";
import send from "../assets/send.svg";
import "../components/buttons/back-button";
import "../components/buttons/close-button";
import "../components/mascot";
import { getTicket } from "../functions/functions";
import { State, messageContext, stateContext } from "../store/store-context";
import "./wc-agent-header";
import "./wc-editor";
import "./wc-faqs";
import "./wc-search";
import "./wc-thread";
import "./wc-ticket-history";
import "./wc-view-faq";

@customElement("wc-home")
export class WcHome extends LitElement {
  @property({ type: Boolean }) showChat = false;
  @property({ type: String }) bg = "#0B163f";
  @property({ type: String }) color = "#0B163f";
  @property({ type: String }) greetings = "Hi there!";
  @property({ type: String }) message =
    "Welcome to Dialafrika Support, We're here to help!";
  @property() page = "ticket";

  @state() hasSearch = false;
  @state() hasFaqs = false;
  @state() hasClientId = !!localStorage.getItem("clientId");
  @state() routes: string[] = [];
  @state() route = "/";
  @state() selectedItem: any = {};

  @consume({ context: stateContext, subscribe: true })
  private state!: State;

  @consume({ context: messageContext, subscribe: true })
  private messages?: any;

  private stackRoutes(route: string) {
    this.routes.push(route);
  }
  private getPreviousRoute() {
    return this.routes[this.routes.length - 1];
  }

  private setPage(page: string, route: string) {
    this.page = page;
    this.route = route;
  }
  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this.shadowRoot?.addEventListener("onSearch", () => {
      this.hasSearch = true;
    });
    this.shadowRoot?.addEventListener("onClose", () => {
      this.hasSearch = false;
    });
    this.shadowRoot?.addEventListener("onBack", () => {
      this.page = "home";
      this.stackRoutes("home");
    });
    this.shadowRoot?.addEventListener("onSeeAll", () => {
      this.page = "faqs";
      this.stackRoutes("faqs");
    });
    this.shadowRoot?.addEventListener("onRoute", (e: any) => {
      let { route, page, ...rest } = e.detail;
      this.route = route;
      this.page = page;
      this.selectedItem = rest;
    });
    this.shadowRoot?.addEventListener("onFaqs", () => {
      this.hasFaqs = true;
    });
    this.shadowRoot?.addEventListener("chat-started", () => {
      this.hasClientId = true;
    });
    this.shadowRoot?.addEventListener("onMessage", () => {
      getTicket(
        `${this.state?.BASE_URL}`,
        `${this.state?.orgId}`,
        this.selectedItem?.data?.id
      )
        .then((res: any) => {
          this.selectedItem = res;
          this.page = "view_ticket";
          this.requestUpdate();
        })
        .catch((err: any) => {
          console.log(err);
        });
    });
    this.requestUpdate();
  }
  homeHeader() {
    return html`
      <div
        class="chat-header"
        style="background-color: ${this.bg}; justify-content:${this.hasSearch
          ? "flex-start"
          : "space-between"};gap:${this.hasSearch ? "45px" : "10px"}"
      >
        ${this.hasSearch ? html`` : this.headerContent()} ${this.search()}
      </div>
    `;
  }

  pageHeader() {    
    return html`
      <div class="page-header-container" style="background-color: ${this.bg};">
        <div class="page-header">
          <back-button to="${this.getPreviousRoute()}"></back-button>
          ${choose(
            this.page,
            [
              [
                "ticket",
                () => html` <wc-agent-header
                  agent="${JSON.stringify(this.selectedItem?.data?.agent)}"
                ></wc-agent-header>`,
              ],
              [
                "view_ticket",
                () =>
                  html`<wc-agent-header
                    agent="${JSON.stringify(this.selectedItem?.data?.agent)}"
                  ></wc-agent-header>`,
              ],
            ],
            () => html` <div class="page-header-title">
              <p>${this.page}</p>
            </div>`
          )}
        </div>
      </div>
    `;
  }

  headerContent() {
    return html`
      <div class="chat-header-logo">
        <slot name="logo"></slot>
      </div>
      <div>
        <div class="chat-header-greetings">&#128075;</div>
        <div class="chat-header-greetings">${this.messages.greetings}</div>
        <div class="chat-header-message">${this.state.promptMessage}</div>
      </div>
    `;
  }

  search() {
    return html` <wc-search> </wc-search> `;
  }
  faqs() {
    return html` <wc-faqs> </wc-faqs> `;
  }
  viewFaq() {
    return html`
      <wc-view-faq
        id="${this.route}"
        name="${this.selectedItem?.name}"
        description="${this.selectedItem?.description}"
      />
    `;
  }
  ticket() {
    return html` <wc-thread></wc-thread> `;
  }
  viewTicket() {
    return html`
      <wc-thread ticket="${JSON.stringify(this.selectedItem)}"></wc-thread>
    `;
  }
  history() {
    return html` <wc-ticket-history></wc-ticket-history> `;
  }

  home() {
    return html`
      <div class="chat-padding">
        <div
          class="home-faqs-container"
          style="display: ${!this.hasFaqs ? "none" : "block"}"
        >
          <div class="home-faqs">
            <wc-faqs less></wc-faqs>
          </div>
        </div>
        <div class="chat-button history">
          <button
            class="start-chat"
            style="background-color: ${this.bg};"
            @click="${() => this.setPage("history", "")}"
          >
            <img
              width="15"
              height="15"
              src="${messages}"
              alt="message"
              style=" margin-right: 10px; margin-bottom: -2px;"
            />
            Tickets
          </button>
        </div>
        <div class="chat-button">
          <button
            class="start-chat"
            style="background-color: ${this.bg};"
            @click="${() => this.setPage("ticket", "")}"
          >
            <img
              width="15"
              height="15"
              src="${send}"
              alt="message"
              style="transform: rotate(45deg); margin-right: 10px; margin-bottom: -2px;"
            />
            Talk to us
          </button>
        </div>
      </div>
    `;
  }

  protected render(): unknown {
    return html`
      <div class="chat-container" style="color: ${this.color}">
        ${choose(this.page, [["home", () => this.homeHeader()]], () =>
          this.pageHeader()
        )}
        <div class="chat-body">
          ${choose(
            this.page,
            [
              ["home", () => this.home()],
              ["faqs", () => this.faqs()],
              ["faq", () => this.viewFaq()],
              ["ticket", () => this.ticket()],
              ["view_ticket", () => this.viewTicket()],
              ["history", () => this.history()],
            ],
            () => html``
          )}
        </div>

        <div class="chat-footer">
          <p>
            Powered by <span>Bonga <img src="${logoicon}" alt="brand" /> </span>
          </p>
        </div>
      </div>
      <slot name="close-btn"></slot>
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
    .chat-header {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      background-color: #0b163f;
      padding: 20px;
      border-radius: 20px 20px 0 0;
      height: 250px;
      display: flex;
      flex-direction: column;
    }
    .page-header-container {
      font-size: 20px;
      font-weight: bold;
      background-color: #0b163f;
      padding: 10px;
      border-radius: 20px 20px 0 0;
      display: flex;
      flex-direction: column;
    }
    .page-header {
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      padding: 5px 10px;
    }
    .page-header-title {
      font-size: 20px;
      font-weight: normal;
      color: inherit;
      text-transform: capitalize;
      flex: 1;
    }
    .page-header-title p {
      margin: 0;
    }
    .page-header-agent {
      font-size: 20px;
      font-weight: normal;
      color: inherit;
      text-transform: capitalize;
      flex: 1;
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: center;
      gap: 5px;
    }
    .page-header-agent > div > p:first-child {
      margin: 0 10px;
      font-size: 14px;
      font-weight: bold;
    }
    .page-header-agent > div > p:last-child {
      margin: 0 10px;
      font-size: 12px;
      font-weight: normal;
    }
    .chat-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #f2f2f2;
      border: 1px solid #d2d2d2;
      padding: 5px 0 0 5px;
    }
    .chat-header-greetings {
      font-size: 30px;
      font-weight: bold;
    }
    .chat-header-message {
      font-size: 18px;
      font-weight: normal;
    }
    .chat-header-logo {
      display: grid;
      place-items: center;
      width: 100%;
    }
    .chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .chat-padding {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
    }
    .chat-container {
      width: 350px;
      background-color: white;
      border: 1px solid #d2d2d2;
      border-radius: 21px;
      display: flex;
      flex-direction: column;
      min-height: 500px;
    }
    .chat-header-search {
      display: grid;
      place-items: center;
      margin-bottom: -40px;
      width: 100%;
      position: relative;
    }
    .search-results {
      display: flex;
      flex-direction: column;
      width: 90%;
      min-height: fit-content;
      max-height: 180px;
      overflow-y: scroll;
      background-color: #f2f2f2;
      color: #535353;
      border-radius: 5px;
      padding: 10px;
    }
    .search-result {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 5px;
      margin: 0;
    }
    .search-result:hover {
      background-color: #e2e2e2;
      cursor: pointer;
    }
    .search-results > :not(:last-child) {
      border-bottom: 1px solid #d2d2d2;
    }
    .result-title {
      font-size: 12px;
      font-weight: normal;
      margin: 0;
    }
    .result-description {
      font-size: 12px;
      font-weight: normal;
      text-align: justify;
    }
    .search-input {
      width: 90%;
      height: 20px;
      border-radius: 5px;
      border: 1px solid #d2d2d2;
      padding: 10px;
      outline: none;
    }
    .chat-button {
      display: grid;
      place-items: center;
      width: 100%;
    }
    .start-chat {
      width: 100%;
      height: 50px;
      background-color: #0b163f;
      color: white;
      border-radius: 5px;
      border: none;
      outline: none;
      cursor: pointer;
    }
    .chat-footer {
      padding: 5px;
      background-color: #f2f2f2;
      border-radius: 0 0 20px 20px;
      display: grid;
      place-items: center;
    }
    .chat-footer p {
      font-size: 12px;
      font-weight: normal;
      color: #a2a2a2;
    }
    .chat-footer span {
      font-size: 12px;
      font-weight: bold;
      color: #ef4823;
    }
    .home-faqs-container {
      display: grid;
      place-items: center;
      width: 100%;
      overflow: hidden;
    }
    .home-faqs {
      width: calc(100% - 2px);
      background-color: #ffffff;
      border: 1px solid #d2d2d2;
      color: white;
      border-radius: 5px;
      outline: none;
      cursor: pointer;
      overflow: hidden;
    }
  `;
}
declare global {
  interface HTMLElementTagNameMap {
    "wc-home": WcHome;
  }
}
