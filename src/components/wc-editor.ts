import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  initializeChat,
  postAttachments,
  sendMessage,
} from "../functions/functions";
import { StateType, stateContext } from "../store/store-context";
import { map } from "lit/directives/map.js";

@customElement("wc-editor")
class WcEditor extends LitElement {
  @property() ticketId : string = "";
  @state() inputRef: HTMLTextAreaElement | null = null;
  @state() uploadRef: HTMLInputElement | null = null;
  @state() fileNames: string[] = [];
  @state() files: File[] = [];

  @consume({ context: stateContext, subscribe: true })
  private state!: StateType;

  handleSubmit(event: Event) {
    event.preventDefault();
    const values = new FormData(event.target as HTMLFormElement);
    const message = values.get("message") as string;
    (this.inputRef as HTMLTextAreaElement).value = "";
    (this.uploadRef as HTMLInputElement).files = null;
    postAttachments(
      `${this.state?.BASE_URL}`,
      `${this.state?.orgId}`,
      this.files
    )
      .then((attachmentIds: string[]) => {
        this.files = [];
        if (this.state?.page === "ticket" && this.state?.route === "new_ticket") {
          initializeChat(`${this.state?.BASE_URL}`, `${this.state?.orgId}`, {
            clientId: localStorage.getItem("clientId") ?? "",
            socketId: localStorage.getItem("socketId") ?? "",
            ticketMessage: message,
            attachmentIds: attachmentIds,
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
              this.state.route = "active_ticket";
              this.dispatchEvent(onMessage);
            })
            .catch(() => {
              console.warn("message not sent");
            });
        } else if (this.ticketId) {
          sendMessage(
            `${this.state?.BASE_URL}`,
            `${this.state?.orgId}`,
            message,
            attachmentIds ?? [],
            this.ticketId
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
          console.log(`page, route and ticketId:${this.state?.page}, ${this.state?.route}, ${this.ticketId}`);
        }
      })
      .catch((err: any) => {
        console.warn("attachments not uploaded", err);
      });
  }

  handleSelectFile(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.fileNames.includes(files[i].name)) {
          continue;
        }
        this.fileNames = [...this.fileNames, files[i].name];
        this.files = [...this.files, files[i]];
      }
    }
  }
  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this.inputRef = this.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    this.uploadRef = this.shadowRoot?.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;
  }

  protected render(): unknown {
    return html`
      <div class="editor-container">
        <div class="editor">
          <form class="form" @submit="${this.handleSubmit}">
            <textarea
              .ref="${this.inputRef}"
              rows="3"
              name="message"
              placeholder="Write us a message"
              required
            ></textarea>
            <div class="file file--upload">
              <label for="input-file">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-paperclip"
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
                    d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"
                  />
                </svg>
              </label>
              <input
                .ref="${this.uploadRef}"
                id="input-file"
                type="file"
                name="attachments"
                multiple
                accept="image/*, application/pdf"
                @change="${this.handleSelectFile}"
              />
            </div>
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
        <div class="file-list">
          <!-- ${map(this.fileNames, (file: string) => {
            return html` <div>${file}</div> `;
          })} -->
          ${map(this.files, (file: File) => {
            const url = URL.createObjectURL(file);
            return html` <div>
              ${file.type.includes("image")
                ? html`<img
                    src="${url}"
                    class="attachment_image"
                    alt="${file.name}"
                  />`
                : html`
                    <div class="attachment_image">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-file-type-pdf"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="#2c3e50"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
                        <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
                        <path d="M17 18h2" />
                        <path d="M20 15h-3v6" />
                        <path
                          d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z"
                        />
                      </svg>
                    </div>
                  `}
            </div>`;
          })}
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
      align-items: flex-start;
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
      border: none;
      cursor: pointer;
    }
    button.gray {
      background-color: transparent;
      color: #535353;
    }
    .file {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .file > input[type="file"] {
      display: none;
    }

    .file > label {
      font-size: 1rem;
      font-weight: 300;
      cursor: pointer;
      outline: 0;
      user-select: none;
    }
    div.file-list {
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      padding: 5px;
      border-top: 1px solid #d2d2d2;
    }
    .attachment_image {
      width: 30px;
      height: 30px;
      object-fit: cover;
      border-radius: 5px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-editor": WcEditor;
  }
}
