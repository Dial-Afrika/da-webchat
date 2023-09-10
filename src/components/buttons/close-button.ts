import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../wc-svg";
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
        <wc-svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#797979"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-x"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </wc-svg>
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
