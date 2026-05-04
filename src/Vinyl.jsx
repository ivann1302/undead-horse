import FlameRing from './FlameRing.jsx';
import vinylImage from '../vinyl3.png';

export default function Vinyl() {
  return (
    <div className="vinyl-wrapper" data-light-mode="natural" aria-label="Vinyl record">
      <FlameRing />
      <span className="vinyl-corona" aria-hidden="true">
        <span className="solar-flare solar-flare-1" aria-hidden="true" />
        <span className="solar-flare solar-flare-2" aria-hidden="true" />
        <span className="solar-flare solar-flare-3" aria-hidden="true" />
        <span className="solar-flare solar-flare-4" aria-hidden="true" />
        <span className="solar-flare solar-flare-5" aria-hidden="true" />
        <span className="solar-flare solar-flare-6" aria-hidden="true" />
        <span className="solar-flare solar-flare-7" aria-hidden="true" />
      </span>
      <img
        className="vinyl"
        src={vinylImage}
        alt=""
        draggable="false"
      />
      <span className="vinyl-light-window" aria-hidden="true">
        <span className="vinyl-light-haze" aria-hidden="true" />
        <span className="vinyl-light-core" aria-hidden="true" />
        <span className="vinyl-light-streak" aria-hidden="true" />
        <span className="vinyl-light-edge" aria-hidden="true" />
      </span>
      <span className="vinyl-shine" aria-hidden="true" />
    </div>
  );
}
