import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  Colors,
  State,
  colorContext,
  stateContext,
} from "../store/store-context";

@customElement("wc-agent-header")
export class WcAgentHeader extends LitElement {
  @property({ type: Object }) agent: { [key: string]: any } = {};
  @consume({ context: colorContext, subscribe: true })
  private colors!: Colors;

  @consume({ context: stateContext, subscribe: true })
  private state!: State;

  protected render(): unknown {
    return html`
      <div class="page-header-agent">
        ${this.agent
          ? html` <wc-avatar avatar=${this.agent}></wc-avatar> `
          : html`<div
              class="chat-avatar"
              style="background-color: ${this.colors?.textcolor}"
            >
              <mascot-svg></mascot-svg>
            </div>`}
        <div>
          ${!!this.agent
            ? html` <p>${this.agent}</p> `
            : html` <p>${this.state.orgName + " " + "support"}</p> `}
        </div>
      </div>
    `;
  }
  static styles = css`
    :host {
      width: 100%;
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
      width: 100%;
    }
    .page-header-agent > div > p:first-child {
      margin: 0 10px;
      font-size: 14px;
      font-weight: bold;
      width: 100%;
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-agent-header": WcAgentHeader;
  }
}
