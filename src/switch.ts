// https://stackoverflow.com/questions/54508917/how-can-i-get-web-components-to-compile-with-typescript-for-ie11-edge-chrome-fir
import "@webcomponents/webcomponentsjs/webcomponents-bundle";
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js";

(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    SPACE: 32
  };

  /**
   * Define the component's HTML template
   * Cloning contents from a <template> element is more performant than using innerHTML because it avoids additional HTML parse costs
   */
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
          height: 42px;
          width: 58px;
          transition: transform 150ms ease-out, background 150ms ease-out, box-shadow 150ms ease-out;

          border: 1px solid #e0ecf1;
          border-radius: 42px;
          position: relative;
        }

        :host:after {
          position: absolute;
          left: 2px;
          top: 2px;

          height: 36px;
          width: 36px;

          background-color: #e0ecf1;
          border-radius: 36px;
          content: '';
          transition: 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }

        :host(:hover) {
          box-shadow: #bfd5de 0px 2px 6px 0px;
          transform: translate3d(0px, -2px, 0px);
        }

        :host(:active) {
          transform: translate3d(0, 0, 0);
        }
        :host(:active):after {
          width: 42px;
        }

        :host(:focus) {
          box-shadow: #e0ecf1 0px 1px 9px 2px;
        }
        :host(:focus:hover) {
          box-shadow: #ebf3f7 0px 8px 18px 0px;
        }

        :host([checked]) {
          background-color: #e0ecf1;
        }
        :host([checked]):after {
          background-color: #bfd5de;
          left: calc(100% - 2px);
          transform: translateX(-100%);
        }

        :host([disabled]) {
          cursor: not-allowed;
          filter: grayscale(1);
          opacity: 0.6;
        }
      </style>
    `;

  class GorgUiSwitch extends HTMLElement {
    /**
     * Sets which attributes changes will trigger the attributeChangedCallback
     */
    static get observedAttributes() {
      return ["checked", "disabled"];
    }

    /**
     * lifecycle hook `constructor`: Triggers when a new instance is created
     * Can be used for creating an instance of the Shadow DOM,
     * setting up event listeners and for intializing a component’s state,
     * but it’s not recommended to execute tasks like rendering or fetching resources here
     */
    constructor() {
      /**
       * Makes sure that the component inherits the correct prototype chain and
       * all properties and methods of the class it extends
       */
      super();

      /**
       * Element.attachShadow() <optional>:
       * Attaches a new element as part of a Shadow Tree to a host element
       */
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    /**
     * lifecycle hook `connectedCallback`: Triggers when an element is added to the DOM
     * ideal place to set attributes, fetch resources, and install event listeners
     */
    connectedCallback() {
      // Accessiblity stuff
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "checkbox");
      }

      if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }

      // Set initial property values
      this._upgradeProperty("checked");
      this._upgradeProperty("disabled");

      this.addEventListener("keyup", this._onKeyUp);
      this.addEventListener("click", this._onClick);

      console.log(
        "%c🦋%cgorgui-switch%c is added to the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    /**
     * lifecycle hook `disconnectedCallback`: Triggers when an element is removed from the DOM
     * ideal place to add cleanup logic (the code that needs to be executed before the element is destroyed)
     * and to free up resources
     */
    disconnectedCallback() {
      this.removeEventListener("keyup", this._onKeyUp);
      this.removeEventListener("click", this._onClick);

      console.log(
        "%c🦋%cgorgui-switch%c is removed from the DOM",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    // Property to attribute reflection
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

    /**
     * lifecycle hook `attributeChangedCallback`: Triggers when attributes (specified in `observedAttributes`) are
     * added, removed, updated or replaced or when an instance of a component is upgraded
     * @param name
     * @param oldValue
     * @param newValue
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      const hasValue = newValue !== null;
      switch (name) {
        case "checked":
          // Handle side effects like applying ARIA states.
          this.setAttribute("aria-checked", hasValue.toString());
          break;
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

    /**
     * lifecycle hook `adoptedCallback`: Triggers when the element is adapted into a new document
     * i.e. someone called document.adoptNode(element), or in general dealing with <iframe/> elements
     */
    adoptedCallback() {
      console.log(
        "%c🦋%cgorgui-switch%c is has been adopted",
        "",
        "font-family: monospace; color: #00c6ff",
        ""
      );
    }

    _onKeyUp(event: KeyboardEvent) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) {
        return;
      }

      switch (event.keyCode) {
        case KEYCODE.SPACE:
          event.preventDefault();
          this._toggleChecked();
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }
    }

    _onClick(event: MouseEvent) {
      this._toggleChecked();
    }

    _toggleChecked() {
      if (this.disabled) {
        return;
      }

      this.checked = !this.checked;

      // Dispatch a change event
      // This event bubbles in order to mimic the native behavior of <input type=checkbox>
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            checked: this.checked
          },
          bubbles: true
        })
      );
    }

    _upgradeProperty(prop: string) {
      if (this.hasOwnProperty(prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  customElements.define("gorgui-switch", GorgUiSwitch);
})();
