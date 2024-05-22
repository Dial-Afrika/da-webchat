import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import "../components/buttons/back-button";
import "../components/buttons/close-button";
import "../components/mascot";
import { State, messageContext, stateContext } from "../store/store-context";
import "./wc-agent-header";
import "./wc-editor";
import "./wc-faqs";
import "./wc-search";
import "./wc-svg";
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
  @state() selectedTicket: any = {};
  @state() selectedFaq: any = {};

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

  private handleTalkToUs() {
    this.setPage("ticket", "new_ticket");
    this.stackRoutes("ticket");
    this.addPageToState("ticket", "new_ticket");
  }

  private addPageToState(page: string, route: string) {
    this.state.page = page;
    this.state.route = route;
  }

  connectedCallback(): void {
    super.connectedCallback();
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

      if (page === "faq") this.selectedFaq = { ...rest };
      if (page === "view_ticket") this.selectedTicket = { ...rest };
    });
    this.shadowRoot?.addEventListener("onFaqs", () => {
      this.hasFaqs = true;
    });
    this.shadowRoot?.addEventListener("chat-started", () => {
      this.hasClientId = true;
    });

    this.requestUpdate();
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.hasSearch = false;
    this.hasFaqs = false;
    this.hasClientId = false;
    this.routes = [];
    this.route = "/";
    this.selectedTicket = {};
    this.selectedFaq = {};
    this.shadowRoot?.removeEventListener("onSearch", () => null);
    this.shadowRoot?.removeEventListener("onClose", () => null);
    this.shadowRoot?.removeEventListener("onBack", () => null);
    this.shadowRoot?.removeEventListener("onSeeAll", () => null);
    this.shadowRoot?.removeEventListener("onRoute", () => null);
    this.shadowRoot?.removeEventListener("onFaqs", () => null);
    this.shadowRoot?.removeEventListener("chat-started", () => null);
    this.shadowRoot?.removeEventListener("onMessage", () => null);
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
                  agent="${JSON.stringify(
                    this.selectedTicket.data
                      ? this.selectedTicket.data.agent
                      : this.selectedTicket.agent
                  )}"
                ></wc-agent-header>`,
              ],
              [
                "view_ticket",
                () =>
                  html`<wc-agent-header
                    agent="${JSON.stringify(this.selectedTicket?.data?.agent)}"
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
        <slot class="logo" name="logo"></slot>
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
        name="${this.selectedFaq?.data?.name}"
        description="${this.selectedFaq?.data.description}"
      />
    `;
  }
  ticket() {
    return html` <wc-thread></wc-thread> `;
  }
  viewTicket() {
    return html`
      <wc-thread ticket="${JSON.stringify(this.selectedTicket)}"></wc-thread>
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
            <wc-svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-message-circle"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                ></path>
              </svg>
            </wc-svg>
            Tickets
          </button>
        </div>
        <div class="chat-button">
          <button
            class="start-chat"
            style="background-color: ${this.bg};"
            @click="${this.handleTalkToUs}"
          >
            <wc-svg
              width="15"
              height="15"
              style="transform: rotate(45deg); margin-right: 10px; margin-bottom: -6px;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-send"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </wc-svg>
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
            Powered by
            <span
              >Bonga
              <wc-svg>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 50 49"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.00662807 20.7702C0.00662807 24.4081 -0.307616 28.7049 3.39139 30.5598C4.56786 31.1497 6.42799 31.8939 7.01357 30.0475C7.94853 27.0997 5.67037 20.6687 10.3873 12.8021C11.4849 10.972 12.3451 10.1296 13.806 8.67094C15.5002 6.97924 18.6892 5.38458 21.1206 4.77074C25.6966 3.61534 31.0624 4.58196 34.667 7.26342L35.9759 8.27917C36.642 8.78907 37.7641 9.99035 38.3194 10.6659C40.4497 13.2572 42.1549 16.9873 42.709 20.2842C43.4454 24.6651 43.2803 27.9705 41.6024 31.9848C40.6021 34.3784 38.498 37.1285 36.6236 39.0325C35.7707 39.8985 35.4761 39.6991 35.4761 41.3673C35.4761 41.7095 35.6714 42.2243 35.8218 42.4301C36.8684 43.8632 39.1604 41.8946 39.9936 41.0575C44.8797 36.146 44.0894 32.8475 46.359 31.1684C46.625 30.9715 46.8375 30.8607 47.0995 30.6634C48.1284 29.888 48.7287 28.9733 49.1921 27.7793C49.8104 26.1855 50.1438 22.8236 49.9403 21.2078C49.6085 18.5739 49.4773 15.5161 47.267 13.8548C46.8163 13.5162 46.1624 13.269 45.6059 13.0234C44.8597 12.6941 44.4592 12.5374 43.8941 11.9942C42.6506 10.7991 41.875 9.20642 40.786 7.88538C40.3602 7.36857 39.9777 7.04014 39.5699 6.52942L38.2724 5.33708C36.5925 4.0408 35.9918 3.4294 33.7292 2.32312C29.3155 0.164966 24.4441 -0.220709 19.674 1.10114C17.8568 1.60455 16.3489 2.33084 14.8312 3.23819L13.1501 4.3806C12.8735 4.58684 12.6107 4.76181 12.3508 4.99281L10.8515 6.31547C10.0256 7.14244 9.01713 8.36564 8.2971 9.32009L7.06424 10.9074C6.59921 11.406 6.11824 11.8083 5.55023 12.2159C4.9716 12.6308 4.40849 12.9475 3.83599 13.325C0.892149 15.2668 0.00662807 16.7401 0.00662807 20.7706V20.7702Z"
                    fill="#333235"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M30.5645 30.7794C31.3119 31.2767 30.9453 30.2281 30.6478 29.7868C29.6279 29.7868 29.6549 30.125 28.5478 29.8055C28.2949 29.7324 27.7694 29.5529 27.5565 29.546C27.0927 29.531 26.9848 29.7458 26.9848 30.2005C26.6436 30.2005 26.2325 30.1237 26.0024 29.9354L25.8852 29.8038C25.6322 29.5542 25.5309 29.6427 25.15 29.5412C24.9048 29.4758 24.77 29.3954 24.5697 29.2903C24.6874 28.853 25.8402 27.804 22.6332 28.4418C22.2466 28.5189 22.0578 28.5851 21.6909 28.6663C21.0489 28.808 21.0881 28.646 20.6562 28.5461C18.9485 29.682 19.5304 30.1485 18.895 30.5188C18.4634 30.7705 18.5325 30.6056 18.1357 31.0055C17.8615 31.282 17.1779 32.044 17.1055 32.4646C17.0365 32.8665 17.2649 32.9083 17.0708 33.5035C16.9646 33.8291 16.795 34.0678 16.7055 34.3869C16.4754 35.2057 17.1803 35.552 17.4933 35.9901C19.0862 38.2209 19.2509 37.355 20.8013 37.5039C21.4706 37.5685 21.5237 37.2567 22.178 37.1625C22.6111 37.1 22.6549 37.1913 22.7378 37.2319C23.2061 37.4605 22.5425 37.1495 23.2981 37.7504L23.8922 38.5729C24.2665 39.0316 23.7758 38.7994 24.119 39.4124C24.4157 39.9422 25.3388 40.5601 25.2636 41.9977C25.1888 43.4243 24.251 42.8275 25.293 44.8675C25.6825 45.6303 25.6584 46.0696 25.9113 46.735C26.031 47.0496 26.4221 47.6269 26.5181 48.0398C26.6003 48.3934 26.2991 48.9792 27.5332 48.7815C28.952 48.5546 28.8482 48.6252 30.0447 47.469C30.4468 47.0805 30.3197 47.2469 30.4962 46.6769C30.6442 46.1991 30.7643 46.3323 31.1178 46.0529C31.8476 45.4765 30.6581 44.8931 31.6466 44.3454C32.5337 43.8538 32.7973 43.9679 32.9583 43.0837C33.2472 41.4943 32.2795 41.1829 33.0106 39.9926C33.8634 38.6033 34.7314 38.4706 35.4518 37.2892C35.6945 36.8913 36.2597 35.9982 35.9765 35.4116C35.3419 35.1091 34.4474 36.0315 33.8904 35.5845C33.4908 35.2638 33.9104 35.6401 33.7584 35.2073C33.5582 34.6374 32.6011 34.9548 31.647 32.5161C31.2428 31.4833 30.7194 31.3559 30.5645 30.7794Z"
                    fill="#EF4823"
                  />
                </svg>
              </wc-svg>
            </span>
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

    
    /* Chat */
    .toggle-button {
      width: 50px;
      height: 50px;
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
      max-height: 250px;
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
    .chat-header-logo > slot {
      width: 100px;
      object-fit: contain;
    }
    .chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: scroll;
      overflow-x: hidden;
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
      max-height: 70vh;
    }
    /* Laptop */
    @media only screen and (min-width: 1024px) {
      .chat-container {
        width: 350px;
        min-width: 350px
        max-height: 80vh;
      }
    }
    

    /* Tablet */
    @media only screen and (min-width: 768px) and (max-width: 1023px) {
      .chat-container {
        width: 400px;
        min-width: 400px
        max-height: 70vh;
      }
    }

    /* Mobile */
    @media only screen and (min-width: 250px) and (max-width: 767px) {
      .chat-container {
        width: 100%;
        min-width: 100%;
        max-height: 60vh;
        border-radius: 0;
      }
      :host {
        bottom: 10px;
        right: 0;
        padding: 0 10px;
        min-width:80%;
      }
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
      background-color: #f2f2f2;
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
