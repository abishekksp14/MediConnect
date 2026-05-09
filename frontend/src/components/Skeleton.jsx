import './Skeleton.css';

const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '0.5rem', className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <Skeleton width="48px" height="48px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.75rem" width="40%" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
    <Skeleton height="0.75rem" />
    <Skeleton height="0.75rem" width="80%" />
  </div>
);

export default Skeleton;
