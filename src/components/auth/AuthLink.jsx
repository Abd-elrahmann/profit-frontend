import React from "react";
import { Link } from "react-router-dom";
import { AUTH_LINK_STYLE } from "./authConstants";
const AuthLink = ({ to, children }) => (
  <Link to={to} style={AUTH_LINK_STYLE}>
    {children}
  </Link>
);
export default AuthLink;