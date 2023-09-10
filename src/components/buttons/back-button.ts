import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../wc-svg";

@customElement("back-button")
class BackButton extends LitElement {
  @property({ type: String }) to = "";
  handleBack() {
    const event = new CustomEvent("onBack", {
      detail: {
        route: this.to,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
  protected render(): unknown {
    return html`
      <button class="back-button" @click="${this.handleBack}">
        <wc-svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2f2f2" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </wc-svg>
      </button>
    `;
  }
  static styles = css`
    :host {
    }
    .back-button {
      border: none;
      background-color: transparent;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      margin: 0;
      padding: 0;
    }
    .back-button img {
      width: 25px;
      height: 25px;
    }
  `;
}
declare global {
  interface HTMLElementTagNameMap {
    "back-button": BackButton;
  }
}
