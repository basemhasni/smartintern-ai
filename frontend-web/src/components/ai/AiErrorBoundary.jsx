import React from 'react';

class AiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(`AI block render error: ${this.props.title || 'AI'}`, error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="rounded-stitch border border-amber-200 bg-amber-50 p-5" role="alert">
        <p className="text-sm font-black text-amber-900">{this.props.title || 'Analyse IA indisponible'}</p>
        <p className="mt-2 text-sm leading-6 text-amber-800">Ce bloc n a pas pu afficher la reponse recue. Le reste de la page reste utilisable.</p>
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-black text-amber-900 shadow-panel" type="button" onClick={() => this.setState({ hasError: false })}>
          Reessayer
        </button>
      </section>
    );
  }
}

export default AiErrorBoundary;
