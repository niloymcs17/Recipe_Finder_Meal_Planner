import { Component, h } from '@stencil/core';

/**
 * Throwaway smoke component so the library builds with zero feature components.
 * Remove when Phase 04 adds real components.
 */
@Component({
  tag: 'rf-stub',
  shadow: true,
})
export class RfStub {
  render() {
    return <div part="root" />;
  }
}
