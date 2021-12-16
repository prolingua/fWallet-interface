import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import "./index.css";
import App from "./App";
import config from "./config/config";

const link = createHttpLink({
  uri: config.providers[0].http,
  // headers: { authorization: token },  // The token in the auth header will be removed when the cookie approach is working)
});
const client = new ApolloClient({
  cache: new InMemoryCache(),
  // uri: "/api",
  link,
  connectToDevTools: process.env.NODE_ENV === "development",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById("root")
);
