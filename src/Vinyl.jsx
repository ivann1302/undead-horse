import vinylImage from '../vinyl.png';

export default function Vinyl() {
  return (
    <div className="vinyl-wrapper" aria-label="Vinyl record">
      <span className="vinyl-halo" aria-hidden="true" />
      <img
        className="vinyl"
        src={vinylImage}
        alt=""
        draggable="false"
      />
      <span className="vinyl-shine" aria-hidden="true" />
    </div>
  );
}
