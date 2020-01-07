// https://stackoverflow.com/questions/54508917/how-can-i-get-web-components-to-compile-with-typescript-for-ie11-edge-chrome-fir
import "@webcomponents/webcomponentsjs/webcomponents-bundle";
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js";

/**
 * Note that I prefer not to extend the native Button element bec of the lack of browser support
 */
(function() {
  const KEYCODE = {
    ENTER: 13
  };

  const template = document.createElement("template");
  template.innerHTML = `
      <style>
        :host {
          /* Reset*/
          box-sizing: border-box;
          cursor: pointer;
          outline: none;
          user-select: none;

          /* Common */
          display: inline-flex;
          transition: transform 150ms ease-out, background 150ms ease-out, box-shadow 150ms ease-out;

          background: #e0ecf1;
          border: 0;
          border-radius: var(--border-radius, 0);
          color: #333;
          font-size: var(--font-size, 16);
          padding: 12px 16px;
        }

        :host(:hover) {
          background: #bfd5de;
          box-shadow: #bfd5de 0px 2px 6px 0px;
          transform: translate3d(0px, -2px, 0px);
        }

        :host(:active) {
          transform: translate3d(0, 0, 0);
        }
        
        :host(:focus) {
          box-shadow: #e0ecf1 0px 1px 9px 2px;
        }
        :host(:focus:hover) {
          box-shadow: #ebf3f7 0px 8px 18px 0px;
        }

        :host([disabled]) {
          cursor: not-allowed;
          filter: grayscale(1);
          opacity: 0.6;
        }
      </style>
      <slot></slot>
    `;

  class GorgUiButton extends HTMLElement {
    static get observedAttributes() {
      return ["disabled"];
    }

    constructor() {
      super();

      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      // Accessiblity stuff
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "button");
      }

      if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }

      // Set initial property values
      this._upgradeProperty("disabled");

      this.addEventListener("keyup", this._onKeyUp);
      this.addEventListener("click", this._onClick);

      console.log(
        "%c🦋%cgorgui-button%c is added to the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    disconnectedCallback() {
      this.removeEventListener("keyup", this._onKeyUp);
      this.removeEventListener("click", this._onClick);

      console.log(
        "%c🦋%cgorgui-button%c is removed from the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    set disabled(value) {
      const isDisabled = Boolean(value);
      if (isDisabled) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      const hasValue = newValue !== null;
      switch (name) {
        case "disabled":
          this.setAttribute("aria-disabled", hasValue.toString());

          if (hasValue) {
            // to make sure an element is disabled and not focusable
            this.removeAttribute("tabindex");
            // unfocus
            this.blur();
          } else {
            this.setAttribute("tabindex", "0");
          }

          break;
      }
    }

    adoptedCallback() {
      console.log(
        "%c🦋%cgorgui-button%c is has been adopted",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    _onKeyUp(event: KeyboardEvent) {
      if (event.altKey) {
        return;
      }

      switch (event.keyCode) {
        case KEYCODE.ENTER:
          event.preventDefault();
          this.click();
          break;

        default:
          return;
      }
    }

    _onClick(event: MouseEvent) {
      if (this.disabled) {
        event.preventDefault();
      }
    }

    _upgradeProperty(prop: string) {
      if (this.hasOwnProperty(prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  customElements.define("gorgui-button", GorgUiButton);
})();
