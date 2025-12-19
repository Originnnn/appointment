export default function ErrorMessage({ 
  message, 
  onRetry, 
  type = "error" // "error", "warning", "info"
}) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const icons = {
    error: "⚠️",
    warning: "⚡",
    info: "ℹ️"
  };

  return (
    <div className={`${styles[type]} border-2 rounded-lg p-4 mb-4 animate-shake`} role="alert">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">{icons[type]}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              aria-label="Thử lại"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
