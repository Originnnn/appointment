export default function Card({ 
  children, 
  className = "",
  hover = false,
  onClick,
  role,
  tabIndex
}) {
  const hoverStyles = hover ? "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer transition-all duration-300" : "";
  const interactiveProps = onClick ? {
    onClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    },
    role: role || "button",
    tabIndex: tabIndex ?? 0
  } : {};

  return (
    <div 
      className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${hoverStyles} ${className}`}
      {...interactiveProps}
    >
      {children}
    </div>
  );
}
