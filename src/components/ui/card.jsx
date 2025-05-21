export function Card({ children, className = '' }) {
  return (
    <div className={`p-4 rounded-xl shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
