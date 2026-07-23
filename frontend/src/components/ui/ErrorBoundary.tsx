import { Component, ErrorInfo, ReactNode } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { Ctx } from "../../hooks/useLocale";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  static contextType = Ctx;
  declare context: { locale: string; setLocale: (l: any) => void; t: (path: string) => string };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-dvh items-center justify-center bg-ph-light dark:bg-ph-black px-4">
          <div className="text-center max-w-md">
            <Shield className="mx-auto h-12 w-12 text-ph-orange mb-4" />
            <h1 className="text-xl font-black text-ph-text-dark dark:text-white mb-2">{this.context.t("errors.somethingWentWrong")}</h1>
            <p className="text-sm text-ph-text-muted mb-6">
              {this.state.error?.message || this.context.t("errors.unexpectedError")}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="ph-btn-primary ph-btn-sm mx-auto"
            >
              <RefreshCw className="h-4 w-4" />{this.context.t("errors.reloadPage")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
