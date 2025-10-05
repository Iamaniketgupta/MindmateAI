const FeatureCard = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) => {
  return (
   <div
      className={`glass border border-glass-border rounded-2xl
                  hover-lift hover:shadow-[var(--color-shadow-glow)]
                  p-8 group cursor-pointer ${className}`}
    >
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-gray-primary" /> {/* Render as JSX */}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {children && (
        <div className="mt-6 pt-6 border-t border-glass-border/50">
          {children}
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
