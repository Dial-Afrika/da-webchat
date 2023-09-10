import { consume } from "@lit-labs/context";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { searchFaqs } from "../functions/functions";
import { StateType, stateContext } from "../store/store-context";
import { Result } from "../types/wc-types";

@customElement("wc-search")
class WcSearch extends LitElement {
  @state() hasSearch = false;
  @state() results: Result[] = [];
  @state() searchValue = "";

  @state() inputRef: HTMLInputElement | null = null;

  @consume({ context: stateContext, subscribe: true })
  private state!: StateType;

  //   Search Functions
  handleSearch(value: string) {
    this.searchValue = value;
    this.results = [];
    if (value.length > 0) {
      this.hasSearch = true;
    } else {
      this.hasSearch = false;
    }
    if (value.length > 2) {
      searchFaqs(`${this.state?.BASE_URL}`, `${this.state?.orgId}`, value).then(
        (res: Result[]) => {
          this.results = res;
        }
      );
    }
  }
  handleClose() {
    this.hasSearch = false;
    this.results = [];
    this.searchValue = "";
    this.inputRef?.blur();
    (this.inputRef as HTMLInputElement).value = "";
    this.requestUpdate();
  }
  toggleSearch() {
    this.hasSearch = true;
    const onSearch = new CustomEvent("onSearch", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onSearch);
  }
  closeSearch() {
    const onClose = new CustomEvent("onClose", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onClose);
    this.handleClose();
  }
  handleSeeAll() {
    this.closeSearch();
    const onSeeAll = new CustomEvent("onSeeAll", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(onSeeAll);
  }
  handleOpenFaqs(faq: Result) {
    this.closeSearch();
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
  //   Search Input
  searchInput() {
    return html`
      <div class="chat-header-search">
        <input
          type="text"
          class="search-input"
          placeholder="Search FAQs"
          .ref=${this.inputRef}
          @focus="${() => this.toggleSearch()}"
          @input="${(e: any) => this.handleSearch(e.target.value)}"
        />
        ${this.hasSearch
          ? html`
              <close-button @click="${() => this.closeSearch()}"></close-button>
            `
          : html``}
      </div>
    `;
  }
  //   Search Results
  searchResults() {
    return html`
      <div class="chat-header-search">
        <div class="search-results">
          ${map(
            this.results,
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
          <div class="search-result" @click="${() => this.handleSeeAll()}">
            📄
            <p class="result-title">See All</p>
          </div>
        </div>
      </div>
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
      ${this.searchInput()} ${this.hasSearch ? this.searchResults() : html``}
    `;
  }
  static styles = css`
    :host {
      display: flex;
      flex-flow: column;
      gap: 45px;
    }
    .chat-header-search {
      display: grid;
      place-items: center;
      margin-bottom: -40px;
      width: 100%;
      position: relative;
    }
    .search-results {
      display: flex;
      flex-direction: column;
      width: 90%;
      min-height: fit-content;
      max-height: 180px;
      overflow-y: scroll;
      background-color: #f2f2f2;
      color: #535353;
      border-radius: 5px;
      padding: 10px;
    }
    .search-result {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 5px;
      margin: 0;
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
    .search-input {
      width: 90%;
      height: 20px;
      border-radius: 5px;
      border: 1px solid #d2d2d2;
      padding: 10px;
      outline: none;
    }
    .chat-button {
      display: grid;
      place-items: center;
      width: 100%;
    }
    .start-chat {
      width: 300px;
      height: 50px;
      background-color: #0b163f;
      color: white;
      border-radius: 5px;
      border: none;
      outline: none;
      cursor: pointer;
    }
    .chat-footer {
      padding: 5px;
      background-color: #f2f2f2;
      border-radius: 0 0 30px 30px;
      display: grid;
      place-items: center;
    }
    .chat-footer p {
      font-size: 12px;
      font-weight: normal;
      color: #a2a2a2;
    }
    .chat-footer span {
      font-size: 12px;
      font-weight: bold;
      color: #ef4823;
    }
  `;
}
declare global {
  interface HTMLElementTagNameMap {
    "wc-search": WcSearch;
  }
}
