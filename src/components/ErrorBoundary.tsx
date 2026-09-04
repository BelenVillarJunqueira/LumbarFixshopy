import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4">
                        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">
                            Ha ocurrido un detalle visual
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Ocurrió un error inesperado al renderizar el componente. Podés recargar la página o reiniciar la vista sin perder tus datos.
                        </p>
                        {this.state.error?.message && (
                            <div className="p-3 bg-slate-100 rounded-lg text-left overflow-auto max-h-24">
                                <code className="text-xs text-rose-600 font-mono">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-md"
                            >
                                Reintentar vista
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Recargar página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
