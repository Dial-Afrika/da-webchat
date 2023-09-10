import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getMoment, splitInfoAndLink } from "../functions/functions";
import { Colors, colorContext } from "../store/store-context";
import './wc-svg';
@customElement("wc-message")
export class WcMessage extends LitElement {
  @property({ type: String }) direction = "incoming";
  @property({ type: String }) message = "";
  @property({ type: String }) sender = "";
  @property({ type: String }) time = "";

  @consume({ context: colorContext, subscribe: true })
  private colors?: Colors;

  incomingMessage() {
    return html`
      <div class="chat-prompt">
        ${this.sender === "bot"
          ? html`
              <div
                class="chat-avatar"
                style="background-color: ${this.colors?.primarycolor}"
              >
                <mascot-svg width="20" height="20" />
              </div>
            `
          : html` <wc-avatar avatar="${this.sender}"></wc-avatar> `}
        <div
          class="chat-message"
          style="background-color: #f2f2f2; color: #484848"
        >
          <p>${this.message}</p>
          <slot name="children"></slot>
          <p class="time">${getMoment(this.time)}</p>
        </div>
      </div>
    `;
  }

  outgoingMessage() {
    return html`
      <div class="chat-prompt outgoing">
        <div
          class="chat-message outgoing"
          style="
          background-color: #0D724B65; 
          color: #2C2C2C;
          "
        >
          <p>${this.message}</p>
          <slot name="children"></slot>
          <p class="time">${getMoment(this.time)}</p>
        </div>
        <div
          class="user-avatar"
          style="background-color: ${this.colors
            ?.textcolor}; current-color: ${this.colors?.primarycolor};"
        >
          <wc-svg width="10" height="10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0D724B"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </wc-svg>
        </div>
      </div>
    `;
  }
  infoMessage() {
    return html`
      <div class="chat-prompt info">
        <div
          class="chat-message info"
          style="
          background-color:transparent; 
          color: #2C2C2C;
          "
        >
          <p>${splitInfoAndLink(this.message)[0]}</p>
          ${splitInfoAndLink(this.message)[1] !== ""
            ? html`<a
                href="${splitInfoAndLink(this.message)[1]}"
                target="_blank"
                >Track Ticket</a
              >`
            : html``}
        </div>
      </div>
    `;
  }

  protected render(): unknown {
    return html`
      ${this.direction === "incoming"
        ? this.incomingMessage()
        : this.direction === "info"
        ? this.infoMessage()
        : this.outgoingMessage()}
    `;
  }
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .chat-prompt {
      width: 100%;
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: flex-end;
      gap: 10px;
      position: relative;
    }
    .chat-prompt.outgoing {
      justify-content: flex-end;
    }
    .chat-message {
      width: 80%;
      background-color: #f2f2f2;
      border-radius: 5px;
      padding: 5px 10px;
      font-size: 12px;
    }
    .chat-message.outgoing {
      background-color: #007bff;
      color: #fff;
    }
    .chat-message.info {
      background-color: transparent;
      color: #2c2c2c;
      width: 100%;
      text-align: center;
      font-size: 10px;
      font-weight: 300;
    }
    .chat-message p {
      margin: 0;
    }
    .chat-avatar {
      width: 20px;
      height: 20px;
      min-width: 20px;
      min-height: 20px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #f2f2f2;
      border: 1px solid #d2d2d2;
    }
    .user-avatar{
      width: 20px;
      height: 20px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid #d2d2d2;
      display:grid;
      place-items:center;
    }
    .sender{
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: center;
      gap: 5px;
    }
    .user{
      flex-flow:row-reverse nowrap;
    }
    .sender p.sender-name {
      font-size: 10px;
      color: #535353;
      font-weight: 900;
      margin: 0;
      text-transform: capitalize;
    }
    .chat-message> p.time {
      font-size: 10px;
      color: #535353;
      font-weight: 300;
      margin: 0;
      width: 100%;
      text-align: right;
    }
    .
  `;
}
