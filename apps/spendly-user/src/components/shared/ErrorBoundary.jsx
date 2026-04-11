import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center pb-20">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6" style={{ background: '#FFF1F2' }}>
            <span className="text-4xl">😔</span>
          </div>
          <h2 className="text-[24px] font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>Oops! Something broke.</h2>
          <p className="text-[15px] text-[#64748B] mb-8 leading-relaxed max-w-[280px]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Don't worry, your data is safe globally. Just reload the app.
          </p>
          <button onClick={() => window.location.reload()}
            className="w-full max-w-[300px] py-4 rounded-[16px] text-white text-[15px] font-bold"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)', fontFamily: "'Nunito', sans-serif" }}>
            Reload Spendly
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
