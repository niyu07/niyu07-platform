import * as React from 'react';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, className = '', children }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`} role="radiogroup">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childElement = child as React.ReactElement<any>;
            return React.cloneElement(childElement, {
              checked: childElement.props.value === value,

              onChange: () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange?.((childElement.props as any).value),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className = '', ...props }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={`h-4 w-4 rounded-full border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';
