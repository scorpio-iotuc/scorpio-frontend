import MenuIcon from '../MenuIcon/MenuIcon.jsx';
import { useNavbarContext } from "../../useNavbarContext";
import { useSignupMode } from '../../../../hooks/useSignupMode';
import './Menu.css';
import {Link} from 'react-router';

export const Menu = () => {
    const { isOpen } = useNavbarContext();

    return (
        <div className={`menu ${isOpen ? "menu-open" : ""}`}>
            <MenuItems />
        </div>
    );
};

const MenuItems = () => {
    const { signupMode, loading } = useSignupMode();
    const showRegister = !loading && signupMode === 'public';

    return (
        <>
            <div className="menu-section">
                <Link to="/login">Login</Link>
                {showRegister && <Link to="/signup">Register</Link>}
                <Link to="/documentation">Documentation</Link>
                <Link to="/about-us">About us</Link>
            </div>
        </>
    );
};

export const MenuToggle = () => {
    return <MenuIcon />;
};
