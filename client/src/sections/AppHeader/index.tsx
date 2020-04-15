import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Input, Layout } from "antd";
import { MenuItems } from "./components";
import { Viewer } from "../../lib/types";
import logo from "./assets/recat-logo.png";
import { displayErrorMessage } from "../../lib/utils";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Search } = Input;
const { Header } = Layout;

export const AppHeader = ({ viewer, setViewer }: Props) => {
  const [search, setSearch] = useState("");

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    const pathnameSubstrings = pathname.split("/");

    if (!pathname.includes("/listings")) {
      setSearch("");
      return;
    }

    if (pathname.includes("/listings") && pathnameSubstrings.length === 3) {
      setSearch(pathnameSubstrings[2]);
      return;
    }
  }, [location]);

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("Please enter a valid search!");
    }
  };

  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="Recat Logo" />
          </Link>
        </div>
        <div className="app-header__search-input">
          <Search
            placeholder="Search 'London'"
            enterButton
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
            onSearch={onSearch}
          />
        </div>
      </div>
      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};
