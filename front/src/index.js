import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Starknet from './components/Starknet';
import CreatePoll from "./components/CreatePoll";
import ViewPoll from "./components/ViewPoll";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));


const routes = [
    {
        path: "/",
        element: <App />,
        // errorElement: <ErrorPage />,
        children: [
            {
                path: "/stark",
                element: <Starknet />,
            },
            {
                path: "/create",
                element: <CreatePoll />,
            },
            {
                path: "/view",
                element: <ViewPoll />,
            },
        ],
    },
];
const router = createBrowserRouter(routes);

root.render(
    <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
