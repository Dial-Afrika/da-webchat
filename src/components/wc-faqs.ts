import { consume } from "@lit-labs/context";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { getFaqs } from "../functions/functions";
import { State, stateContext } from "../store/store-context";
import { Result } from "../types/wc-types";

@customElement("wc-faqs")
class WcFaqs extends LitElement {
  @property({ type: Boolean }) less = false;
  @state() faqs: Result[] = [];

  @consume({ context: stateContext, subscribe: true })
  private state?: State;

  promptFaqs() {
    const onPromptFaqs = new CustomEvent("onFaqs", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onPromptFaqs);
  }
  connectedCallback(): void {
    super.connectedCallback();
    getFaqs(`${this.state?.BASE_URL}`, `${this.state?.orgId}`)
      .then((res: Result[]) => {
        localStorage.setItem("faqs", JSON.stringify(res));
        this.faqs = res;
        this.promptFaqs();
      })
      .catch((err: any) => {
        console.warn(err);
      });
    this.requestUpdate();
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.faqs = [];
  }

  handleSeeAll() {
    const onSeeAll = new CustomEvent("onSeeAll", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onSeeAll);
  }
  handleOpenFaqs(faq: Result) {
    const onOpenFaqs = new CustomEvent("onRoute", {
      detail: {
        route: `/${faq?.id}`,
        page: "faq",
        data: faq,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onOpenFaqs);
  }
  protected render(): unknown {
    return html`
      <div
        class="search-results"
        style="overflow-y:${this.less ? "hidden" : "scroll"}"
      >
        ${map(
          [...(this.faqs.length===0? JSON.parse(localStorage.getItem("faqs") || "[]"):this.faqs).slice(0, this.less ? 3 : this.faqs.length)],
          (result: Result) =>
            html`
              <div
                class="search-result"
                @click="${() => this.handleOpenFaqs(result)}"
              >
                📄
                <p class="result-title">${result.name}</p>
              </div>
            `
        )}
        ${this.less
          ? html`
              <div class="search-result" @click="${() => this.handleSeeAll()}">
                📄
                <p class="result-title">See All</p>
              </div>
            `
          : html``}
      </div>
    `;
  }
  static override styles = css`
    :host {
    }
    .search-results {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: 350px;
      overflow-y: scroll;
      overflow-x: hidden;
      color: #535353;
      border-radius: 5px;
    }
    .search-result {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 5px;
      margin: 0;
      width: 100%;
    }
    .search-result:hover {
      background-color: #e2e2e2;
      cursor: pointer;
    }
    .search-results > :not(:last-child) {
      border-bottom: 1px solid #d2d2d2;
    }
    .result-title {
      font-size: 12px;
      font-weight: normal;
      margin: 0;
    }
    .result-description {
      font-size: 12px;
      font-weight: normal;
      text-align: justify;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wc-faqs": WcFaqs;
  }
}
