import HeroBody from './HeroBody';
import HeroFoot from './HeroFoot';
import HeroHead from './HeroHead';

function Hero() {
  return (
    <section className="hero is-dark mb-5">
      <HeroHead />
      <HeroBody />
      <HeroFoot />
    </section>
  );
}

export default Hero;
