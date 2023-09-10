import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Colors, colorContext } from "../store/store-context";

@customElement("wc-svg")
class Wcsvg extends LitElement {
  @property({ type: String }) width = "30";
  @property({ type: String }) height = "30";

  @consume({ context: colorContext, subscribe: true })
  @property({ attribute: false })
  public colors?: Colors;

  protected render(): unknown {
    return html`
      <slot style="${Wcsvg.styles}"
      ></slot>
    `;
  }
  static styles = css`
    :host{
      margin: 0;
      height: fit-content;
      display:inline-grid;
      place-items: center;
    }
    `;
}
declare global {
  interface HTMLElementTagNameMap {
    "wc-svg": Wcsvg;
  }
}
