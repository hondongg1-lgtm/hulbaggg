interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'text' | 'circle' | 'rectangle';
  count?: number;
  className?: string;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`}></div>
  );
}

export function SkeletonRectangle({ width = 'full', height = 'md' }: { width?: string; height?: 'sm' | 'md' | 'lg' }) {
  const heightClasses = {
    sm: 'h-20',
    md: 'h-40',
    lg: 'h-60'
  };

  const widthClass = width === 'full' ? 'w-full' : width;

  return (
    <div className={`${widthClass} ${heightClasses[height]} bg-gray-200 rounded-lg animate-pulse`}></div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonMarketplace() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-gray-100 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="h-28 bg-gradient-to-br from-gray-200 to-gray-300 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-full mb-2"></div>
            <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />;
      case 'list':
        return <SkeletonList count={count} />;
      case 'text':
        return <SkeletonText lines={count} />;
      case 'circle':
        return <SkeletonCircle />;
      case 'rectangle':
        return <SkeletonRectangle />;
      default:
        return <SkeletonCard />;
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}
