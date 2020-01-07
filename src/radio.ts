// https://stackoverflow.com/questions/54508917/how-can-i-get-web-components-to-compile-with-typescript-for-ie11-edge-chrome-fir
import "@webcomponents/webcomponentsjs/webcomponents-bundle";
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js";

(function() {
  const KEYCODE = {
    SPACE: 32
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

        height: 24px;
        width: 24px;

        border: 2px solid #e0ecf1;
        border-radius: 50%;
        position: relative;
        transition: transform 150ms ease-out, background 150ms ease-out, box-shadow 150ms ease-out;
      }

      :host(:hover) {
        box-shadow: rgba(224, 236, 241, 0.5) 0px 0px 2px 2px inset, #bfd5de 0px 2px 6px 0px;
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

      :host([checked]) {
        background: #e0ecf1;
      }
      :host:after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;

        background: #bfd5de;
        border-radius: 50%;
        opacity: 0.6;
        padding: 6px;
        transform: scale3d(0, 0, 0);
        transition: transform 150ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
      }
      :host([checked]):after {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }

      :host([disabled]) {
        cursor: not-allowed;
        filter: grayscale(1);
        opacity: 0.6;
      }
    </style>
  `;

  class GorgUiRadio extends HTMLElement {
    static get observedAttributes() {
      return ["checked", "disabled"];
    }

    constructor() {
      super();

      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "radio");
      }

      if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }

      // Set initial property values
      this._upgradeProperty("checked");
      this._upgradeProperty("disabled");

      this.addEventListener("keyup", this._onKeyUp);
      this.addEventListener("click", this._onClick, { once: true });

      console.log(
        "%c🦋%cgorgui-radio%c is added to the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    disconnectedCallback() {
      this.removeEventListener("keyup", this._onKeyUp);
      this.removeEventListener("click", this._onClick);

      console.log(
        "%c🦋%cgorgui-radio%c is removed from the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    set checked(value) {
      const isChecked = Boolean(value);
      if (isChecked) {
        this.setAttribute("checked", "");
      } else {
        this.removeAttribute("checked");
      }
    }
    get checked() {
      return this.hasAttribute("checked");
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

    _onClick(event: MouseEvent) {
      this._toggleChecked();
    }

    _toggleChecked() {
      if (this.disabled) {
        return;
      }

      this.checked = !this.checked;

      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            checked: this.checked
          },
          bubbles: true
        })
      );
    }

    _onKeyUp(event: KeyboardEvent) {
      if (event.altKey) {
        return;
      }

      switch (event.keyCode) {
        case KEYCODE.SPACE:
          event.preventDefault();
          this.click();
          break;

        default:
          return;
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

  customElements.define("gorgui-radio", GorgUiRadio);
})();
