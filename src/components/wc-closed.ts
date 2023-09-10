import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  Colors,
  Messages,
  State,
  colorContext,
  messageContext,
  stateContext,
} from "../store/store-context";
import send from "../assets/send.svg";
import "../components/buttons/close-button";
import "./mascot";

@customElement("wc-closed")
export class WcClosed extends LitElement {
  @consume({ context: messageContext, subscribe: true })
  private messages?: Messages;

  @consume({ context: colorContext, subscribe: true })
  private colors?: Colors;

  @consume({ context: stateContext, subscribe: true })
  private state?: State;

  @state()
  showIntro = false;

  connectedCallback(): void {
    super.connectedCallback();
    if (!!!localStorage.getItem("clientId")) {
      setTimeout(() => {
        this.showIntro = true;
      }, 3600);
    }
    this.shadowRoot?.addEventListener("close-chat", () => {
      this.showIntro = false;
      this.requestUpdate();
    });
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot?.removeEventListener("close-chat", () => {
      this.showIntro = false;
      this.requestUpdate();
    });
  }
  handleStartChat() {
    const event = new CustomEvent("start-chat", {
      bubbles: true,
      composed: true,
    });
     
    this.dispatchEvent(event);
  }

  message() {
    return html`
      ${this.showIntro && this.state?.hasPrompted
        ? html`
            <div class="chat-prompt">
              <close-button></close-button>
              <div class="chat-message">
                <p>${this.messages?.greetings} &#128075;</p>
                <p>${this.state.promptMessage}</p>
                <div class="call-to-action">
                  <button
                    class="start-chat"
                    style="background-color: ${this.colors
                      ?.primarycolor}; color: ${this.colors?.textcolor};"
                      @click=${() => this.handleStartChat()}
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
              <div
                style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; gap: 10px;"
              >
                <div
                  style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; "
                >
                  <p
                    style="font-size: 10px; color: #535353; font-weight: 900; margin:0; text-transform: capitalize;"
                  >
                    ${this.state.orgName} Support
                  </p>
                  <p
                    style="font-size: 10px; color: #535353; font-weight: 300; margin:0;"
                  >
                    ${new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div
                  class="chat-avatar"
                  style="background-color: ${this.colors?.primarycolor}"
                >
                  <mascot-svg></mascot-svg>
                </div>
              </div>
            </div>
          `
        : html``}
    `;
  }

  render() {
    return html`
      <div class="chat-container">
        ${this.message()}
        <slot name="chat-button"></slot>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .chat-container {
      background-color: white;
      border: none;
      border-radius: 31px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      color: #535353;
    }
    .chat-prompt {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      padding: 10px;
      gap: 10px;
      position: relative;
    }
    .chat-message {
      background-color: #f2f2f2;
      border-radius: 5px;
      padding: 5px 10px;
      font-size: 12px;
      border: 1px solid #d2d2d2;
      min-width: 200px;
      max-width: 250px;
    }
    .chat-message p {
      margin: 0;
      break-word: break-all;
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
    .start-chat {
      width: 100%;
      padding: 5px 10px;
      color: white;
      border-radius: 2px;
      border: none;
      outline: none;
      cursor: pointer;
      margin-top: 10px;
    }
  `;
}
declare global {
  interface HTMLElementTagNameMap {
    "wc-closed": WcClosed;
  }
}
