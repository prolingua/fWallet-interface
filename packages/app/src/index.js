import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import "./index.css";
import App from "./App";
import config from "./config/config";
import axios from "axios";

let healthyProviders = [];
const getHealthyProviders = async () => {
  for (const provider of config.providers) {
    try {
      await axios.get(provider.http);
    } catch (err) {
      if (err.message !== "Network Error") {
        healthyProviders.push(provider.http);
      } else {
        console.warn(`[GraphQL] provider "${provider.http}" is unhealthy`);
      }
    }
  }

  return healthyProviders;
};
getHealthyProviders();

let currentActiveLink = 0;
let switchToProvider = null;
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.warn(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Skip if already switching to healthy provider
    if (switchToProvider === healthyProviders[currentActiveLink]) {
      return;
    }

    currentActiveLink = (currentActiveLink + 1) % healthyProviders.length;
    switchToProvider = healthyProviders.length
      ? healthyProviders[currentActiveLink]
      : config.providers[0].http;

    client.setLink(
      ApolloLink.from([
        errorLink,
        createHttpLink({
          uri: switchToProvider,
        }),
      ])
    );

    console.info(`[GraphQL http] switch to provider ${switchToProvider}`);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache({ addTypename: true }),
  // uri: "/api",
  link: ApolloLink.from([
    errorLink,
    createHttpLink({
      uri: config.providers[0].http,
    }),
  ]),
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
