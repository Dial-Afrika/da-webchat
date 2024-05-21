import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { initializeChat, sendMessage } from "../functions/functions";
import {
  StateType,
  colorContext,
  stateContext,
} from "../store/store-context";

@customElement("wc-editor")
class WcEditor extends LitElement {
  @property({ type: String }) ticketId = localStorage.getItem("ticketId") ?? "";
  @state() inputRef: HTMLTextAreaElement | null = null;

  @consume({ context: colorContext, subscribe: true })

  @consume({ context: stateContext, subscribe: true })
  private state!: StateType;

  handleSubmit(event: Event) {
    event.preventDefault();
    const values = new FormData(event.target as HTMLFormElement);
    const message = values.get("message") as string;
    (this.inputRef as HTMLTextAreaElement).value = "";
    if (localStorage.getItem("ticketId") || this.ticketId !== "") {
      sendMessage(
        `${this.state?.BASE_URL}`,
        `${this.state?.orgId}`,
        message,
        this.ticketId !== ""
          ? this.ticketId
          : localStorage.getItem("ticketId") ?? ""
      )
        .then((res: any) => {
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
          console.warn("message not sent", err);
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
          console.warn("message not sent");
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
            
              <button
                type="submit"
                style="background-color:transparent; color: #fff;"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-send-2"
                  width="18"
                  height="17"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="#2c3e50"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z"
                  />
                  <path d="M6.5 12h14.5" />
                </svg>
              </button>
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
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
      padding: 10px 0px;
      border-top: 1px solid #d2d2d2;
    }
    .form textarea {
      flex-grow: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      font-size: 12px;
      resize: none;
      background-color: #ffffff;
    }
    .form textarea:focus {
      outline: none;
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
