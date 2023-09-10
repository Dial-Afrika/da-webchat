import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import paperclip from "../assets/paperclip.svg";
import { initializeChat, sendMessage } from "../functions/functions";
import {
  Colors,
  StateType,
  colorContext,
  stateContext,
} from "../store/store-context";

@customElement("wc-editor")
class WcEditor extends LitElement {
  @property({ type: String }) ticketId = "";
  @state() inputRef: HTMLTextAreaElement | null = null;

  @consume({ context: colorContext, subscribe: true })
  private colors!: Colors;

  @consume({ context: stateContext, subscribe: true })
  private state!: StateType;

  handleSubmit(event: Event) {
    event.preventDefault();
    const values = new FormData(event.target as HTMLFormElement);
    const message = values.get("message") as string;
    (this.inputRef as HTMLTextAreaElement).value = "";
    if (this.ticketId !== "") {
      sendMessage(
        `${this.state?.BASE_URL}`,
        `${this.state?.orgId}`,
        message,
        this.ticketId
      )
        .then((res: any) => {
          console.log("message sent", res);
          const onMessage = new CustomEvent("onMessage", {
            bubbles: true,
            composed: true,
            detail: {
              status: "success",
              data: res,
            },
          });
          this.dispatchEvent(onMessage);
        })
        .catch((err: any) => {
          console.log("message not sent",err);
        });
    } else {
      initializeChat(`${this.state?.BASE_URL}`, `${this.state?.orgId}`, {
        clientId: localStorage.getItem("clientId") ?? "",
        socketId: localStorage.getItem("socketId") ?? "",
        ticketMessage: message,
      })
        .then((res: any) => {

          const onMessage = new CustomEvent("onMessage", {
            bubbles: true,
            composed: true,
            detail: {
              data: {
                message: message,
                created_at: res.createdAt,
                updated_at: res.createdAt,
                client: res.clientId,
                ticketId: res.ticketId,
              },
            },
          });
          this.ticketId = res.ticketId;
          this.dispatchEvent(onMessage);
        })
        .catch(() => {
          console.log("message not sent");
        });
    }
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this.inputRef = this.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
  }
  protected render(): unknown {
    return html`
      <div class="editor-container">
        <div class="editor">
          <form class="form" @submit=${this.handleSubmit}>
            <textarea
              .ref="${this.inputRef}"
              rows="3"
              name="message"
              placeholder="Write us a message"
              required
            ></textarea>
            <div class="button-container">
              <button class="gray">
                <img width="15" height="15" src="${paperclip}" alt="attach" />
              </button>
              <button
                type="submit"
                style="background-color:${this.colors
                  .primarycolor}; color: #fff;"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
  static styles = css`
    :host {
    }
    .form {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
      padding: 10px 0px;
      border-top: 1px solid #d2d2d2;
    }
    .form textarea {
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      font-size: 12px;
      resize: none;
    }
    .form textarea:focus {
      outline: none;
    }
    .button-container {
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 0px 10px;
    }
    button {
      height: 30px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
    }
    button.gray {
      background-color: transparent;
      color: #535353;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-editor": WcEditor;
  }
}
