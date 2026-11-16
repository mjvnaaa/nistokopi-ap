export function CatalogSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr">Memuat katalog.</p>
      <div className="skel-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skel" key={index}>
            <div className="sk-tile" />
            <div className="sk-body">
              <span className="sk-line" style={{ width: "42%" }} />
              <span className="sk-line" style={{ width: "88%" }} />
              <span className="sk-line" style={{ width: "70%" }} />
              <span className="sk-line" style={{ width: "55%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
