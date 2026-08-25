import { Component, h, Prop, State, Watch } from '@stencil/core';

type ToastType = 'success' | 'error' | 'info' | 'warn';

/** Auto-dismiss duration in milliseconds (documented default). */
const TOAST_DISMISS_MS = 3500;

const TOAST_LABELS: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warn: 'Warning',
};

@Component({
  tag: 'toast-notification',
  styleUrl: 'toast-notification.css',
  shadow: true,
})
export class ToastNotification {
  @Prop() message = '';

  @Prop() type: ToastType = 'info';

  /** When false, the toast is hidden. Flipping false→true restarts the dismiss timer. */
  @Prop({ reflect: true }) visible = true;

  /** Override dismiss duration (ms). Defaults to 3500. */
  @Prop() duration = TOAST_DISMISS_MS;

  @State() private showing = true;

  private timer: ReturnType<typeof setTimeout> | undefined;

  componentWillLoad() {
    this.showing = this.visible;
    if (this.visible) {
      this.scheduleDismiss();
    }
  }

  disconnectedCallback() {
    this.clearTimer();
  }

  @Watch('visible')
  protected onVisibleChange(next: boolean) {
    this.showing = next;
    this.clearTimer();
    if (next) {
      this.scheduleDismiss();
    }
  }

  @Watch('message')
  @Watch('type')
  protected onContentChange() {
    if (this.visible) {
      this.showing = true;
      this.scheduleDismiss();
    }
  }

  private clearTimer() {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private scheduleDismiss() {
    this.clearTimer();
    const ms = typeof this.duration === 'number' && this.duration > 0 ? this.duration : TOAST_DISMISS_MS;
    this.timer = setTimeout(() => {
      this.showing = false;
    }, ms);
  }

  private normalizeType(): ToastType {
    if (this.type === 'success' || this.type === 'error' || this.type === 'warn') {
      return this.type;
    }
    return 'info';
  }

  private renderIcon(kind: ToastType) {
    switch (kind) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 9 9 15M9 9l6 6"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
            />
          </svg>
        );
      case 'warn':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 8v5M12 16h.01"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
            />
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" />
            <path d="M12 10v6M12 8h.01" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" />
          </svg>
        );
    }
  }

  render() {
    if (!this.showing || !this.visible) {
      return null;
    }

    const kind = this.normalizeType();
    const live = kind === 'error' || kind === 'warn' ? 'assertive' : 'polite';

    return (
      <div
        class={{ toast: true, [`toast--${kind}`]: true }}
        part="root"
        role={kind === 'error' ? 'alert' : 'status'}
        aria-live={live}
      >
        <span class="toast__icon" part="icon" aria-hidden="true">
          {this.renderIcon(kind)}
        </span>
        <div class="toast__body">
          <span class="toast__label" part="label">
            {TOAST_LABELS[kind]}
          </span>
          <span class="toast__message" part="message">
            {this.message}
          </span>
        </div>
      </div>
    );
  }
}
