import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App.jsx";
import Documentation from '../pages/Documentation/Documentation.jsx';
import AboutUs from '../pages/AboutUs/AboutUs.jsx';

function Routing() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path={'/'} element={<App />} />
                    <Route path={'/documentation'} element={<Documentation />} />
                    <Route path={'/about-us'} element={<AboutUs />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default Routing;