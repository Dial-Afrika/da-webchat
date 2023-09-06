import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Colors, colorContext } from "../store/store-context";

@customElement("wc-avatar")
export class WcAvatar extends LitElement {
  @property() avatar = "Agent Name";
  @state() firstChar = "";
  @state() secondChar = "";

  @consume({ context: colorContext, subscribe: true })
  private colors!: Colors;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    const [firstChar, secondChar] = this.avatar.split(" ");
    this.firstChar = firstChar?.charAt(0);
    this.secondChar = secondChar?.charAt(0);
    this.requestUpdate();
  }

  protected render(): unknown {
    return html`
      <div
        class="avatar"
        style="background-color: ${this.colors.primarycolor}; color: ${this
          .colors.textcolor}"
      >
        <p>${this.firstChar}${this.secondChar}</p>
      </div>
    `;
  }
  static styles = css`
    :host {
      display: block;
    }
    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
      display: grid;
      place-items: center;
      border: 1px solid #D2D2D2;
    }
    .avatar:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    .avatar p {
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      text-transform: uppercase;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-avatar": WcAvatar;
  }
}
