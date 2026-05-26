import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error to console for development/monitoring
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// In a real application, you might want to send this to an error reporting service
		// like Sentry, LogRocket, or Bugsnag

		this.setState({
			error,
			errorInfo,
		});
	}

	handleReset = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	render() {
		if (this.state.hasError) {
			// Error UI
			return (
				<div className="min-h-screen flex items-center justify-center bg-background p-4">
					<div className="max-w-md w-full text-center space-y-6">
						<div className="flex justify-center">
							<div className="rounded-full bg-destructive/10 p-4">
								<AlertCircle className="h-12 w-12 text-destructive" />
							</div>
						</div>

						<div className="space-y-2">
							<h1 className="text-2xl font-bold text-foreground">
								Oops! Algo salió mal
							</h1>
							<p className="text-muted-foreground">
								Ocurrió un error inesperado en la aplicación. Puedes intentar
								recargar la página o contactar soporte si el problema persiste.
							</p>
						</div>

						{/* Error details */}
						{this.state.error && (
							<div className="bg-muted p-4 rounded-lg text-left">
								<h3 className="font-semibold text-sm mb-2">Error Details:</h3>
								<pre className="text-xs text-muted-foreground overflow-auto">
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</div>
						)}

						<div className="flex gap-2 justify-center">
							<Button onClick={this.handleReset} variant="outline">
								<RefreshCw className="h-4 w-4 mr-2" />
								Intentar de nuevo
							</Button>
							<Button onClick={() => window.location.reload()}>
								Recargar página
							</Button>
						</div>

						<div className="text-sm text-muted-foreground border-t pt-4">
							Si el problema continúa, por favor reporta este error con los
							detalles técnicos mostrados arriba.
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
