function DetailSkeleton() {
  return (
    <div className="detail">
      <div className="detail__hero detail__hero--skeleton" data-testid="detail-skeleton-hero">
        <div className="detail__hero-overlay">
          <div className="detail__poster skeleton" />
          <div className="detail__info">
            <div className="skeleton detail__skeleton-line detail__skeleton-line--title" />
            <div className="skeleton detail__skeleton-line detail__skeleton-line--meta" />
            <div className="skeleton detail__skeleton-line detail__skeleton-line--overview" />
            <div className="skeleton detail__skeleton-line detail__skeleton-line--overview" />
          </div>
        </div>
      </div>

      <section className="detail__trailers">
        <div className="skeleton detail__skeleton-line detail__skeleton-line--heading" />
        <div className="detail__trailer-tabs">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton detail__trailer-tab-skeleton" />
          ))}
        </div>
        <div className="skeleton detail__trailer-active-skeleton" />
      </section>
    </div>
  )
}

export default DetailSkeleton
