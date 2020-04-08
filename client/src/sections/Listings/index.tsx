import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/react-hooks";
import { RouteComponentProps, Link } from "react-router-dom";
import { Layout, List, Typography } from "antd";
import { ListingCard, ErrorBanner } from "../../lib/components";
import { LISTINGS } from "../../lib/graphql/queries";
import {
  Listings as ListingsData,
  ListingsVariables,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import {
  ListingsFilters,
  ListingsPagination,
  ListingsSkeleton,
} from "./components";

const { Content } = Layout;
const { Paragraph, Title } = Typography;
const PAGE_LIMIT = 8;

interface MatchParams {
  location: string;
}

export const Listings = ({ match }: RouteComponentProps<MatchParams>) => {
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(1);
  const locationRef = useRef(match.params.location);
  const { loading, data, error } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      skip: locationRef.current !== match.params.location && page !== 1,
      variables: {
        location: match.params.location,
        filter,
        limit: PAGE_LIMIT,
        page,
      },
    }
  );

  useEffect(() => {
    setPage(1);
    locationRef.current = match.params.location;
  }, [match.params.location]);

  if (loading || error) {
    return (
      <Content className="listings">
        {error ? (
          <ErrorBanner description="We either couldn't anything matching your search or have encountered an error. If you're searching for a unique location, try searching again with more common keywords." />
        ) : null}
        <ListingsSkeleton />
      </Content>
    );
  }

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  ) : null;

  const listingsSectionElement =
    listings && listings.result.length ? (
      <div>
        <ListingsPagination
          total={listings.total}
          page={page}
          limit={PAGE_LIMIT}
          setPage={setPage}
        />
        <ListingsFilters filter={filter} setFilter={setFilter} />
        <List
          grid={{
            gutter: 8,
            xs: 1,
            sm: 2,
            lg: 4,
          }}
          dataSource={listings.result}
          renderItem={(listing) => (
            <List.Item>
              <ListingCard listing={listing} />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div>
        <Paragraph>
          It appears that no listings have yet been created for "
          {listingsRegion}"
        </Paragraph>
        <Paragraph>
          Be the first person to create a{" "}
          <Link to="/host">listing in this area</Link>!
        </Paragraph>
      </div>
    );

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
