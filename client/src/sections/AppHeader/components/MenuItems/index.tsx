import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import { Button, Menu, Avatar } from "antd";
import { HomeOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Viewer } from "../../../../lib/types";
import { displaySuccessNotification, displayErrorMessage } from "../../../../lib/utils";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {

  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: data => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem("token");
        displaySuccessNotification("You've successfully logged out!");
      }
    },
    onError: () => {
      displayErrorMessage("Sorry! We weren't able to log you out. Please tr again later!");
    }
  });

  const handleLogOut = () => {
    logOut();
  }

  const subMenuLogin = viewer.id && viewer.avatar ? (
    <SubMenu title={<Avatar src={viewer.avatar} />}>
      <Item key={`/user/${viewer.id}`}>
        <Link to={`/user/${viewer.id}`}>
          <UserOutlined />
          Profile
        </Link>
      </Item>
      <Item key="/logout">
        <div onClick={handleLogOut}>
          <LogoutOutlined />
          Log out
        </div>
      </Item>
    </SubMenu>
  ) : (
      <Item key="/login">
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
}
