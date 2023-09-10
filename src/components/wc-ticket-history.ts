import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import {
  getLastMessage,
  getMoment,
  getTicket,
  getTickets,
  sortArray,
  truncateString,
} from "../functions/functions";
import { State, stateContext } from "../store/store-context";
import "./wc-avatar";

@customElement("wc-ticket-history")
export class WcTicketHistory extends LitElement {
  @state() tickets: any[] = [];

  @consume({ context: stateContext, subscribe: true })
  private state?: State;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    if (!this.state?.orgId) return;
    getTickets(`${this.state?.BASE_URL}`, this.state?.orgId)
      .then((res: any) => {
        this.tickets = res;
        this.requestUpdate();
      })
      .catch((err: any) => {
        console.log("tickets not fetched", err);
      });
  }

  handleViewTicket(ticket: any) {
    if (!this.state?.orgId && !ticket.id) return;
    getTicket(
      `${this.state?.BASE_URL}`,
      this.state?.orgId as string,
      ticket.id
    ).then((res: any) => {
      const onOpenTicket = new CustomEvent("onRoute", {
        detail: {
          route: `/${ticket?.id}`,
          page: "view_ticket",
          data: res,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(onOpenTicket);
    });
  }
  protected render(): unknown {
    return html`
      <div class="ticket-container">
        <div class="ticket-threads" id="thread">
          ${map(
            sortArray(this.tickets, "updated_at", "desc"),
            (ticket: any) => html`
              <div class="ticket" @click=${() => this.handleViewTicket(ticket)}>
                <div class="ticket-avatar">
                  <wc-avatar avatar=${ticket.agent ?? "Agent"}></wc-avatar>
                </div>
                <div class="ticket-details">
                  <p class="ticket-subject">
                    ${truncateString(
                      getLastMessage(ticket.threads)?.message ?? ticket.subject,
                      40
                    )}
                  </p>
                  <p class="ticket-date">
                    ${getMoment(
                      sortArray(ticket.threads, "created_at", "asc")[
                        ticket.threads.length - 1
                      ].updated_at
                    )}
                  </p>
                </div>
              </div>
            `
          )}
        </div>
      </div>
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
      width: 100%;
      overflow-y: scroll;
      align-items: center;
    }
    .ticket-threads {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;
      margin-top: auto;
      margin-bottom: 0;
    }
    .ticket {
      display: flex;
      flex-direction: row nowrap;
      justify-content: flex-start;
      align-items: flex-start;
      height: 100%;
      border-bottom: 1px solid #e5e5e5;
      padding: 0.5rem;
      gap: 10px;
    }
    .ticket:hover {
      cursor: pointer;
      background-color: #f5f5f5;
    }
    .ticket-details {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
    .ticket-details > * {
      margin: 0;
    }
    .ticket-id {
      font-size: 0.8rem;
      font-weight: 600;
      color: currentColor;
    }
    .ticket-subject {
      font-size: 12px;
      font-weight: 600;
      color: #3a3a3a;
    }
    .ticket-date {
      font-size: 10px;
      font-weight: 300;
      color: #6f6f6f;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-ticket-history": WcTicketHistory;
  }
}
