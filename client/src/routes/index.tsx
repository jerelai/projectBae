import React from "react";
import { useRoutes } from "react-router-dom";
import NotFoundPage from 'pages/NotFound';
import Character from "pages/Character";
import Settings from "pages/Settings";

/** Router */
export function Router() {
    return useRoutes([
        {
            path: "/",
            element: <Character />,
        },
        {
            path: "/settings",
            element: <Settings />,
        },
        {
            path: '*',
            element: <NotFoundPage />
        }
    ]);
}
