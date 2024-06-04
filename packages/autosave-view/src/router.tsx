import { createHashRouter, RouterProvider } from "react-router-dom";

import Autosave from "./Autosave";
import Helper from "./Helper";

const router = createHashRouter([
  {
    path: "/",
    element: <Autosave />,
  },
  {
    path: "/helper/:type",
    element: <Helper />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
