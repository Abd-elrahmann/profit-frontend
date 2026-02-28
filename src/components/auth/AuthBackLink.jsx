import React from "react";
import { Link } from "react-router-dom";
import { MdArrowBack as ArrowBackIcon } from "react-icons/md";
import { AUTH_LINK_STYLE } from "./authConstants";
const AuthBackLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      ...AUTH_LINK_STYLE,
      display: "inline-flex",
      alignItems: "center",
    }}
  >
    <ArrowBackIcon style={{ marginLeft: 4 }} />
    {children}
  </Link>
);
export default AuthBackLink;