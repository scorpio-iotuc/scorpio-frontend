import MenuIcon from '../MenuIcon/MenuIcon.jsx';
import { useNavbarContext } from "../../useNavbarContext";
import { useSignupMode } from '../../../../hooks/useSignupMode';
import './Menu.css';

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
                <h3>Cuenta</h3>
                <a href="/login">Login</a>
                {showRegister && <a href="/signup">Register</a>}
            </div>
        </>
    );
};

export const MenuToggle = () => {
    return <MenuIcon />;
};
