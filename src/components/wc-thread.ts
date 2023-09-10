import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { Socket, io } from "socket.io-client";
import { sortArray, splitInfoAndLink } from "../functions/functions";
import { Contact } from "../types/wc-types";
import "./wc-message";
import "./wc-ticket-form";

@customElement("wc-thread")
class WcThread extends LitElement {
  @property({ type: String, attribute: "ticket" })
  private _ticket: any = null;
  @property() ticketThread: any[] = [];
  @state() socket: Socket | null = null;
  @state() user: Contact | {} = {};
  @state() clientId: string = localStorage.getItem("clientId") || "";
  @state() ticketId: string = "";
  @state() agent: any = null;
  @state() agentPrompt: string = "";

  ioOptions = {
    transports: ["websocket"],
    reconnection: false,
    autoConnect: true,
  };
  constructor() {
    super();
    this.socket = io("https://chatdesk-prod.dialafrika.com/", this.ioOptions);
    this.socket.connect();

    this.socket.on("connect", () => {
      localStorage.setItem("socketId", this.socket?.id || "");
    });

    this.socket.on("no_agent_found", (data: any) => {
      this.ticketThread = [
        ...this.ticketThread,
        {
          message: data.message,
          updated_at: data.created_at,
          direction: "info",
        },
      ];
    });

    this.socket.on("agent_found", (data: any) => {
      this.agent = data.agent.name;
      this.agentPrompt = data.message;
      this.ticketThread = [
        {
          message: data.message,
          updated_at: data.agent.updated_at,
          direction: "info",
          agentId: data.agent.id,
        },
        ...this.ticketThread,
      ];
    });

    this.socket.on("message_from_agent", (data: any) => {
      this.ticketThread = [
        ...this.ticketThread,
        {
          message: data.message,
          updated_at: data.created_at,
          direction:
            splitInfoAndLink(data.message)[1] === "" ? "incoming" : "info",
          agentId: data.agentId,
          sender: data.agent,
        },
      ];
      this.requestUpdate();
    });

    this.socket.on("live_ticket_closed", (data: any) => {
      this.ticketThread = [
        ...this.ticketThread,
        {
          message: data.message,
          updated_at: data.created_at,
          direction: "info",
        },
      ];
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot?.addEventListener("chat-started", (e: any) => {
      this.user = e.detail;
      Object.keys(e.detail).forEach((key) => {
        localStorage.setItem(key, e.detail[key]);
      });
      this.clientId = localStorage.getItem("clientId") || "";
    });
    if (!!this._ticket) {
      this._ticket = JSON.parse(this._ticket)?.data;
      this.ticketId = this._ticket?.ticketId;
      this.ticketThread = [
        {
          message: this._ticket?.subject,
          updated_at: this._ticket?.created_at,
          direction: "outgoing",
        },
        ...(this._ticket?.threads ?? []),
      ];
    }
    this.shadowRoot?.addEventListener("onMessage", (e: any) => {
      this.ticketThread = [
        ...this.ticketThread,
        {
          message: e.detail.data.message,
          updated_at: e.detail.data.created_at,
          direction: "outgoing",
          clientId: e.detail.data.clientId,
        },
      ];
      this.ticketId = e.detail.data.ticketId ?? this.ticketId;
      console.log("message resp", e.detail.data);

      this.requestUpdate();
    });

    this.requestUpdate();
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.socket?.disconnect();
    this.user = {};
    this.clientId = "";
    this.ticketId = "";
    this.ticketThread = [];
    this.agent = null;
    this.agentPrompt = "";
    this._ticket = null;
  }
  protected render(): unknown {
    return html`
      <div class="ticket-container">
        <div class="ticket-threads" id="thread">
          <wc-message
            message="This is the start of your conversation. Messages you send here will be visible to the agent."
            direction="info"
          ></wc-message>
          <wc-ticket-form></wc-ticket-form>
          ${map(
            sortArray(this.ticketThread, "updated_at", "asc"),
            (thread: any) => html`
              <wc-message
                message="${thread.message}"
                direction="${thread.direction
                  ? thread.direction
                  : (thread.agentId && thread.clientId) ||
                    thread.message.toLowerCase().includes("no live agents")
                  ? "info"
                  : thread.agentId
                  ? "incoming"
                  : "outgoing"}"
                sender="${this._ticket?.agent ?? thread.sender}"
                time="${thread.updated_at}"
              ></wc-message>
            `
          )}
        </div>
      </div>
      <wc-editor ticketId="${this._ticket?.id ?? undefined}"></wc-editor>
    `;
  }
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;
      min-height: 500px;
      max-height: 500px;
    }
    .ticket-container {
      flex-grow: 1;
      width: calc(100% - 20px);
      overflow-y: scroll;
      overflow-x: hidden;
      align-items: center;
      padding: 10px;
    }
    .ticket-threads {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;
      gap: 10px;
      margin-top: auto;
      margin-bottom: 0;
    }
    .ticket-message {
      width: 100%;
    }
    .ticket-message p {
      font-size: 12px;
      font-weight: normal;
      text-align: center;
      color: inherit;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-thread": WcThread;
  }
}
