import React from 'react';

/**
 * ButtonGroup – groups Button components (or any clickable elements) together.
 *
 * Props:
 *   children   – button elements to render inside the group.
 *   vertical   – if true, stacks buttons vertically; default is horizontal.
 *   className  – additional CSS classes for custom styling.
 */
export default function ButtonGroup({ children, vertical = false, className = '' }) {
  const flexDirection = vertical ? 'flex-col' : 'flex-row';
  const count = React.Children.count(children);

  return (
    <div
      className={`inline-flex ${flexDirection} ${className}`.trim()}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const isFirst = index === 0;
        const isLast = index === count - 1;
        // Apply rounded corners on the outermost buttons and remove left border between siblings.
        const extraClasses = [];
        if (!vertical) {
          if (isFirst) extraClasses.push('rounded-l-md');
          if (isLast) extraClasses.push('rounded-r-md');
          extraClasses.push('border-l-0');
        } else {
          if (isFirst) extraClasses.push('rounded-t-md');
          if (isLast) extraClasses.push('rounded-b-md');
          extraClasses.push('border-t-0');
        }
        const combinedClass = `${child.props.className || ''} ${extraClasses.join(' ')}`.trim();
        return React.cloneElement(child, { className: combinedClass });
      })}
    </div>
  );
}
