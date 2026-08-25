import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'form-input',
  styleUrl: 'form-input.css',
  shadow: true,
})
export class FormInput {
  @Prop() label = '';

  /** Controlled value from the parent. */
  @Prop() value = '';

  /** Validation message; empty/undefined hides the error region. */
  @Prop() error = '';

  @Prop() required = false;

  @Prop() disabled = false;

  /** Native input type (text, email, password, number, …). */
  @Prop() type = 'text';

  @Prop() name = '';

  @Prop() placeholder = '';

  /** Accessible autocomplete hint when relevant. */
  @Prop() autocomplete = '';

  @Event({ bubbles: true, composed: true }) valueChange!: EventEmitter<{ value: string; name: string }>;

  private inputId = `rf-input-${Math.random().toString(36).slice(2, 9)}`;
  private errorId = `rf-input-err-${Math.random().toString(36).slice(2, 9)}`;

  private onInput = (event: Event) => {
    const next = (event.target as HTMLInputElement).value;
    this.valueChange.emit({ value: next, name: this.name ?? '' });
  };

  render() {
    const hasError = Boolean(this.error?.trim());
    const describedBy = hasError ? this.errorId : undefined;

    return (
      <div class={{ field: true, 'field--error': hasError, 'field--disabled': this.disabled }} part="root">
        <label class="label" part="label" htmlFor={this.inputId}>
          {this.label}
          {this.required && (
            <span class="required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          id={this.inputId}
          class="input"
          part="input"
          type={this.type || 'text'}
          name={this.name || undefined}
          autocomplete={this.autocomplete || undefined}
          placeholder={this.placeholder || undefined}
          value={this.value ?? ''}
          required={this.required}
          disabled={this.disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={this.required ? 'true' : undefined}
          onInput={this.onInput}
        />
        {hasError && (
          <p id={this.errorId} class="error" part="error" role="alert">
            {this.error}
          </p>
        )}
      </div>
    );
  }
}
