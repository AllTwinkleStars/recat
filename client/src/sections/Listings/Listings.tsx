import React from "react";
import { server, useQuery } from "../../lib/api";
import { DeleteListingData, DeleteListingVariables, ListingsData } from "./types";

const LISTINGS = `
  query Listings {
    listings {
      id
      title
      image
      address
      price
      numOfGuests
      numOfBeds
      numOfBaths
      rating
    }
  }
`;

const DELETE_LISTING = `
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      id
    }
  }
`;

interface Props {
  title: string;
}

export const Listings = ({ title }: Props) => {

  const { data } = useQuery<ListingsData>(LISTINGS);

  const deleteListing = async (id: string) => {
    const { data } = await server.fetch<DeleteListingData, DeleteListingVariables>({
      query: DELETE_LISTING,
      variables: {
        id
      }
    });
  }

  const listings = data ? data.listings : null;

  const listingsList = (
    <ul>
      {listings?.map(listing => {
        return (
          <li key={listing.id}>
            {listing.title}
            <button onClick={() => deleteListing(listing.id)}>Delete</button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div>
      <h2>{title}</h2>
      {listingsList}
    </div>
  );
};
