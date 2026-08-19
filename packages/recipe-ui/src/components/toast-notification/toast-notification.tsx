import { Component, h, Prop, State, Watch } from '@stencil/core';

type ToastType = 'success' | 'error' | 'info';

/** Auto-dismiss duration in milliseconds (documented default). */
const TOAST_DISMISS_MS = 3500;

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

  render() {
    if (!this.showing || !this.visible) {
      return null;
    }

    const kind = this.type === 'success' || this.type === 'error' ? this.type : 'info';

    return (
      <div
        class={{ toast: true, [`toast--${kind}`]: true }}
        part="root"
        role="status"
        aria-live="polite"
      >
        <span class="toast__message" part="message">
          {this.message}
        </span>
      </div>
    );
  }
}
