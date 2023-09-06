import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  Colors,
  State,
  colorContext,
  stateContext,
} from "../store/store-context";
import "./wc-message";
import { initializeChat } from "../functions/functions";

@customElement("wc-ticket-form")
export class WcTicketForm extends LitElement {
  @state() currentStep = 0;
  @state() clientId = localStorage.getItem("clientId") ?? "";
  @state() ticketMessage = "";
  @state() contactName = "";
  @state() contactEmail = "";
  @state() contactMobile = "";

  @state() inputRef: HTMLInputElement | null = null;

  @consume({ context: stateContext, subscribe: true })
  private state?: State;

  @consume({ context: colorContext, subscribe: true })
  private colors!: Colors;

  steps = [
    {
      label:
        "Hey there, let's get to know each other \nwhile an agent is being assigned to you. \nWhat's your name?",
      name: "contactName",
      type: "text",
    },
    {
      label: "What is the best email to reach you at?",
      name: "contactEmail",
      type: "email",
    },
    {
      label: "How about your phone number?",
      name: "contactMobile",
      type: "tel",
    },
    {
      label: "Any message for the agent before they join?",
      name: "ticketMessage",
      type: "text",
    },
  ];

  handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const inputValues: { [key: string]: string } = {};
    formData.forEach((value, name) => {
      inputValues[name] = value.toString();
    });
    switch (this.currentStep) {
      case 0:
        this.contactName = inputValues.contactName;
        break;
      case 1:
        this.contactEmail = inputValues.contactEmail;
        break;
      case 2:
        this.contactMobile = inputValues.contactMobile;
        break;
      case 3:
        this.ticketMessage = inputValues.ticketMessage;
        break;
      default:
        break;
    }
    (this.inputRef as HTMLInputElement).value = "";
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.currentStep++;

      initializeChat(
        this.state?.BASE_URL as string,
        this.state?.orgId as string,
        {
          contactName: this.contactName,
          contactEmail: this.contactEmail,
          contactMobile: this.contactMobile,
          ticketMessage: this.ticketMessage,
          socketId: localStorage.getItem("socketId") ?? "",
        }
      )
        .then((res) => {
          console.log(res);
          localStorage.setItem("ticketId", res?.ticketId);
          localStorage.setItem("clientId", res?.clientId);
          this.clientId = res?.clientId;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          const event = new CustomEvent("chat-started", {
            detail: {
              contactName: this.contactName,
              contactEmail: this.contactEmail,
              contactMobile: this.contactMobile,
              ticketMessage: this.ticketMessage,
              clientId: localStorage.getItem("clientId") ?? "",
              ticketId: localStorage.getItem("ticketId") ?? "",
            },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        });
    }
    this.requestUpdate();
  }

  renderStep() {
    const step = this.steps[this.currentStep];
    return html`
      <wc-message
        message="${step.label}"
        sender="${this.state?.orgName} Support"
        time="${new Date().toLocaleTimeString()}"
      >
        <form
          key="${step}-${this.steps[this.currentStep]}"
          slot="children"
          class="form"
          @submit=${this.handleSubmit}
        >
          <input
            .ref="${this.inputRef}"
            type=${step.type}
            name=${step.name}
            required
          />
          <button
            style="background-color:${this.colors.primarycolor}; color: #fff;"
          >
            Next
          </button>
        </form>
      </wc-message>
    `;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this.inputRef = this.shadowRoot?.querySelector("input") as HTMLInputElement;
  }
  protected render(): unknown {
    return html`
      ${this.contactName?.length > 0
        ? html`
            <wc-message
              message="Nice to meet you ${this.contactName}!"
              direction="incoming"
            >
            </wc-message>
          `
        : html``}
      ${this.contactEmail?.length > 0
        ? html`
            <wc-message
              message="Great!, ${this
                .contactEmail} has been set as your primary email"
              direction="incoming"
            >
            </wc-message>
          `
        : html``}
      ${this.contactMobile?.length > 0
        ? html`
            <wc-message
              message="Awesome, ${this
                .contactMobile} has been set as your primary phone number. Thanks for sharing!,
 We have all the information we need to get started."
              direction="incoming"
            >
            </wc-message>
          `
        : html``}
      ${this.ticketMessage?.length > 0
        ? html`
            <wc-message
              message="${this.ticketMessage}"
              sender="You"
              time="${new Date().toLocaleTimeString()}"
              direction="outgoing"
            >
            </wc-message>
          `
        : html``}
      ${this.currentStep < this.steps.length && !this.clientId
        ? this.renderStep()
        : html``}
    `;
  }
  static styles = css`
    :host {
      display: flex;
      flex-flow: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
      padding: 0px;
      color: #484848;
    }

    button {
      background-color: #007bff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
    }
    .chat-prompt {
      display: flex;
      flex-direction: column;
      width: 100%;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 10px 0px;
      position: relative;
    }
    .form {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
      padding: 10px 0px;
    }
    .form input {
      padding: 8px 16px;
      border: 1px solid #d2d2d2;
      border-radius: 5px;
      font-size: 12px;
    }
    .form button {
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
    }
    .chat-message p {
      margin: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-ticket-form": WcTicketForm;
  }
}
