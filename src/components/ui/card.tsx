import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function Card({ className = '', ...props }: DivProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
}

function CardTitle({ className = '', ...props }: DivProps) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
}

function CardDescription({ className = '', ...props }: DivProps) {
  return <p className={`text-sm text-slate-600 ${className}`} {...props} />;
}

function CardContent({ className = '', ...props }: DivProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

function CardFooter({ className = '', ...props }: DivProps) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };