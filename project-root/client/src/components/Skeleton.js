import React from 'react';

/**
 * Production-level Skeleton Loading System
 *
 * Usage:
 * <Skeleton />
 * <SkeletonText lines={3} />
 * <SkeletonCard />
 * <SkeletonTable rows={6} />
 */

const skeletonBaseStyle = {
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--bg-elevated, #1e293b)',
  borderRadius: 8,
};

const shimmerStyle = {
  position: 'absolute',
  inset: 0,
  transform: 'translateX(-100%)',
  background:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 60%, transparent 100%)',
  animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
};

function Shimmer() {
  return <span aria-hidden="true" style={shimmerStyle} />;
}

/**
 * Base skeleton block
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={{
        ...skeletonBaseStyle,
        width,
        height,
        borderRadius,
        ...style,
      }}
    >
      <Shimmer />
    </div>
  );
}

/**
 * Skeleton text
 */
export function SkeletonText({
  lines = 2,
  lastLineWidth = '65%',
  gap = 8,
}) {
  return (
    <div
      aria-label="Loading content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={12}
          width={
            index === lines - 1
              ? lastLineWidth
              : '100%'
          }
          borderRadius={6}
        />
      ))}
    </div>
  );
}

/**
 * Dashboard / statistic card skeleton
 */
export function SkeletonCard({
  showIcon = true,
}) {
  return (
    <div
      className="card"
      aria-label="Loading card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 20,
        minHeight: 150,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <Skeleton
            width="45%"
            height={12}
            borderRadius={6}
            style={{ marginBottom: 12 }}
          />

          <Skeleton
            width="70%"
            height={28}
            borderRadius={7}
          />
        </div>

        {showIcon && (
          <Skeleton
            width={42}
            height={42}
            borderRadius={12}
          />
        )}
      </div>

      <Skeleton
        width="85%"
        height={10}
        borderRadius={5}
      />
    </div>
  );
}

/**
 * File / data table skeleton
 */
export function SkeletonTable({
  rows = 6,
}) {
  return (
    <div
      className="card"
      aria-label="Loading files"
      aria-busy="true"
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 100px 100px 120px',
          gap: 16,
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom:
            '1px solid var(--border-subtle)',
        }}
      >
        <Skeleton
          width="55px"
          height={10}
          borderRadius={5}
        />

        <Skeleton
          width="40px"
          height={10}
          borderRadius={5}
        />

        <Skeleton
          width="40px"
          height={10}
          borderRadius={5}
        />

        <Skeleton
          width="60px"
          height={10}
          borderRadius={5}
        />
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index} />
      ))}
    </div>
  );
}

/**
 * Individual table row
 */
export function SkeletonTableRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          '1fr 100px 100px 120px',
        gap: 16,
        alignItems: 'center',
        padding: '12px 16px',
        minHeight: 64,
        borderBottom:
          '1px solid var(--border-subtle)',
      }}
    >
      {/* File information */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
        }}
      >
        <Skeleton
          width={36}
          height={36}
          borderRadius={10}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Skeleton
            width="55%"
            height={12}
            borderRadius={6}
            style={{ marginBottom: 8 }}
          />

          <Skeleton
            width="30%"
            height={8}
            borderRadius={4}
          />
        </div>
      </div>

      {/* Size */}
      <Skeleton
        width="55px"
        height={10}
        borderRadius={5}
      />

      {/* Type */}
      <Skeleton
        width="45px"
        height={10}
        borderRadius={5}
      />

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <Skeleton
          width={28}
          height={28}
          borderRadius={8}
        />

        <Skeleton
          width={28}
          height={28}
          borderRadius={8}
        />

        <Skeleton
          width={28}
          height={28}
          borderRadius={8}
        />
      </div>
    </div>
  );
}

/**
 * Grid/card skeleton
 */
export function SkeletonGrid({
  count = 6,
}) {
  return (
    <div
      className="grid-4"
      style={{ gap: 14 }}
      aria-label="Loading files"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="card card-pad"
          key={index}
          style={{
            textAlign: 'center',
          }}
        >
          <Skeleton
            width={52}
            height={52}
            borderRadius={12}
            style={{
              margin: '0 auto 12px',
            }}
          />

          <Skeleton
            width="75%"
            height={12}
            borderRadius={6}
            style={{
              margin: '0 auto 8px',
            }}
          />

          <Skeleton
            width="45%"
            height={9}
            borderRadius={5}
            style={{
              margin: '0 auto 14px',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Skeleton
              width={28}
              height={28}
              borderRadius={8}
            />

            <Skeleton
              width={28}
              height={28}
              borderRadius={8}
            />

            <Skeleton
              width={28}
              height={28}
              borderRadius={8}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = 40,
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
    />
  );
}

/**
 * Export default for convenience
 */
export default Skeleton;