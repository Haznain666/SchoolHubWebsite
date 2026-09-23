import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** called once, when the 3D layer has failed for good */
  onError: () => void;
}

interface State {
  failed: boolean;
}

/**
 * Anything thrown by the 3D layer — a WebGL context that never arrives, a
 * `.glb` that 404s, a Draco decoder that will not instantiate — is caught here
 * and reported up, so <BotLayer> can keep the `schoolbot.png` composition on
 * screen instead of blanking the page (CHANGES-V2 §B.2).
 */
export class BotBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.warn('[school-hub] 3D layer unavailable, using the static bot.', error, info);
    this.props.onError();
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
