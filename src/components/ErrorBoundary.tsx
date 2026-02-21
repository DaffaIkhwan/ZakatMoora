import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            try {
                return (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                        <AlertDescription>
                            <p className="font-semibold">{this.state.error && this.state.error.toString()}</p>
                            <details className="mt-2 text-xs opacity-70 cursor-pointer">
                                <summary>Detail Error</summary>
                                <pre className="whitespace-pre-wrap mt-1 p-2 bg-slate-950 text-slate-50 rounded">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        </AlertDescription>
                    </Alert>
                );
            } catch (e) {
                return (
                    <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
                        <h2>CRITICAL ERROR</h2>
                        <p>{this.state.error && this.state.error.toString()}</p>
                    </div>
                );
            }
        }

        return this.props.children;
    }
}
