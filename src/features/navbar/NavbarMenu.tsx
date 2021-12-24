import { useAppSelector } from '../../app/hooks';
import { Icon, IconSize, IconStyle } from '../../utils';

export interface NavbarMenuProps {
  id: string;
}

export function NavbarMenu({ id }: NavbarMenuProps) {
  const hidden = useAppSelector((state) => state.navbarMenu.hidden);
  const className = `navbar-menu ${hidden ? '' : 'is-active'}`;
  return (
    <div id={id} className={className}>
      <div className="navbar-end">
        <a className="navbar-item" href="https://github.com/dillonredding" target="_blank" rel="noreferrer">
          <Icon name="github" style={IconStyle.Brands} size={IconSize.Large} />
        </a>
        <a className="navbar-item" href="https://twitter.com/dillon_redding" target="_blank" rel="noreferrer">
          <Icon name="twitter" style={IconStyle.Brands} size={IconSize.Large} />
        </a>
        <a className="navbar-item" href="https://dillonredding.medium.com" target="_blank" rel="noreferrer">
          <Icon name="medium" style={IconStyle.Brands} size={IconSize.Large} />
        </a>
      </div>
    </div>
  );
}

export default NavbarMenu;
