import { Component, Element, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';


@Component({
  tag: 'rf-modal',
  styleUrl: 'modal.css',
  shadow: true,
})
export class Modal {
  @Element() el!: HTMLElement;

  /** Whether the dialog is visible. */
  @Prop({ reflect: true }) open = false;

  /**
   * Dialog title (plan name: `title`).
   * Named `heading` to avoid clashing with the native HTMLElement `title` attribute.
   */
  @Prop() heading = '';

  @Prop() confirmLabel = 'Confirm';

  @Prop() cancelLabel = 'Cancel';

  /** Hide the confirm button when only dismiss is needed. */
  @Prop() hideConfirm = false;

  @Event() close!: EventEmitter<void>;

  @Event() confirm!: EventEmitter<void>;

  private previouslyFocused: HTMLElement | null = null;
  private dialogEl?: HTMLElement;
  private boundKeyDown = (event: KeyboardEvent) => this.onDocumentKeyDown(event);

  componentDidLoad() {
    if (this.open) {
      this.activate();
    }
  }

  disconnectedCallback() {
    this.teardown();
    this.restoreFocus();
  }

  @Watch('open')
  protected onOpenChange(isOpen: boolean) {
    if (isOpen) {
      this.activate();
    } else {
      this.teardown();
      this.restoreFocus();
    }
  }

  private activate() {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', this.boundKeyDown, true);
    requestAnimationFrame(() => this.focusFirst());
  }

  private teardown() {
    document.removeEventListener('keydown', this.boundKeyDown, true);
  }

  private restoreFocus() {
    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      try {
        this.previouslyFocused.focus();
      } catch {
        /* ignore */
      }
    }
    this.previouslyFocused = null;
  }

  private focusable(): HTMLElement[] {
    if (!this.dialogEl) {
      return [];
    }
    const nodes = this.dialogEl.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    return Array.from(nodes);
  }

  private focusFirst() {
    const items = this.focusable();
    (items[0] ?? this.dialogEl)?.focus();
  }

  private onDocumentKeyDown(event: KeyboardEvent) {
    if (!this.open) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const items = this.focusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.el.shadowRoot?.activeElement as HTMLElement | null;

    if (event.shiftKey && (active === first || !active)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private onBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  };

  private onCancel = () => {
    this.close.emit();
  };

  private onConfirm = () => {
    this.confirm.emit();
  };

  render() {
    if (!this.open) {
      return null;
    }

    return (
      <div class="backdrop" part="backdrop" onClick={this.onBackdropClick}>
        <div
          class="dialog"
          part="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rf-modal-title"
          tabindex={-1}
          ref={(el) => (this.dialogEl = el)}
        >
          <header class="header" part="header">
            <h2 id="rf-modal-title" class="heading" part="heading">
              {this.heading}
            </h2>
          </header>
          <div class="body" part="body">
            <slot />
          </div>
          <footer class="footer" part="footer">
            <button type="button" class="btn btn--ghost" part="cancel" onClick={this.onCancel}>
              {this.cancelLabel}
            </button>
            {!this.hideConfirm && (
              <button type="button" class="btn btn--primary" part="confirm" onClick={this.onConfirm}>
                {this.confirmLabel}
              </button>
            )}
          </footer>
        </div>
      </div>
    );
  }
}
