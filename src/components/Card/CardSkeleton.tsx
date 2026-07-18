import './Card.css'

function CardSkeleton() {
  return (
    <div className="card card--skeleton" data-testid="card-skeleton">
      <div className="card__media skeleton" />
    </div>
  )
}

export default CardSkeleton
