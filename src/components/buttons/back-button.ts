import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import back from "../../assets/back.svg";

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
        <img src="${back}" alt="back" />
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
