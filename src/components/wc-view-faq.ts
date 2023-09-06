import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Colors, colorContext } from "../store/store-context";

@customElement("wc-view-faq")
class WcViewFaq extends LitElement {
  @property({ type: String }) id = "";
  @property({ type: String }) name = "";
  @property({ type: String }) description = "";

  @consume({ context: colorContext, subscribe: true })
  private colors?: Colors;
  protected render(): unknown {
    return html`<div class="container">
      <div class="name" style="color: ${this.colors?.primarycolor}">
        ${this.name}
      </div>
      <div class="description">${this.description}</div>
    </div>`;
  }
  static styles = css`
    :host {
    }
    .container {
      padding: 1rem;
    }
    .name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .description {
      font-size: 12px;
      color: #666;
      text-align: justify;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-view-faq": WcViewFaq;
  }
}
