import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { Col, Layout, Row } from "antd";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { USER } from "../../lib/graphql/queries";
import { Viewer } from "../../lib/types";
import { UserProfile } from "./components";
import {
  User as UserData,
  UserVariables
} from "../../lib/graphql/queries/User/__generated__/User";

interface Props {
  viewer: Viewer;
}

interface MatchParams {
  id: string;
}

const { Content } = Layout;

export const User = ({ viewer, match }: Props & RouteComponentProps<MatchParams>) => {
  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id
    }
  });

  if (loading || error) {
    return (
      <Content className="user">
        {error ?
          <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
          : null
        }
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null;
  const viewerIsUser = viewer.id === match.params.id;

  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} />
  ) : null;

  return (
    <Content className="user">
      <Row gutter={12} justify="center">
        <Col xs={12}>{userProfileElement}</Col>
      </Row>
    </Content>
  )
};
