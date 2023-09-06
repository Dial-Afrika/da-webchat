import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import x from "../../assets/x.svg";

@customElement("close-button")
class CloseButton extends LitElement {
  closeChat() {
    const event = new CustomEvent("close-chat", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  protected render(): unknown {
    return html`
      <button class="close-button" @click="${this.closeChat}">
        <img src="${x}" alt="chat" />
      </button>
    `;
  }
  static styles = css`
    :host {
    }
    .close-button {
      border: none;
      background-color: #f2f2f2;
      cursor: pointer;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      margin: 0;
      padding: 0;
      position: absolute;
      top: 10px;
      right: 10px;
      border: 1px solid #d2d2d2;
    }
    .close-button img {
      width: 15px;
      height: 15px;
    }
  `;
}
declare global {
  interface HTMLElementTagNameMap {
    "close-button": CloseButton;
  }
}
